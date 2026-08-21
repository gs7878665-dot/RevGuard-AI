import random
from config import SUCCESS_PROBABILITIES, RANDOM_SEED

def simulate_outcome(payment_record: dict, root_cause_info: dict, action_info: dict, seed_offset: int = 0) -> dict:
    """
    Simulates recovery outcome (success / failed / pending_customer / stopped)
    using defensible probability matrix defined in config.py.
    """
    root_cause = root_cause_info.get("root_cause")
    action = action_info.get("action")
    amount = payment_record.get("amount", 0)
    payment_id = payment_record.get("payment_id", "")
    
    # Use deterministic random seed per payment for consistent simulation results
    # Salt seed with payment_id hash so each item has reproducible outcome
    item_seed = RANDOM_SEED + abs(hash(payment_id)) % 10000 + seed_offset
    rng = random.Random(item_seed)

    if action == "stop_and_flag":
        return {
            "outcome": "stopped",
            "amount_recovered": 0,
            "success_probability_used": 0.0,
            "outcome_reasoning": "Case stopped by safety policy / hard stop rule. No recovery attempted."
        }

    if action == "escalate_human_followup":
        # Escalations have a 25% human resolution rate
        prob = 0.25
        is_success = rng.random() < prob
        return {
            "outcome": "recovered" if is_success else "escalated_pending",
            "amount_recovered": amount if is_success else 0,
            "success_probability_used": prob,
            "outcome_reasoning": "Escalated to human support team. " + ("Customer resolved invoice with CS agent." if is_success else "Awaiting customer response.")
        }

    # Fetch probability from config.py matrix
    lookup_key = (root_cause, action)
    prob = SUCCESS_PROBABILITIES.get(lookup_key)
    
    # Generic fallback if exact pair not explicitly listed
    if prob is None:
        if action in ["retry_immediate", "retry_scheduled"]:
            prob = 0.30
        elif action in ["send_card_update_link", "send_mandate_reauth_link"]:
            prob = 0.50
        else:
            prob = 0.10

    is_success = rng.random() < prob
    
    if is_success:
        outcome = "recovered"
        recovered_amount = amount
        reason = f"Recovery action ({action}) succeeded based on benchmark probability {int(prob*100)}%."
    else:
        outcome = "failed"
        recovered_amount = 0
        reason = f"Recovery attempt ({action}) failed to collect funds (benchmark success rate: {int(prob*100)}%)."

    return {
        "outcome": outcome,
        "amount_recovered": recovered_amount,
        "success_probability_used": prob,
        "outcome_reasoning": reason
    }
