import os

# Data Generation Config
NUM_SYNTHETIC_RECORDS = 180
RANDOM_SEED = 42

# Failure Code Distribution (Weights)
FAILURE_CODE_DISTRIBUTION = {
    "insufficient_funds": 0.40,
    "card_expired": 0.25,
    "bank_technical_error": 0.15,
    "mandate_expired": 0.10,
    "mandate_not_approved": 0.05,
    "card_blocked": 0.03,
    "repeated_hard_decline": 0.02,
}

# Mandate Type Distribution
MANDATE_TYPES = ["upi_autopay", "card", "enach"]

# Hard Stopping Rules Constraints
MAX_ATTEMPTS_PER_PAYMENT = 4
MAX_MESSAGES_PER_7_DAYS = 1

# Retry Delays (in days)
RETRY_DELAYS = {
    "insufficient_funds": 3,       # Align with salary cycle / account top-up
    "bank_technical_error": 0,     # Fast immediate retry safe for tech glitch
    "default_retry": 2,
}

# Assumed Recovery Success Probabilities per (Root Cause, Action)
# Defensible baseline probabilities for outcome simulation
SUCCESS_PROBABILITIES = {
    ("insufficient_funds", "retry_scheduled"): 0.45,
    ("insufficient_funds", "retry_immediate"): 0.10,
    ("insufficient_funds", "send_card_update_link"): 0.15,
    
    ("card_expired", "retry_immediate"): 0.02,
    ("card_expired", "retry_scheduled"): 0.05,
    ("card_expired", "send_card_update_link"): 0.62,
    
    ("mandate_expired", "retry_immediate"): 0.01,
    ("mandate_expired", "send_mandate_reauth_link"): 0.58,
    
    ("bank_technical_error", "retry_immediate"): 0.82,
    ("bank_technical_error", "retry_scheduled"): 0.75,
    
    ("mandate_not_approved", "send_mandate_reauth_link"): 0.40,
    ("mandate_not_approved", "escalate_human_followup"): 0.20,
    
    ("hard_decline", "stop_and_flag"): 0.0,
    ("hard_decline", "retry_immediate"): 0.0,
}

# Naive Baseline Config ("retry everything blindly after 3 days, max 2 attempts, no diagnosis")
NAIVE_BASELINE_MAX_ATTEMPTS = 2
NAIVE_BASELINE_RETRY_DELAY_DAYS = 3
NAIVE_BASELINE_BLIND_RETRY_SUCCESS = {
    "insufficient_funds": 0.30,
    "card_expired": 0.02,
    "bank_technical_error": 0.50,
    "mandate_expired": 0.01,
    "mandate_not_approved": 0.05,
    "card_blocked": 0.0,
    "repeated_hard_decline": 0.0
}

# API Credentials & Pinned Model Selection
# Pinned model snapshot 'claude-3-5-sonnet-20241022' chosen for 100% deterministic reproducibility across evaluation benchmark runs
CLAUDE_MODEL = os.environ.get("CLAUDE_MODEL", "claude-3-5-sonnet-20241022")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "rzp_test_mock_id")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "rzp_test_mock_secret")

DB_PATH = "audit_log.db"
DATASET_PATH = "synthetic_failures.json"

