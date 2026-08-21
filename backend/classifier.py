"""
Deterministic Root Cause Classifier (No LLM Call)
Maps Razorpay / Banking failure_code directly to standard root cause categories.
"""

CLASSIFICATION_MAP = {
    "insufficient_funds": {
        "root_cause": "insufficient_funds",
        "reasoning": "Customer account balance insufficient at recurring mandate execution time."
    },
    "card_expired": {
        "root_cause": "expired_card",
        "reasoning": "Debit/Credit card associated with recurring payment mandate has expired."
    },
    "mandate_expired": {
        "root_cause": "expired_mandate",
        "reasoning": "Recurring payment mandate authorization validity window has ended."
    },
    "bank_technical_error": {
        "root_cause": "technical_error",
        "reasoning": "Transient issuer bank server processing failure or network timeout."
    },
    "mandate_not_approved": {
        "root_cause": "unapproved_mandate",
        "reasoning": "Mandate pre-debit notification pending customer approval or authorization unconfirmed."
    },
    "card_blocked": {
        "root_cause": "hard_decline",
        "reasoning": "Card blocked by issuing bank (reported lost, stolen, or frozen)."
    },
    "repeated_hard_decline": {
        "root_cause": "hard_decline",
        "reasoning": "Issuer bank repeatedly rejected charge with permanent hard decline."
    }
}

def classify_root_cause(failure_code: str) -> dict:
    """
    Deterministic function mapping failure code to root cause category and audit reasoning.
    """
    info = CLASSIFICATION_MAP.get(failure_code, {
        "root_cause": "unknown_failure",
        "reasoning": f"Unrecognized payment failure code: {failure_code}"
    })
    return {
        "root_cause": info["root_cause"],
        "root_cause_reasoning": info["reasoning"]
    }
