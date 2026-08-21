import sqlite3
import json
from datetime import datetime, timezone
from config import DB_PATH

def init_db(db_path=DB_PATH):
    """Initializes SQLite audit database schema."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            payment_id TEXT UNIQUE,
            customer_id TEXT,
            amount REAL,
            failure_code TEXT,
            attempt_number INTEGER,
            root_cause TEXT,
            root_cause_reasoning TEXT,
            risk_verdict TEXT,
            risk_reasoning TEXT,
            llm_risk_called INTEGER,
            action_taken TEXT,
            policy_reasoning TEXT,
            stopping_rule_triggered TEXT,
            customer_message_draft TEXT,
            outcome TEXT,
            amount_recovered REAL,
            outcome_reasoning TEXT,
            timestamp TEXT
        )
    """)
    conn.commit()
    conn.close()

def log_case_audit(audit_record: dict, db_path=DB_PATH):
    """Logs or updates structured case audit trail into SQLite."""
    init_db(db_path)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    timestamp = audit_record.get("timestamp") or datetime.now(timezone.utc).isoformat()
    
    cursor.execute("""
        INSERT OR REPLACE INTO audit_log (
            payment_id, customer_id, amount, failure_code, attempt_number,
            root_cause, root_cause_reasoning, risk_verdict, risk_reasoning, llm_risk_called,
            action_taken, policy_reasoning, stopping_rule_triggered, customer_message_draft,
            outcome, amount_recovered, outcome_reasoning, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        audit_record.get("payment_id"),
        audit_record.get("customer_id"),
        audit_record.get("amount"),
        audit_record.get("failure_code"),
        audit_record.get("attempt_number"),
        audit_record.get("root_cause"),
        audit_record.get("root_cause_reasoning"),
        audit_record.get("risk_verdict"),
        audit_record.get("risk_reasoning"),
        1 if audit_record.get("llm_risk_called") else 0,
        audit_record.get("action_taken"),
        audit_record.get("policy_reasoning"),
        audit_record.get("stopping_rule_triggered"),
        audit_record.get("customer_message_draft"),
        audit_record.get("outcome"),
        audit_record.get("amount_recovered", 0),
        audit_record.get("outcome_reasoning"),
        timestamp
    ))
    
    conn.commit()
    conn.close()

def get_all_audit_logs(db_path=DB_PATH):
    """Fetches all audit records ordered by ID."""
    init_db(db_path)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_log ORDER BY id ASC")
    rows = cursor.fetchall()
    result = [dict(r) for r in rows]
    conn.close()
    return result

def get_audit_by_payment_id(payment_id: str, db_path=DB_PATH):
    """Fetches full single-case audit trail."""
    init_db(db_path)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_log WHERE payment_id = ?", (payment_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def clear_audit_logs(db_path=DB_PATH):
    """Clears all audit logs for a fresh batch execution run."""
    init_db(db_path)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM audit_log")
    conn.commit()
    conn.close()
