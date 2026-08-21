import random
from config import NAIVE_BASELINE_MAX_ATTEMPTS, NAIVE_BASELINE_BLIND_RETRY_SUCCESS, RANDOM_SEED

def run_naive_baseline(dataset: list) -> dict:
    """
    Evaluates the Naive Baseline Policy on the exact same dataset:
    Policy: "Retry everything blindly after 3 days, max 2 attempts, no diagnosis"
    
    Returns comprehensive baseline recovery stats for comparison against the intelligent agent.
    """
    total_amount_at_risk = 0
    total_amount_recovered = 0
    total_cases = len(dataset)
    cases_recovered = 0
    cases_failed = 0
    cases_skipped_max_attempt = 0

    for record in dataset:
        amount = record.get("amount", 0)
        total_amount_at_risk += amount
        attempt_number = record.get("attempt_number", 0)
        failure_code = record.get("failure_code", "insufficient_funds")
        payment_id = record.get("payment_id", "")

        # If already attempted 2 or more times under naive policy (max 2 attempts limit)
        if attempt_number >= NAIVE_BASELINE_MAX_ATTEMPTS:
            cases_skipped_max_attempt += 1
            cases_failed += 1
            continue

        # Deterministic seed per payment for fair apples-to-apples baseline comparison
        item_seed = RANDOM_SEED + abs(hash(payment_id)) % 10000 + 999
        rng = random.Random(item_seed)

        success_rate = NAIVE_BASELINE_BLIND_RETRY_SUCCESS.get(failure_code, 0.10)
        
        if rng.random() < success_rate:
            total_amount_recovered += amount
            cases_recovered += 1
        else:
            cases_failed += 1

    recovery_rate_pct = round((total_amount_recovered / total_amount_at_risk * 100), 2) if total_amount_at_risk > 0 else 0
    case_recovery_rate_pct = round((cases_recovered / total_cases * 100), 2) if total_cases > 0 else 0

    return {
        "policy_name": "Naive Baseline (Blind Retry after 3 days, Max 2 attempts, No Diagnosis)",
        "total_cases": total_cases,
        "total_amount_at_risk": total_amount_at_risk,
        "total_amount_recovered": total_amount_recovered,
        "total_amount_lost": total_amount_at_risk - total_amount_recovered,
        "recovery_rate_pct": recovery_rate_pct,
        "cases_recovered": cases_recovered,
        "cases_failed": cases_failed,
        "cases_skipped_max_attempt": cases_skipped_max_attempt,
        "case_recovery_rate_pct": case_recovery_rate_pct
    }
