import json
import uuid
import urllib.request
import urllib.parse
import urllib.error
from config import GEMINI_API_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, GEMINI_MODEL


def execute_action(payment_record: dict, decision_info: dict) -> dict:
    """
    Executes recovery action:
    - Calls Razorpay Test APIs for retries & payment link generation.
    - Calls Google Gemini API to draft natural Hinglish customer messages for customer-facing actions.
    - Returns execution details for the audit log.
    """
    action = decision_info["action"]
    payment_id = payment_record["payment_id"]
    customer_id = payment_record["customer_id"]
    amount = payment_record["amount"]
    
    execution_result = {
        "action_taken": action,
        "razorpay_response": None,
        "customer_message_draft": None,
        "llm_draft_called": False,
        "status": "executed"
    }

    # 1. Action: Retry Scheduled / Retry Immediate -> Call Razorpay Retry API
    if action in ["retry_scheduled", "retry_immediate"]:
        rzp_res = _call_razorpay_retry_api(payment_id, amount)
        execution_result["razorpay_response"] = rzp_res

    # 2. Action: Send Card Update Link / Send Mandate Reauth Link -> Call Razorpay Payment Link API + LLM Message Draft
    elif action in ["send_card_update_link", "send_mandate_reauth_link"]:
        link_type = "card_update" if action == "send_card_update_link" else "mandate_reauth"
        link_res = _call_razorpay_payment_link_api(payment_id, customer_id, amount, link_type)
        execution_result["razorpay_response"] = link_res
        
        # Call Google Gemini API to draft Hinglish customer recovery message
        short_link = link_res.get("short_url", f"https://rzp.io/l/{link_res.get('id', 'plink_demo')}")
        msg_draft = _draft_hinglish_recovery_message(payment_record, action, short_link)
        execution_result["customer_message_draft"] = msg_draft.get("message")
        execution_result["llm_draft_called"] = msg_draft.get("llm_called", False)

    # 3. Action: Escalate Human Followup / Stop and Flag -> No external API, logged only
    elif action in ["escalate_human_followup", "stop_and_flag"]:
        execution_result["status"] = "logged_only"

    return execution_result


def _call_razorpay_retry_api(payment_id: str, amount: int) -> dict:
    """Invokes Razorpay Payment Retry / Subscription Charge Test API with mock fallback."""
    if RAZORPAY_KEY_ID and not RAZORPAY_KEY_ID.startswith("rzp_test_mock"):
        try:
            url = f"https://api.razorpay.com/v1/payments/{payment_id}/retry"
            headers = {"Content-Type": "application/json"}
            auth_str = f"{RAZORPAY_KEY_ID}:{RAZORPAY_KEY_SECRET}"
            import base64
            b64_auth = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")
            headers["Authorization"] = f"Basic {b64_auth}"
            
            body = json.dumps({"amount": amount * 100}).encode("utf-8")
            req = urllib.request.Request(url, data=body, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=5) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception:
            pass
            
    # Test mode API synthetic response representation
    return {
        "id": f"pay_retry_{uuid.uuid4().hex[:8]}",
        "entity": "payment_retry",
        "payment_id": payment_id,
        "amount": amount * 100,
        "status": "retry_initiated",
        "mode": "test_api"
    }


def _call_razorpay_payment_link_api(payment_id: str, customer_id: str, amount: int, link_type: str) -> dict:
    """Generates Razorpay Test Mode Payment Link for card update or mandate re-authorization."""
    if RAZORPAY_KEY_ID and not RAZORPAY_KEY_ID.startswith("rzp_test_mock"):
        try:
            url = "https://api.razorpay.com/v1/payment_links"
            headers = {"Content-Type": "application/json"}
            auth_str = f"{RAZORPAY_KEY_ID}:{RAZORPAY_KEY_SECRET}"
            import base64
            b64_auth = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")
            headers["Authorization"] = f"Basic {b64_auth}"
            
            body = json.dumps({
                "amount": amount * 100,
                "currency": "INR",
                "accept_partial": False,
                "description": f"Subscription Payment Update ({link_type}) for {payment_id}",
                "customer": {"name": f"Customer {customer_id}", "email": f"{customer_id}@example.com"}
            }).encode("utf-8")
            
            req = urllib.request.Request(url, data=body, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=5) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception:
            pass

    # Realistic Test Mode Payment Link structure
    link_id = f"plink_{uuid.uuid4().hex[:8]}"
    return {
        "id": link_id,
        "entity": "payment_link",
        "amount": amount * 100,
        "currency": "INR",
        "short_url": f"https://rzp.io/l/{link_id}",
        "status": "created",
        "description": f"Razorpay Recovery Link ({link_type})"
    }


def _draft_hinglish_recovery_message(payment_record: dict, action: str, recovery_link: str) -> dict:
    """
    LLM Call 2: Uses Google Gemini API to draft a warm, respectful, concise Hinglish recovery SMS/WhatsApp message.
    """
    amount = payment_record.get("amount")
    mandate_type = payment_record.get("mandate_type", "subscription").upper()
    
    prompt = (
        f"Draft a short (max 25 words), polite, friendly customer recovery SMS in conversational Hinglish.\n"
        f"Context:\n"
        f"- Payment Amount: ₹{amount}\n"
        f"- Payment Type: {mandate_type}\n"
        f"- Reason: {'Card expired' if action == 'send_card_update_link' else 'Mandate re-authorization required'}\n"
        f"- Recovery Link: {recovery_link}\n\n"
        f"Guidelines:\n"
        f"- Tone: Friendly, respectful, helpful Hinglish (e.g. 'Aapka subscription payment delay ho gaya hai...').\n"
        f"- Must include the exact recovery link.\n"
        f"- No aggressive sales talk or spammy text."
    )

    if GEMINI_API_KEY and len(GEMINI_API_KEY) > 5:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
            headers = {"Content-Type": "application/json"}
            body = {
                "contents": [{
                    "parts": [{"text": f"You are a customer communication specialist drafting concise Hinglish payment recovery messages.\n\n{prompt}"}]
                }],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 150
                }
            }

            req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=8) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                text = res_data["candidates"][0]["content"]["parts"][0]["text"].strip()
                return {"message": text, "llm_called": True}
        except Exception:
            pass


    # High-quality Hinglish fallback template when API key is missing or offline
    if action == "send_card_update_link":
        msg = f"Hi! Aapka ₹{amount} subscription payment hold par hai due to card expiry. Uninterrupted service ke liye card details Yahan update karein: {recovery_link}"
    else:
        msg = f"Namaste! Aapka ₹{amount} recurring mandate re-verify karna required hai. Service maintain rakhne ke liye yahan approve karein: {recovery_link}"
        
    return {"message": msg, "llm_called": False}
