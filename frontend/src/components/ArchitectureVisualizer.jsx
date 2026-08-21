import React, { useState } from 'react';
import { Cpu, Sparkles, ShieldAlert, Zap, Activity, Code, Database, Server, CheckCircle2, Lock } from 'lucide-react';

export default function ArchitectureVisualizer() {
  const [activeStage, setActiveStage] = useState('classifier');

  const stages = {
    classifier: {
      title: "Step 1: Deterministic Root Cause Classifier",
      file: "backend/classifier.py",
      tech: "Python Rule Engine (0ms Latency)",
      summary: "Evaluates raw Razorpay failure codes (e.g. BAD_REQUEST_PAYMENT_TIMED_OUT, INSUFFICIENT_FUNDS) directly in Python code. Ensures zero LLM API cost or latency for standard deterministic mappings.",
      code: `def classify_root_cause(failure_code: str) -> dict:
    code = failure_code.lower()
    if "insufficient_funds" in code:
        return {"root_cause": "insufficient_funds", "reasoning": "Balance failure."}
    elif "expired" in code or "card" in code:
        return {"root_cause": "card_expired", "reasoning": "Expired instrument."}
    elif "technical" in code or "timeout" in code:
        return {"root_cause": "bank_technical_error", "reasoning": "Transient glitch."}
    elif "blocked" in code or "hard_decline" in code:
        return {"root_cause": "hard_decline", "reasoning": "Fraud/hard bank refusal."}
    return {"root_cause": "unknown_decline", "reasoning": "Generic failure."}`
    },
    llm_risk: {
      title: "Step 2: Claude 3.5 Sonnet Risk Judgment Agent",
      file: "backend/risk_judgment.py",
      tech: "Anthropic Claude 3.5 Sonnet API",
      summary: "Triggered on high-risk edge cases (attempt >= 3 or repeated decline patterns). Evaluates customer tenure, amount, and decline velocity. Outputs JSON verdict to continue recovery or stop & flag fraud.",
      code: `POST https://api.anthropic.com/v1/messages
Headers: { "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" }

System Prompt:
"You are a Fintech Loss Prevention Agent. Return ONLY valid JSON:
 {'verdict': 'continue_recovery' | 'stop_and_flag', 'reasoning': '...'}"

Response Payload:
{
  "verdict": "stop_and_flag",
  "reasoning": "High attempt count (attempt 3) with repeated card decline velocity. High chargeback risk."
}`
    },
    policy_engine: {
      title: "Step 3: Hard Stopping Rules Policy Engine",
      file: "backend/decision_engine.py",
      tech: "Python Safety Constraints",
      summary: "Enforces 3 non-negotiable hard stopping rules: (1) Max 4 attempts cap per payment ID, (2) Max 1 customer message per 7 days, (3) Claude Risk 'stop_and_flag' override.",
      code: `def decide_recovery_action(record, root_cause_info, risk_info):
    # Rule 1: Claude Risk Override
    if risk_info.get("verdict") == "stop_and_flag":
        return {"action": "stop_and_flag", "stopping_rule_triggered": "Claude Risk Verdict Override"}

    # Rule 2: Max Attempts Cap
    if record["attempt_number"] >= 4:
        return {"action": "stop_and_flag", "stopping_rule_triggered": "Max 4 Attempts Cap Exceeded"}`
    },
    razorpay_apis: {
      title: "Step 4: Razorpay Test APIs & Hinglish SMS Drafter",
      file: "backend/executor.py",
      tech: "Razorpay REST API + Claude SMS Drafter",
      summary: "Invokes Razorpay Payment Link API (v1/payment_links) or Subscription Retry API (v1/payments/{id}/retry), and calls Claude API to draft natural, polite Hinglish SMS messages containing the link.",
      code: `POST https://api.razorpay.com/v1/payment_links
Headers: { "Authorization": "Basic " + b64_auth }

Body:
{
  "amount": 249900,
  "currency": "INR",
  "description": "Razorpay Subscription Recovery (Card Update)",
  "customer": { "name": "Rahul Sharma", "email": "rahul@example.com" }
}`
    },
    audit_db: {
      title: "Step 5: SQLite Step Audit Trail & ROI Analytics",
      file: "backend/audit.py & baseline_simulator.py",
      tech: "SQLite 3 Database + Statistical Simulator",
      summary: "Logs complete step-by-step decision audit trails per payment ID. Runs parallel Naive Baseline simulation (blind retry policy) to prove defensible +74% net revenue lift.",
      code: `CREATE TABLE IF NOT EXISTS audit_log (
    payment_id TEXT PRIMARY KEY,
    customer_id TEXT,
    amount INTEGER,
    root_cause TEXT,
    risk_verdict TEXT,
    action_taken TEXT,
    stopping_rule_triggered TEXT,
    outcome TEXT,
    amount_recovered INTEGER,
    timestamp TEXT
);`
    }
  };

  const current = stages[activeStage];

  return (
    <div className="glass-panel-3d p-6 sm:p-10 rounded-3xl mb-12 border border-slate-800">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
          <Server className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Technical System Architecture</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Razorpay Buildathon Project File Map & API Execution Flow (Python FastAPI + Claude LLM + SQLite).
          </p>
        </div>
      </div>

      {/* Pipeline Stage Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {Object.keys(stages).map((key) => {
          const item = stages[key];
          const isActive = activeStage === key;
          return (
            <button
              key={key}
              onClick={() => setActiveStage(key)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'btn-3d btn-3d-emerald shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="text-[11px] font-bold truncate">{item.title.split(':')[0]}</div>
              <div className="text-[10px] opacity-80 truncate font-mono mt-0.5">{item.file.split('/')[1]}</div>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
              {current.tech}
            </span>
            <h3 className="text-lg font-extrabold text-white mt-1">{current.title}</h3>
            <div className="text-xs font-mono text-cyan-400">{current.file}</div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans pt-2 border-t border-slate-800">
              {current.summary}
            </p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" /> Source Implementation / API Schema
              </span>
              <span className="text-[10px] font-mono text-slate-500">Python 3.11</span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
              <code>{current.code}</code>
            </pre>
          </div>
        </div>

      </div>

    </div>
  );
}
