import uuid
import os
import json
from datetime import datetime, timezone
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from config import (
    DATASET_PATH, DB_PATH, MAX_ATTEMPTS_PER_PAYMENT, MAX_MESSAGES_PER_7_DAYS, 
    SUCCESS_PROBABILITIES, RETRY_DELAYS, GEMINI_API_KEY, GEMINI_MODEL, 
    RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
)

from data_generator import load_or_create_dataset, generate_synthetic_dataset
from classifier import classify_root_cause
from risk_judgment import judge_customer_risk
from decision_engine import decide_recovery_action
from executor import execute_action
from outcome_simulator import simulate_outcome
from audit import init_db, log_case_audit, get_all_audit_logs, get_audit_by_payment_id, clear_audit_logs
from baseline_simulator import run_naive_baseline

app = FastAPI(
    title="Subscription Payment Recovery Agent",
    description="Razorpay AI Buildathon Prototype - Smart Revenue Recovery Pipeline",
    version="1.0.0"
)

# Enable CORS for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure DB is initialized on startup
init_db()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Subscription Payment Recovery Agent"}

@app.get("/api/system-status")
def get_system_status():
    """Returns whether the website is running on Live API Keys or Default Demo Data mode."""
    has_gemini = bool(GEMINI_API_KEY and len(GEMINI_API_KEY) > 5)
    has_razorpay = bool(RAZORPAY_KEY_ID and RAZORPAY_KEY_ID != "rzp_test_mock_id")
    
    running_mode = "LIVE_API_KEYS" if (has_gemini or has_razorpay) else "OFFLINE_FALLBACK"
    
    return {
        "running_mode": running_mode,
        "mode_label": "LIVE API KEYS ACTIVE" if running_mode == "LIVE_API_KEYS" else "DEFAULT DEMO DATA MODE",
        "gemini_api_key_configured": has_gemini,
        "gemini_model": GEMINI_MODEL if has_gemini else "gemini-2.5-flash (Heuristic Fallback)",
        "razorpay_key_id_configured": has_razorpay,
        "razorpay_mode": "Live Razorpay Test API" if has_razorpay else "Simulated Test Link Generator",
        "database": "SQLite (audit_log.db)",
        "status": "online"
    }

@app.get("/api/dataset")
def get_dataset():
    """Returns the synthetic payment failure dataset."""
    dataset = load_or_create_dataset()
    return {
        "count": len(dataset),
        "dataset": dataset
    }

@app.post("/api/generate-dataset")
def regenerate_dataset(seed: int = 42, count: int = 180):
    """Regenerates fresh synthetic payment dataset with specified seed."""
    dataset = generate_synthetic_dataset(num_records=count, seed=seed, save_to_file=True)
    clear_audit_logs()
    return {
        "message": f"Successfully generated {len(dataset)} synthetic payment failure records.",
        "seed": seed,
        "count": len(dataset)
    }

def _process_single_case(record: dict) -> dict:
    """End-to-end processing pipeline for a single failed payment case."""
    # Step 2: Root-cause classification (deterministic, plain code)
    root_cause_info = classify_root_cause(record["failure_code"])
    
    # Step 3: Risk judgment (Gemini API call for high attempt / risk history)
    risk_info = judge_customer_risk(record, root_cause_info)
    
    # Step 4: Decision engine (policy table + hard stopping rules)
    decision_info = decide_recovery_action(record, root_cause_info, risk_info)
    
    # Step 5: Action executor (Razorpay APIs + Gemini Hinglish message drafting)
    execution_info = execute_action(record, decision_info)
    
    # Step 6: Outcome simulation
    outcome_info = simulate_outcome(record, root_cause_info, decision_info)
    
    # Step 7: Combine into structured audit log
    audit_record = {
        "payment_id": record["payment_id"],
        "customer_id": record["customer_id"],
        "amount": record["amount"],
        "failure_code": record["failure_code"],
        "attempt_number": record["attempt_number"],
        "root_cause": root_cause_info["root_cause"],
        "root_cause_reasoning": root_cause_info["root_cause_reasoning"],
        "risk_verdict": risk_info.get("verdict"),
        "risk_reasoning": risk_info.get("reasoning"),
        "llm_risk_called": risk_info.get("llm_called", False),
        "action_taken": decision_info["action"],
        "policy_reasoning": decision_info["policy_reasoning"],
        "stopping_rule_triggered": decision_info.get("stopping_rule_triggered"),
        "customer_message_draft": execution_info.get("customer_message_draft"),
        "outcome": outcome_info["outcome"],
        "amount_recovered": outcome_info["amount_recovered"],
        "outcome_reasoning": outcome_info["outcome_reasoning"],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    # Save to SQLite
    log_case_audit(audit_record)
    return audit_record

@app.post("/api/run-batch")
def run_batch_processing():
    """Runs the recovery pipeline across all synthetic dataset records."""
    dataset = load_or_create_dataset()
    clear_audit_logs()
    
    results = []
    for record in dataset:
        audit_rec = _process_single_case(record)
        results.append(audit_rec)
        
    return {
        "message": f"Batch run complete. Processed {len(results)} failed payment cases.",
        "processed_count": len(results),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/audit-trail")
def get_audit_trail(
    failure_code: str = Query(None),
    action_taken: str = Query(None),
    outcome: str = Query(None),
    search: str = Query(None)
):
    """Fetches queryable audit trail logs with filtering options."""
    logs = get_all_audit_logs()
    
    if failure_code:
        logs = [l for l in logs if l.get("failure_code") == failure_code]
    if action_taken:
        logs = [l for l in logs if l.get("action_taken") == action_taken]
    if outcome:
        logs = [l for l in logs if l.get("outcome") == outcome]
    if search:
        s = search.lower()
        logs = [l for l in logs if s in l.get("payment_id", "").lower() or s in l.get("customer_id", "").lower()]
        
    return {
        "total_records": len(logs),
        "audit_logs": logs
    }

# Memory log for recent Webhook Events
webhooks_log = []

@app.post("/api/simulate-single-case")
def simulate_single_case(payload: dict):
    """
    Interactive Judge Workbench Endpoint:
    Simulates a live payment failure end-to-end, executing:
    - Root Cause Classification
    - Gemini Risk Judgment Agent (Gemini 2.5 Flash)
    - Hard Stopping Rules Enforcement
    - Razorpay API Payment Link creation
    - Hinglish Customer Recovery Message Drafting
    - Real-time SQLite Audit Trail Logging
    """
    payment_id = payload.get("payment_id") or f"pay_live_{uuid.uuid4().hex[:8]}"
    customer_id = payload.get("customer_id") or "cust_live_judge"
    amount = payload.get("amount", 2499)
    failure_code = payload.get("failure_code", "card_expired")
    attempt_number = payload.get("attempt_number", 1)
    history_flag = payload.get("customer_payment_history_flag", "reliable")
    mandate_type = payload.get("mandate_type", "subscription")

    record = {
        "payment_id": payment_id,
        "customer_id": customer_id,
        "amount": int(amount),
        "failure_code": failure_code,
        "attempt_number": int(attempt_number),
        "customer_payment_history_flag": history_flag,
        "mandate_type": mandate_type,
        "customer_tenure_days": payload.get("customer_tenure_days", 120),
        "failed_at": datetime.now(timezone.utc).isoformat()
    }

    # Step 2: Deterministic Classification
    root_cause_info = classify_root_cause(record["failure_code"])
    
    # Step 3: Gemini Risk Judgment Agent
    risk_info = judge_customer_risk(record, root_cause_info)
    
    # Step 4: Decision Engine Policy & Hard Stopping Rules
    decision_info = decide_recovery_action(record, root_cause_info, risk_info)
    
    # Step 5: Action Executor (Razorpay Test API + Gemini Hinglish SMS)
    execution_info = execute_action(record, decision_info)
    
    # Step 6: Outcome Simulation
    outcome_info = simulate_outcome(record, root_cause_info, decision_info)

    # Step 7: Create complete audit trail
    audit_record = {
        "payment_id": record["payment_id"],
        "customer_id": record["customer_id"],
        "amount": record["amount"],
        "failure_code": record["failure_code"],
        "attempt_number": record["attempt_number"],
        "customer_payment_history_flag": record["customer_payment_history_flag"],
        "mandate_type": record["mandate_type"],
        "root_cause": root_cause_info["root_cause"],
        "root_cause_reasoning": root_cause_info["root_cause_reasoning"],
        "risk_verdict": risk_info.get("verdict"),
        "risk_reasoning": risk_info.get("reasoning"),
        "llm_risk_called": risk_info.get("llm_called", False),
        "action_taken": decision_info["action"],
        "policy_reasoning": decision_info["policy_reasoning"],
        "stopping_rule_triggered": decision_info.get("stopping_rule_triggered"),
        "customer_message_draft": execution_info.get("customer_message_draft"),
        "outcome": outcome_info["outcome"],
        "amount_recovered": outcome_info["amount_recovered"],
        "outcome_reasoning": outcome_info["outcome_reasoning"],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    # Save to SQLite DB
    log_case_audit(audit_record)

    return {
        "status": "success",
        "audit_record": audit_record,
        "razorpay_response": execution_info.get("razorpay_response"),
        "raw_llm_risk_info": risk_info,
        "raw_decision_info": decision_info,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.post("/api/payment-callback")
def handle_payment_callback(payload: dict):
    """
    Live Payment Gateway Callback:
    Updates SQLite DB when customer completes payment via generated Razorpay Payment Link.
    """
    payment_id = payload.get("payment_id")
    status = payload.get("status", "RECOVERED")
    
    audit = get_audit_by_payment_id(payment_id)
    if not audit:
        # Create a new audit record for callback test
        audit = {
            "payment_id": payment_id,
            "customer_id": payload.get("customer_id", "cust_live_callback"),
            "amount": payload.get("amount", 2499),
            "failure_code": "card_expired",
            "attempt_number": 1,
            "root_cause": "card_expired",
            "root_cause_reasoning": "Card expired",
            "risk_verdict": "continue_recovery",
            "risk_reasoning": "Approved for recovery",
            "llm_risk_called": False,
            "action_taken": "send_card_update_link",
            "policy_reasoning": "Card update link sent",
            "stopping_rule_triggered": None,
            "customer_message_draft": "Payment link sent",
            "outcome": "recovered",
            "amount_recovered": payload.get("amount", 2499),
            "outcome_reasoning": "Customer paid via Razorpay Payment Link Modal",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    else:
        audit["outcome"] = "recovered"
        audit["amount_recovered"] = audit["amount"]
        audit["outcome_reasoning"] = f"Payment successfully recovered via Razorpay Link (Gateway Txn #{payload.get('txn_id', 'pay_rzp_987612')})"
    
    log_case_audit(audit)
    
    return {
        "status": "success",
        "message": f"Payment {payment_id} marked as RECOVERED in SQLite audit trail.",
        "amount_recovered": audit["amount_recovered"],
        "audit_record": audit
    }

@app.post("/api/webhook/razorpay")
def razorpay_webhook_listener(event_data: dict):
    """
    Razorpay Webhook Listener:
    Listens for payment.failed events directly from Razorpay APIs.
    Automatically triggers agent recovery logic upon receiving failed payment webhook.
    """
    event = event_data.get("event", "payment.failed")
    payload = event_data.get("payload", {}).get("payment", {}).get("entity", {})
    
    payment_id = payload.get("id") or f"pay_wh_{uuid.uuid4().hex[:6]}"
    amount = payload.get("amount", 249900) // 100 if payload.get("amount") else 2499
    failure_code = payload.get("error_code") or "card_expired"
    
    sim_record = {
        "payment_id": payment_id,
        "customer_id": payload.get("customer_id") or "cust_webhook_user",
        "amount": amount,
        "failure_code": failure_code,
        "attempt_number": 1,
        "customer_payment_history_flag": "reliable",
        "mandate_type": "subscription"
    }
    
    audit_rec = _process_single_case(sim_record)
    
    webhook_entry = {
        "event": event,
        "payment_id": payment_id,
        "amount": amount,
        "failure_code": failure_code,
        "action_taken": audit_rec["action_taken"],
        "received_at": datetime.now(timezone.utc).isoformat()
    }
    webhooks_log.append(webhook_entry)
    
    return {
        "status": "processed",
        "event": event,
        "payment_id": payment_id,
        "agent_action": audit_rec["action_taken"],
        "outcome": audit_rec["outcome"]
    }

@app.get("/api/webhooks/recent")
def get_recent_webhooks():
    """Returns recent Razorpay webhook events received by the backend."""
    return {
        "total": len(webhooks_log),
        "events": webhooks_log[-10:][::-1]
    }


@app.get("/api/eval-risk-judgment")
def get_risk_judgment_evaluation():
    """Runs and returns evaluation accuracy metrics across the 15-case risk benchmark dataset."""
    from eval_risk_judgment import run_risk_evaluation
    return run_risk_evaluation()

@app.get("/api/audit-trail/{payment_id}")
def get_single_audit(payment_id: str):

    """Fetches detailed audit record for a single payment case."""
    audit = get_audit_by_payment_id(payment_id)
    if not audit:
        raise HTTPException(status_code=404, detail=f"Audit record not found for payment_id {payment_id}")
    return audit

@app.get("/api/summary")
def get_summary_report():
    """Computes summary recovery metrics for the intelligent agent."""
    logs = get_all_audit_logs()
    if not logs:
        # Run batch if empty
        run_batch_processing()
        logs = get_all_audit_logs()

    total_amount_at_risk = sum(l["amount"] for l in logs)
    total_amount_recovered = sum(l["amount_recovered"] for l in logs)
    total_amount_still_failing = sum(l["amount"] for l in logs if l["outcome"] == "failed")
    total_amount_stopped = sum(l["amount"] for l in logs if l["outcome"] == "stopped")
    total_amount_escalated = sum(l["amount"] for l in logs if l["outcome"] == "escalated_pending")

    cases_count = len(logs)
    recovered_cases = sum(1 for l in logs if l["outcome"] == "recovered")
    failed_cases = sum(1 for l in logs if l["outcome"] == "failed")
    stopped_cases = sum(1 for l in logs if l["outcome"] == "stopped")
    escalated_cases = sum(1 for l in logs if l["outcome"] == "escalated_pending")

    recovery_rate_pct = round((total_amount_recovered / total_amount_at_risk * 100), 2) if total_amount_at_risk > 0 else 0
    case_recovery_rate_pct = round((recovered_cases / cases_count * 100), 2) if cases_count > 0 else 0

    # Breakdown by root cause
    root_cause_stats = {}
    for l in logs:
        rc = l["root_cause"]
        if rc not in root_cause_stats:
            root_cause_stats[rc] = {"count": 0, "amount_at_risk": 0, "amount_recovered": 0}
        root_cause_stats[rc]["count"] += 1
        root_cause_stats[rc]["amount_at_risk"] += l["amount"]
        root_cause_stats[rc]["amount_recovered"] += l["amount_recovered"]

    # Breakdown by action taken
    action_stats = {}
    for l in logs:
        act = l["action_taken"]
        if act not in action_stats:
            action_stats[act] = {"count": 0, "amount_recovered": 0}
        action_stats[act]["count"] += 1
        action_stats[act]["amount_recovered"] += l["amount_recovered"]

    return {
        "total_cases": cases_count,
        "total_amount_at_risk": total_amount_at_risk,
        "total_amount_recovered": total_amount_recovered,
        "total_amount_still_failing": total_amount_still_failing,
        "total_amount_stopped": total_amount_stopped,
        "total_amount_escalated": total_amount_escalated,
        "recovery_rate_pct": recovery_rate_pct,
        "case_recovery_rate_pct": case_recovery_rate_pct,
        "recovered_cases": recovered_cases,
        "failed_cases": failed_cases,
        "stopped_cases": stopped_cases,
        "escalated_cases": escalated_cases,
        "root_cause_stats": root_cause_stats,
        "action_stats": action_stats
    }

@app.get("/api/baseline-comparison")
def get_baseline_comparison():
    """Returns side-by-side comparison between Intelligent Recovery Agent vs Naive Baseline."""
    dataset = load_or_create_dataset()
    agent_summary = get_summary_report()
    naive_summary = run_naive_baseline(dataset)

    agent_recovered = agent_summary["total_amount_recovered"]
    naive_recovered = naive_summary["total_amount_recovered"]
    net_revenue_lift = agent_recovered - naive_recovered
    
    pct_lift = round(((agent_recovered - naive_recovered) / naive_recovered * 100), 2) if naive_recovered > 0 else 0

    return {
        "intelligent_agent": {
            "name": "Razorpay AI Recovery Agent (Diagnose + Custom Policy + LLM Risk)",
            "total_at_risk": agent_summary["total_amount_at_risk"],
            "total_recovered": agent_recovered,
            "recovery_rate_pct": agent_summary["recovery_rate_pct"],
            "recovered_cases": agent_summary["recovered_cases"],
            "total_cases": agent_summary["total_cases"]
        },
        "naive_baseline": {
            "name": naive_summary["policy_name"],
            "total_at_risk": naive_summary["total_amount_at_risk"],
            "total_recovered": naive_recovered,
            "recovery_rate_pct": naive_summary["recovery_rate_pct"],
            "recovered_cases": naive_summary["cases_recovered"],
            "total_cases": naive_summary["total_cases"]
        },
        "performance_lift": {
            "net_revenue_lift_inr": net_revenue_lift,
            "pct_revenue_lift": pct_lift,
            "additional_cases_recovered": agent_summary["recovered_cases"] - naive_summary["cases_recovered"]
        }
    }

@app.get("/api/policy-matrix")
def get_policy_matrix():
    """Returns the explicit policy rules, probabilities, and hard stopping constraints for UI documentation."""
    formatted_probs = [
        {"root_cause": pair[0], "action": pair[1], "success_probability": prob}
        for pair, prob in SUCCESS_PROBABILITIES.items()
    ]
    return {
        "max_attempts": MAX_ATTEMPTS_PER_PAYMENT,
        "max_messages_per_7_days": MAX_MESSAGES_PER_7_DAYS,
        "retry_delays": RETRY_DELAYS,
        "success_probabilities": formatted_probs,
        "policy_table": [
            {
                "root_cause": "insufficient_funds",
                "condition": "Attempt 0 or 1",
                "action": "retry_scheduled",
                "delay": "3 days (align with salary cycle)",
                "reasoning": "Wait for account top-up."
            },
            {
                "root_cause": "insufficient_funds",
                "condition": "Attempt 2",
                "action": "send_card_update_link",
                "delay": "Immediate Link",
                "reasoning": "Prompt customer to update payment method."
            },
            {
                "root_cause": "card_expired",
                "condition": "Any attempt",
                "action": "send_card_update_link",
                "delay": "Immediate Link",
                "reasoning": "Direct retries will fail. Request new card details."
            },
            {
                "root_cause": "mandate_expired",
                "condition": "Any attempt",
                "action": "send_mandate_reauth_link",
                "delay": "Immediate Link",
                "reasoning": "Re-authorize e-mandate via Razorpay Link."
            },
            {
                "root_cause": "technical_error",
                "condition": "Attempt < 2",
                "action": "retry_immediate",
                "delay": "0 days",
                "reasoning": "Transient bank glitch. Retry immediately."
            },
            {
                "root_cause": "hard_decline / card_blocked",
                "condition": "Any attempt",
                "action": "stop_and_flag",
                "delay": "N/A",
                "reasoning": "High fraud/chargeback risk. Stop retries."
            }
        ]
    }

# Serve Built React Frontend Static Assets if available
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        file_path = os.path.join(dist_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))
