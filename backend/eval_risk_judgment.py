import sys
import os
from classifier import classify_root_cause
from risk_judgment import judge_customer_risk

# Hand-labeled Evaluation Benchmark Dataset (15 Edge Cases)
EVAL_DATASET = [
    {
        "id": "eval_01",
        "description": "Hard bank decline on first attempt",
        "payment_record": {
            "payment_id": "pay_eval_01",
            "customer_id": "cust_101",
            "amount": 2999,
            "failure_code": "card_blocked",
            "attempt_number": 1,
            "customer_tenure_days": 45,
            "customer_payment_history_flag": "reliable",
            "mandate_type": "subscription"
        },
        "expected_verdict": "stop_and_flag"
    },
    {
        "id": "eval_02",
        "description": "Low tenure customer with 4 attempts & repeated decline pattern",
        "payment_record": {
            "payment_id": "pay_eval_02",
            "customer_id": "cust_102",
            "amount": 1499,
            "failure_code": "insufficient_funds",
            "attempt_number": 4,
            "customer_tenure_days": 12,
            "customer_payment_history_flag": "repeated_decline_pattern",
            "mandate_type": "subscription"
        },
        "expected_verdict": "stop_and_flag"
    },
    {
        "id": "eval_03",
        "description": "High LTV loyal customer (500 days tenure) with attempt 3 balance failure",
        "payment_record": {
            "payment_id": "pay_eval_03",
            "customer_id": "cust_103",
            "amount": 4999,
            "failure_code": "insufficient_funds",
            "attempt_number": 3,
            "customer_tenure_days": 500,
            "customer_payment_history_flag": "reliable",
            "mandate_type": "subscription"
        },
        "expected_verdict": "continue_recovery"
    },
    {
        "id": "eval_04",
        "description": "High-ticket subscription (₹15,000) with repeated decline velocity",
        "payment_record": {
            "payment_id": "pay_eval_04",
            "customer_id": "cust_104",
            "amount": 15000,
            "failure_code": "insufficient_funds",
            "attempt_number": 3,
            "customer_tenure_days": 30,
            "customer_payment_history_flag": "repeated_decline_pattern",
            "mandate_type": "subscription"
        },
        "expected_verdict": "stop_and_flag"
    },
    {
        "id": "eval_05",
        "description": "Standard expired card on attempt 1",
        "payment_record": {
            "payment_id": "pay_eval_05",
            "customer_id": "cust_105",
            "amount": 999,
            "failure_code": "card_expired",
            "attempt_number": 1,
            "customer_tenure_days": 120,
            "customer_payment_history_flag": "reliable",
            "mandate_type": "subscription"
        },
        "expected_verdict": "continue_recovery"
    },
    {
        "id": "eval_06",
        "description": "Transient bank technical glitch on attempt 2",
        "payment_record": {
            "payment_id": "pay_eval_06",
            "customer_id": "cust_106",
            "amount": 2499,
            "failure_code": "bank_technical_error",
            "attempt_number": 2,
            "customer_tenure_days": 60,
            "customer_payment_history_flag": "reliable",
            "mandate_type": "subscription"
        },
        "expected_verdict": "continue_recovery"
    },
    {
        "id": "eval_07",
        "description": "Stolen card report on attempt 1",
        "payment_record": {
            "payment_id": "pay_eval_07",
            "customer_id": "cust_107",
            "amount": 7999,
            "failure_code": "card_stolen",
            "attempt_number": 1,
            "customer_tenure_days": 20,
            "customer_payment_history_flag": "reliable",
            "mandate_type": "subscription"
        },
        "expected_verdict": "stop_and_flag"
    },
    {
        "id": "eval_08",
        "description": "Long tenure (240 days) with expired mandate on attempt 2",
        "payment_record": {
            "payment_id": "pay_eval_08",
            "customer_id": "cust_108",
            "amount": 3499,
            "failure_code": "mandate_expired",
            "attempt_number": 2,
            "customer_tenure_days": 240,
            "customer_payment_history_flag": "reliable",
            "mandate_type": "subscription"
        },
        "expected_verdict": "continue_recovery"
    },
    {
        "id": "eval_09",
        "description": "High attempt count (attempt 4) with zero tenure & decline history",
        "payment_record": {
            "payment_id": "pay_eval_09",
            "customer_id": "cust_109",
            "amount": 1999,
            "failure_code": "insufficient_funds",
            "attempt_number": 4,
            "customer_tenure_days": 5,
            "customer_payment_history_flag": "repeated_decline_pattern",
            "mandate_type": "subscription"
        },
        "expected_verdict": "stop_and_flag"
    },
    {
        "id": "eval_10",
        "description": "Attempt 1 insufficient funds for reliable mid-tenure customer",
        "payment_record": {
            "payment_id": "pay_eval_10",
            "customer_id": "cust_110",
            "amount": 1199,
            "failure_code": "insufficient_funds",
            "attempt_number": 1,
            "customer_tenure_days": 180,
            "customer_payment_history_flag": "reliable",
            "mandate_type": "subscription"
        },
        "expected_verdict": "continue_recovery"
    },
    {
        "id": "eval_11",
        "description": "High ticket (₹20,000) with repeated decline pattern",
        "payment_record": {
            "payment_id": "pay_eval_11",
            "customer_id": "cust_111",
            "amount": 20000,
            "failure_code": "insufficient_funds",
            "attempt_number": 3,
            "customer_tenure_days": 15,
            "customer_payment_history_flag": "repeated_decline_pattern",
            "mandate_type": "subscription"
        },
        "expected_verdict": "stop_and_flag"
    },
    {
        "id": "eval_12",
        "description": "Bank system maintenance error on attempt 1",
        "payment_record": {
            "payment_id": "pay_eval_12",
            "customer_id": "cust_112",
            "amount": 599,
            "failure_code": "bank_technical_error",
            "attempt_number": 1,
            "customer_tenure_days": 90,
            "customer_payment_history_flag": "reliable",
            "mandate_type": "subscription"
        },
        "expected_verdict": "continue_recovery"
    },
    {
        "id": "eval_13",
        "description": "Attempt 3 with repeated decline pattern & low amount",
        "payment_record": {
            "payment_id": "pay_eval_13",
            "customer_id": "cust_113",
            "amount": 499,
            "failure_code": "hard_decline",
            "attempt_number": 3,
            "customer_tenure_days": 30,
            "customer_payment_history_flag": "repeated_decline_pattern",
            "mandate_type": "subscription"
        },
        "expected_verdict": "stop_and_flag"
    },
    {
        "id": "eval_14",
        "description": "Mandate re-authorization required for 300-day customer",
        "payment_record": {
            "payment_id": "pay_eval_14",
            "customer_id": "cust_114",
            "amount": 8999,
            "failure_code": "mandate_expired",
            "attempt_number": 1,
            "customer_tenure_days": 300,
            "customer_payment_history_flag": "reliable",
            "mandate_type": "subscription"
        },
        "expected_verdict": "continue_recovery"
    },
    {
        "id": "eval_15",
        "description": "Attempt 3 insufficient funds for customer with 150 days tenure",
        "payment_record": {
            "payment_id": "pay_eval_15",
            "customer_id": "cust_115",
            "amount": 3499,
            "failure_code": "insufficient_funds",
            "attempt_number": 3,
            "customer_tenure_days": 150,
            "customer_payment_history_flag": "reliable",
            "mandate_type": "subscription"
        },
        "expected_verdict": "continue_recovery"
    }
]

def run_risk_evaluation():
    """Runs risk judgment accuracy evaluation across the 15-case benchmark dataset."""
    results = []
    passed = 0

    print("=" * 80)
    print(" REVGUARD AI — CLAUDE RISK JUDGMENT EVALUATION SUITE")
    print("=" * 80)
    print(f"{'ID':<10} | {'Expected':<18} | {'Actual Verdict':<18} | {'Status':<8}")
    print("-" * 80)

    for test_case in EVAL_DATASET:
        rec = test_case["payment_record"]
        root_cause_info = classify_root_cause(rec["failure_code"])
        risk_res = judge_customer_risk(rec, root_cause_info)

        actual_verdict = risk_res.get("verdict")
        expected_verdict = test_case["expected_verdict"]
        is_correct = (actual_verdict == expected_verdict)

        if is_correct:
            passed += 1
            status_str = "PASS"
        else:
            status_str = "FAIL"

        print(f"{test_case['id']:<10} | {expected_verdict:<18} | {actual_verdict:<18} | {status_str:<8}")


        results.append({
            "id": test_case["id"],
            "description": test_case["description"],
            "expected_verdict": expected_verdict,
            "actual_verdict": actual_verdict,
            "passed": is_correct,
            "reasoning": risk_res.get("reasoning")
        })

    accuracy = (passed / len(EVAL_DATASET)) * 100.0
    print("-" * 80)
    print(f" TOTAL EVAL CASES: {len(EVAL_DATASET)} | PASSED: {passed} | ACCURACY: {accuracy:.1f}%")
    print("=" * 80)

    return {
        "total_cases": len(EVAL_DATASET),
        "passed_cases": passed,
        "accuracy_pct": round(accuracy, 2),
        "results": results
    }

if __name__ == "__main__":
    run_risk_evaluation()
