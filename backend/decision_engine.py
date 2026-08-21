"""
Explicit Policy Engine with Hard Stopping Rules
Maps (root_cause, attempt_number, risk_verdict) -> Action
Enforces non-negotiable hard rules in plain Python code.
"""

from config import MAX_ATTEMPTS_PER_PAYMENT, MAX_MESSAGES_PER_7_DAYS, RETRY_DELAYS

# Actions that involve sending a customer-facing message
CUSTOMER_FACING_ACTIONS = {"send_card_update_link", "send_mandate_reauth_link"}

def decide_recovery_action(payment_record: dict, root_cause_info: dict, risk_info: dict) -> dict:
    """
    Evaluates policy matrix and hard stopping rules.
    Returns:
    {
        "action": str,
        "retry_delay_days": int or None,
        "stopping_rule_triggered": str or None,
        "policy_reasoning": str
    }
    """
    root_cause = root_cause_info.get("root_cause")
    attempt_number = payment_record.get("attempt_number", 0)
    risk_verdict = risk_info.get("verdict")
    days_since_last_message = payment_record.get("days_since_last_message")
    
    stopping_rule_triggered = None
    
    # ---------------------------------------------------------
    # HARD STOPPING RULE #1: Claude Risk Verdict Override
    # ---------------------------------------------------------
    if risk_verdict == "stop_and_flag":
        stopping_rule_triggered = "Risk Assessment Override: Claude Verdict = stop_and_flag"
        return {
            "action": "stop_and_flag",
            "retry_delay_days": None,
            "stopping_rule_triggered": stopping_rule_triggered,
            "policy_reasoning": "Immediately stopped & flagged due to high risk assessment."
        }
        
    # ---------------------------------------------------------
    # HARD STOPPING RULE #2: Maximum Attempt Threshold (Max 4)
    # ---------------------------------------------------------
    if attempt_number >= MAX_ATTEMPTS_PER_PAYMENT:
        stopping_rule_triggered = f"Hard Rule Triggered: Maximum attempt limit reached ({attempt_number} >= {MAX_ATTEMPTS_PER_PAYMENT})"
        return {
            "action": "stop_and_flag",
            "retry_delay_days": None,
            "stopping_rule_triggered": stopping_rule_triggered,
            "policy_reasoning": "Payment failed maximum allowed retries. Case closed to prevent excessive charges."
        }

    # ---------------------------------------------------------
    # POLICY MATRIX MAPPING: (root_cause, attempt_number) -> action
    # ---------------------------------------------------------
    proposed_action = "retry_scheduled"
    retry_delay = RETRY_DELAYS.get("default_retry", 2)
    policy_reasoning = ""
    
    if root_cause == "insufficient_funds":
        if attempt_number in [0, 1]:
            proposed_action = "retry_scheduled"
            retry_delay = RETRY_DELAYS.get("insufficient_funds", 3)
            policy_reasoning = f"Insufficient funds detected. Scheduling retry in {retry_delay} days to align with account top-up/salary cycle."
        elif attempt_number == 2:
            proposed_action = "send_card_update_link"
            retry_delay = None
            policy_reasoning = "Multiple insufficient funds declines. Sending customer payment method update link."
        else:
            proposed_action = "escalate_human_followup"
            retry_delay = None
            policy_reasoning = "Persistent balance issue after 3 attempts. Escalating to human customer success team."

    elif root_cause == "expired_card":
        proposed_action = "send_card_update_link"
        retry_delay = None
        policy_reasoning = "Card expired. Direct payment retries will fail. Sending Razorpay Card Update Payment Link."

    elif root_cause == "expired_mandate":
        proposed_action = "send_mandate_reauth_link"
        retry_delay = None
        policy_reasoning = "Subscription mandate authorization expired. Generating Mandate Re-authorization Link."

    elif root_cause == "technical_error":
        if attempt_number < 2:
            proposed_action = "retry_immediate"
            retry_delay = 0
            policy_reasoning = "Transient bank server glitch. Immediate execution retry is safe and optimal."
        else:
            proposed_action = "retry_scheduled"
            retry_delay = 1
            policy_reasoning = "Repeated bank tech error. Delaying retry by 24 hours for bank recovery."

    elif root_cause == "unapproved_mandate":
        proposed_action = "send_mandate_reauth_link"
        retry_delay = None
        policy_reasoning = "Mandate pre-approval missing. Sending customer mandate re-authorization notification."

    elif root_cause == "hard_decline":
        proposed_action = "stop_and_flag"
        retry_delay = None
        stopping_rule_triggered = "Policy Matrix: Hard decline code forbids further automated retries"
        policy_reasoning = "Issuing bank issued hard decline (stolen/blocked). No automated retries allowed."

    else:
        proposed_action = "retry_scheduled"
        retry_delay = 2
        policy_reasoning = "Standard automated payment retry scheduled."

    # ---------------------------------------------------------
    # HARD STOPPING RULE #3: Customer Messaging Rate Limit (Max 1 msg per 7 days)
    # ---------------------------------------------------------
    if proposed_action in CUSTOMER_FACING_ACTIONS:
        if days_since_last_message is not None and days_since_last_message < 7:
            stopping_rule_triggered = f"Rate Limit Triggered: Customer messaged {days_since_last_message} days ago (< 7 days limit)"
            # Downgrade action to quiet retry or human escalation to avoid spamming customer
            if root_cause in ["expired_card", "expired_mandate"]:
                proposed_action = "escalate_human_followup"
                retry_delay = None
                policy_reasoning += " (Messaging rate-limited: Escalated internally without sending SMS/Email)"
            else:
                proposed_action = "retry_scheduled"
                retry_delay = 3
                policy_reasoning += " (Messaging rate-limited: Converted to silent scheduled retry)"

    return {
        "action": proposed_action,
        "retry_delay_days": retry_delay,
        "stopping_rule_triggered": stopping_rule_triggered,
        "policy_reasoning": policy_reasoning
    }
