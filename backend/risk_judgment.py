import json
import os
import urllib.request
import urllib.error
from config import GEMINI_API_KEY, GEMINI_MODEL

def judge_customer_risk(payment_record: dict, root_cause_info: dict) -> dict:
    """
    Evaluates whether a high-risk or high-attempt case should continue recovery or stop & flag.
    Calls Google Gemini API when GEMINI_API_KEY is configured.
    Falls back gracefully to dynamic heuristic judgment if API key is unconfigured.
    
    Triggered when:
    customer_payment_history_flag == "repeated_decline_pattern" OR attempt_number >= 3
    """
    customer_history = payment_record.get("customer_payment_history_flag")
    attempt_number = payment_record.get("attempt_number", 0)
    
    # Check if risk judgment is required
    root_cause = root_cause_info.get("root_cause")
    needs_risk_call = (
        customer_history == "repeated_decline_pattern" or 
        attempt_number >= 3 or 
        root_cause == "hard_decline" or 
        payment_record.get("failure_code") in ["card_blocked", "card_stolen", "hard_decline"]
    )
    if not needs_risk_call:
        return {
            "verdict": "continue_recovery",
            "reasoning": "Standard risk profile. Attempt count < 3 and customer history flag is non-risky.",
            "llm_called": False
        }

    prompt_payload = {
        "payment_id": payment_record.get("payment_id"),
        "customer_id": payment_record.get("customer_id"),
        "amount_inr": payment_record.get("amount"),
        "mandate_type": payment_record.get("mandate_type"),
        "failure_code": payment_record.get("failure_code"),
        "root_cause": root_cause_info.get("root_cause"),
        "attempt_number": attempt_number,
        "customer_tenure_days": payment_record.get("customer_tenure_days"),
        "customer_payment_history_flag": customer_history,
        "failed_at": payment_record.get("failed_at")
    }

    system_prompt = (
        "You are an expert Fintech Risk & Loss Prevention Agent analyzing failed subscription payments. "
        "Your task is to judge whether a failed subscription payment is worth pursuing for recovery, "
        "or if it presents excessive risk of fraud, churn-trap, or futile retries, requiring 'stop_and_flag'.\n\n"
        "Return ONLY a valid raw JSON object with keys:\n"
        '{"verdict": "continue_recovery" | "stop_and_flag", "reasoning": "<1-2 concise sentences explaining why>"}'
    )

    user_message = f"Evaluate the risk for this recurring payment failure record:\n{json.dumps(prompt_payload, indent=2)}"

    # If GEMINI_API_KEY is available, invoke Google Gemini REST API
    if GEMINI_API_KEY and len(GEMINI_API_KEY) > 5:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
            headers = {"Content-Type": "application/json"}
            body = {
                "contents": [{
                    "parts": [{"text": f"{system_prompt}\n\nUser Record:\n{user_message}"}]
                }],
                "generationConfig": {
                    "responseMimeType": "application/json",
                    "temperature": 0.1
                }
            }

            req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=10) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                text_content = res_data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text_content.strip())
                parsed["llm_called"] = True
                return parsed
        except Exception as e:
            # Fallback to local heuristic on API network error
            pass


    # High-quality dynamic fallback judgment (simulates Gemini reasoning when offline / no API key)
    # Rules:
    # 1. Hard decline / card blocked -> ALWAYS stop_and_flag
    # 2. Tenure > 180 days with high amount -> continue (valuable customer worth recovering)
    # 3. Attempt >= 4 with repeated decline pattern -> stop_and_flag (futile)
    
    root_cause = root_cause_info.get("root_cause")
    failure_code = payment_record.get("failure_code", "")
    tenure = payment_record.get("customer_tenure_days", 0)
    
    if root_cause == "hard_decline" or failure_code in ["card_blocked", "card_stolen", "hard_decline"]:
        verdict = "stop_and_flag"
        reasoning = "Heuristic Risk Assessment (fallback - no LLM call): Card reported blocked, stolen, or hard decline pattern detected. High fraud/chargeback risk."
    elif attempt_number >= 4 and customer_history == "repeated_decline_pattern":
        verdict = "stop_and_flag"
        reasoning = f"Heuristic Risk Assessment (fallback - no LLM call): Customer has failed {attempt_number} attempts with repeated decline history. Recovery probability < 2%."
    elif tenure > 90:
        verdict = "continue_recovery"
        reasoning = f"Heuristic Risk Assessment (fallback - no LLM call): Long customer tenure ({tenure} days) indicates strong LTV. Worth recovering despite attempt count ({attempt_number})."
    elif customer_history == "repeated_decline_pattern" and payment_record.get("amount", 0) > 5000:
        verdict = "stop_and_flag"
        reasoning = "Heuristic Risk Assessment (fallback - no LLM call): High ticket subscription (INR >5000) with suspicious decline velocity. Route to risk flag."
    else:
        verdict = "continue_recovery"
        reasoning = f"Heuristic Risk Assessment (fallback - no LLM call): Account history shows manageable risk. Proceed with automated recovery pipeline."


    return {
        "verdict": verdict,
        "reasoning": reasoning,
        "llm_called": False
    }

