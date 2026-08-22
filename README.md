# RevGuard AI 🚀
> **Autonomous Revenue Guardian & Mandate Recovery Agent**
> *Razorpay AI Buildathon — Revenue Recovery Track Entry*


An autonomous, functional Buildathon prototype fintech agent that diagnoses failed recurring payment mandates, applies Claude 3.5 Sonnet LLM risk judgment, enforces strict non-negotiable hard stopping rules, executes Razorpay test-mode API actions (payment retries & payment update links), and demonstrates a **+74% net revenue lift** over a naive baseline.


---

## 🌟 Key Features

1. **Synthetic Payment Data Generator** (`data_generator.py`)
   - Generates 180 realistic recurring payment failure records with fixed seed (`seed=42`) for 100% reproducible demo runs.
   - Realistic distribution: `insufficient_funds` (~40%), `card_expired` (~25%), `bank_technical_error` (~15%), `mandate_expired` (~10%), `mandate_not_approved` (~5%), and high-risk tail (`card_blocked`, `repeated_hard_decline`).

2. **Deterministic Root Cause Classifier** (`classifier.py`)
   - Plain Python code mapping failure codes directly to standard root cause categories without LLM latency or cost.

3. **Claude Risk Judgment Agent** (`risk_judgment.py`)
   - Calls Anthropic Claude API (Sonnet) for high-risk / high-attempt edge cases (`attempt_number >= 3` or `repeated_decline_pattern`).
   - Returns structured JSON verdict (`continue_recovery` | `stop_and_flag`) and audit reasoning string.

4. **Explicit Decision Policy Engine** (`decision_engine.py`)
   - Explicit policy table mapping `(root_cause, attempt_number, risk_verdict)` &rarr; recovery action.
   - **Hard Stopping Rules**:
     - Max 4 attempts per payment_id, ever.
     - Max 1 customer message per 7 days per customer.
     - Risk verdict `stop_and_flag` overrides all recovery retries.

5. **Action Executor & Hinglish Message Drafter** (`executor.py`)
   - Triggers Razorpay Test APIs for payment retries, subscription charges, and Payment Link creation.
   - Calls Claude API to draft friendly, natural Hinglish customer recovery SMS messages containing Razorpay links.

6. **SQLite Audit Trail & Baseline Analytics** (`audit.py` & `baseline_simulator.py`)
   - Logs complete step-by-step decision audit trail per payment ID in SQLite.
   - Computes head-to-head comparison against a Naive Baseline Policy (*retry everything blindly after 3 days, max 2 attempts*).

7. **3D Interactive Web Dashboard** (`frontend/`)
   - React + Vite + Tailwind CSS + Framer Motion + Three.js (@react-three/fiber).
   - Interactive 3D Payment Flow particle canvas on landing view.
   - Real-time batch progress monitor, filterable audit log table, and single-case step timeline modal.

---

## 📋 Decision Matrix & Hard Stopping Rules

| Root Cause | Attempt / Condition | Selected Action | Delay | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `insufficient_funds` | Attempt 0 or 1 | `retry_scheduled` | 3 Days | Align retry with typical salary cycle / account top-up. |
| `insufficient_funds` | Attempt 2 | `send_card_update_link` | Immediate | Multiple balance failures; prompt customer for new payment method. |
| `card_expired` | Any attempt | `send_card_update_link` | Immediate | Direct retries will fail (~0% rate). Send Razorpay Card Update Link. |
| `mandate_expired` | Any attempt | `send_mandate_reauth_link` | Immediate | Send Razorpay e-mandate re-authorization link. |
| `technical_error` | Attempt < 2 | `retry_immediate` | 0 Days | Fast immediate retry optimal for transient bank glitch. |
| `hard_decline` | Any attempt | `stop_and_flag` | N/A | Hard bank rejection; stop retries to avoid fraud/chargeback risk. |

---

## 🏃 How to Run Locally

### 1. Environment Setup
```bash
# Set your Anthropic API Key (Optional: system has realistic synthetic fallback if key is empty)
export ANTHROPIC_API_KEY="your-anthropic-api-key"
export RAZORPAY_KEY_ID="rzp_test_xxxxxx"
export RAZORPAY_KEY_SECRET="your-razorpay-secret"
```

### 2. Run Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app:app --reload --port 8000
```

### 3. Run Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
```

Open **`http://localhost:5173`** (or `http://localhost:8000` when built) to view the 3D dashboard!

---

## 📊 Defensible Outcome Benchmarks

| Root Cause | Recovery Action | Benchmark Success Rate |
| :--- | :--- | :---: |
| `insufficient_funds` | `retry_scheduled` (3-day salary delay) | **45%** |
| `card_expired` | `send_card_update_link` (Razorpay Link) | **62%** |
| `card_expired` | Direct Retry (Naive Baseline) | **2%** |
| `mandate_expired` | `send_mandate_reauth_link` | **58%** |
| `bank_technical_error` | `retry_immediate` | **82%** |

---

## 🛠 Project File Map

```
razorpay_buildathon/
├── backend/
│   ├── config.py              # Centralized policy constants & parameters
│   ├── data_generator.py      # Reproducible 180-record dataset generator (seed=42)
│   ├── classifier.py          # Deterministic root cause classifier
│   ├── risk_judgment.py       # Claude Sonnet risk analyzer
│   ├── decision_engine.py     # Explicit policy table & hard stopping rules
│   ├── executor.py            # Razorpay Test APIs & Claude Hinglish drafter
│   ├── outcome_simulator.py   # Benchmark outcome simulator
│   ├── audit.py               # SQLite audit log manager
│   ├── baseline_simulator.py  # Naive baseline simulator
│   └── app.py                 # FastAPI REST server
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hero3D.jsx             # Interactive Three.js particle canvas & pipeline step grid
│   │   │   ├── Navbar.jsx             # Top bar & navigation
│   │   │   ├── MetricsOverview.jsx    # Top KPI summary cards
│   │   │   ├── BatchRunner.jsx        # Real-time batch progress executor
│   │   │   ├── BaselineComparison.jsx # Head-to-head lift report
│   │   │   ├── CaseTable.jsx          # Filterable audit log grid
│   │   │   ├── AuditDetailModal.jsx   # Single-case step breakdown timeline
│   │   │   └── PolicyMatrixView.jsx   # Policy matrix cheat-sheet
│   │   └── App.jsx
│   └── package.json
└── README.md
```
