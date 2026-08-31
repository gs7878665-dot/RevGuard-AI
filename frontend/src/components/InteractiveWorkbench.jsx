import React, { useState } from 'react';
import { 
  Zap, Play, ShieldCheck, CheckCircle2, AlertOctagon, Sparkles, 
  ExternalLink, CreditCard, Send, Lock, RotateCcw, ArrowRight, MessageSquare, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InteractiveWorkbench({ onRefreshData }) {
  // Form State
  const [customerName, setCustomerName] = useState('Rahul Sharma');
  const [customerEmail, setCustomerEmail] = useState('rahul.sharma@example.com');
  const [amount, setAmount] = useState(2499);
  const [failureCode, setFailureCode] = useState('card_expired');
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [historyFlag, setHistoryFlag] = useState('reliable');

  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [stepProgress, setStepProgress] = useState(0);
  const [executionResult, setExecutionResult] = useState(null);
  const [executionError, setExecutionError] = useState(null);


  // Razorpay Modal State
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState('card'); // card | otp | success
  const [otp, setOtp] = useState('123456');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  // Webhook log
  const [recentWebhooks, setRecentWebhooks] = useState([]);

  // Trigger Live Single-Case Agent Simulation
  const handleRunSingleCase = async () => {
    setIsRunning(true);
    setStepProgress(1);
    setExecutionResult(null);
    setExecutionError(null);

    // Step animation timing
    setTimeout(() => setStepProgress(2), 250);
    setTimeout(() => setStepProgress(3), 500);
    setTimeout(() => setStepProgress(4), 750);
    setTimeout(() => setStepProgress(5), 1000);

    try {
      const res = await fetch('/api/simulate-single-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerEmail.split('@')[0],
          amount: Number(amount),
          failure_code: failureCode,
          attempt_number: Number(attemptNumber),
          customer_payment_history_flag: historyFlag,
          mandate_type: 'subscription'
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: `HTTP ${res.status} ${res.statusText}` }));
        throw new Error(errData.detail || errData.message || `API request failed with status ${res.status}`);
      }

      const data = await res.json();
      if (data.status === 'error') {
        throw new Error(data.message || 'Simulation execution failed');
      }

      setExecutionResult(data);
      setStepProgress(6);

      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Single case simulation error:', err);
      setExecutionError(err.message || 'Failed to execute payment simulation');
      setStepProgress(0);
    } finally {
      setIsRunning(false);
    }
  };

  // Fire Webhook Simulation
  const handleFireWebhook = async () => {
    try {
      const res = await fetch('/api/webhook/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'payment.failed',
          payload: {
            payment: {
              entity: {
                id: `pay_wh_${Math.floor(Math.random() * 100000)}`,
                amount: amount * 100,
                error_code: failureCode,
                customer_id: customerEmail.split('@')[0]
              }
            }
          }
        })
      });

      const data = await res.json();
      setRecentWebhooks((prev) => [data, ...prev].slice(0, 5));
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Webhook simulation error:', err);
    }
  };

  // Complete Razorpay Payment via Link Modal
  const handleCompleteRazorpayPayment = async () => {
    setIsSubmittingPay(true);
    setTimeout(async () => {
      try {
        const audit = executionResult?.audit_record;
        await fetch('/api/payment-callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payment_id: audit?.payment_id || `pay_${Date.now()}`,
            amount: audit?.amount || amount,
            status: 'RECOVERED',
            txn_id: `pay_rzp_live_${Math.floor(Math.random() * 899999 + 100000)}`
          })
        });

        setPaymentStep('success');
        if (onRefreshData) onRefreshData();
      } catch (err) {
        console.error('Callback error:', err);
      } finally {
        setIsSubmittingPay(false);
      }
    }, 1000);
  };

  const audit = executionResult?.audit_record;

  return (
    <div className="glass-panel-3d p-6 sm:p-10 rounded-3xl mb-12 relative overflow-hidden">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 mb-8 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5 fill-emerald-400" />
            RevGuard AI &bull; Live Judge Sandbox & API Tester
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            RevGuard AI Live Recovery Test Sandbox
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Simulate a real recurring payment failure, watch Google Gemini 2.5 Flash evaluate risk in real-time, generate live Razorpay payment links, and test Razorpay Checkout recovery!
          </p>

        </div>


        <div className="flex items-center gap-3">
          <button
            onClick={handleFireWebhook}
            className="btn-3d btn-3d-slate px-4 py-3 text-xs font-bold flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5 text-cyan-400" />
            Fire Razorpay Webhook Event
          </button>
        </div>
      </div>

      {/* Main Grid: Form Left (col-5), Execution Pipeline Right (col-7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Live Failure Generator Controls */}
        <div className="lg:col-span-5 space-y-4 glass-card-3d p-6 rounded-2xl border-slate-800">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            1. Configure Live Payment Failure Record
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Customer Email / ID</label>
            <input
              type="text"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Plan Amount (INR)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-bold font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Attempt #</label>
              <select
                value={attemptNumber}
                onChange={(e) => setAttemptNumber(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none font-mono"
              >
                <option value={1}>Attempt 1</option>
                <option value={2}>Attempt 2</option>
                <option value={3}>Attempt 3 (Triggers LLM Risk)</option>
                <option value={4}>Attempt 4 (Max Cap Limit)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Failure Code</label>
            <select
              value={failureCode}
              onChange={(e) => setFailureCode(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-cyan-300 font-mono font-bold focus:outline-none"
            >
              <option value="card_expired">card_expired (Send Razorpay Card Link)</option>
              <option value="insufficient_funds">insufficient_funds (Scheduled Salary Retry)</option>
              <option value="bank_technical_error">bank_technical_error (Immediate Retry)</option>
              <option value="mandate_expired">mandate_expired (Send Mandate Link)</option>
              <option value="hard_decline">hard_decline (Gemini Override: Stop & Flag)</option>
              <option value="card_blocked">card_blocked (Fraud Stop)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Customer History Flag</label>
            <select
              value={historyFlag}
              onChange={(e) => setHistoryFlag(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none font-mono"
            >
              <option value="reliable">reliable (Standard Account)</option>
              <option value="repeated_decline_pattern">repeated_decline_pattern (High Fraud Risk)</option>
            </select>
          </div>

          <button
            onClick={handleRunSingleCase}
            disabled={isRunning}
            className="w-full mt-4 btn-3d btn-3d-emerald py-3.5 text-xs font-black tracking-wide flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            {isRunning ? 'Processing Live Pipeline...' : '⚡ Trigger Autonomous Agent Pipeline'}
          </button>
        </div>

        {/* Right Column: Live Pipeline Diagnostics & Razorpay Link Preview */}
        <div className="lg:col-span-7 space-y-4">
          
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              2. Live Pipeline Execution Inspector
            </span>
            {audit && (
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
                ID: {audit.payment_id}
              </span>
            )}
          </h3>

          {/* Error Message Card */}
          {executionError && !isRunning && (
            <div className="p-6 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-rose-300 font-extrabold text-sm">
                <AlertOctagon className="w-5 h-5 text-rose-400 animate-pulse" />
                Pipeline Execution Error Encountered
              </div>
              <p className="text-xs font-mono text-rose-200 bg-rose-900/40 p-3 rounded-xl border border-rose-800/80 leading-relaxed overflow-x-auto">
                {executionError}
              </p>
              <p className="text-xs text-slate-400">
                Please verify backend Uvicorn server is running on <strong>port 8000</strong> or check backend terminal logs.
              </p>
            </div>
          )}

          {!executionResult && !isRunning && !executionError && (
            <div className="p-12 text-center rounded-2xl bg-slate-950/60 border border-slate-800 border-dashed text-slate-400">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-3 animate-pulse" />
              <p className="text-sm font-semibold text-slate-300">No test case executed yet.</p>
              <p className="text-xs text-slate-500 mt-1">
                Configure parameters on the left and click "Trigger Autonomous Agent Pipeline" to inspect live decision logs.
              </p>
            </div>
          )}


          {/* Progress Timeline Cards */}
          {(isRunning || executionResult) && (
            <div className="space-y-3 font-sans">
              
              {/* Step 1: Root Cause Classification */}
              <div className={`p-4 rounded-xl border transition-all ${
                stepProgress >= 2 ? 'bg-slate-900/90 border-cyan-500/40' : 'bg-slate-950/50 border-slate-800 opacity-50'
              }`}>
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    Step 1: Deterministic Root Cause Classifier
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Latency: 0.1ms</span>
                </div>
                {audit && (
                  <div className="mt-2 text-xs text-slate-300">
                    Diagnosed: <span className="font-mono font-bold text-cyan-300">{audit.root_cause}</span> &bull; Reason: "{audit.root_cause_reasoning}"
                  </div>
                )}
              </div>

              {/* Step 2: Gemini Risk LLM */}
              <div className={`p-4 rounded-xl border transition-all ${
                stepProgress >= 3 ? 'bg-slate-900/90 border-indigo-500/40' : 'bg-slate-950/50 border-slate-800 opacity-50'
              }`}>
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold text-indigo-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Step 2: Google Gemini 2.5 Flash Risk Agent
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {audit?.llm_risk_called ? 'LIVE GEMINI API CALL' : 'HEURISTIC EVAL'}
                  </span>

                </div>
                {audit && (
                  <div className="mt-2 text-xs text-slate-300">
                    Verdict: <span className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                      audit.risk_verdict === 'stop_and_flag' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>{audit.risk_verdict}</span>
                    <p className="mt-1 text-slate-400 italic">"{audit.risk_reasoning}"</p>
                  </div>
                )}
              </div>

              {/* Step 3: Hard Stopping Rules Policy */}
              <div className={`p-4 rounded-xl border transition-all ${
                stepProgress >= 4 ? 'bg-slate-900/90 border-amber-500/40' : 'bg-slate-950/50 border-slate-800 opacity-50'
              }`}>
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-amber-400" />
                    Step 3: Decision Engine & Stopping Rules
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Policy Matrix</span>
                </div>
                {audit && (
                  <div className="mt-2 text-xs text-slate-300">
                    Action Selected: <span className="font-bold text-emerald-400">{audit.action_taken}</span>
                    {audit.stopping_rule_triggered && (
                      <div className="mt-1 font-bold text-rose-400 text-[11px]">
                        ⚠️ Hard Stop Triggered: {audit.stopping_rule_triggered}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 4: Razorpay API & Customer Hinglish Message */}
              <div className={`p-4 rounded-xl border transition-all ${
                stepProgress >= 5 ? 'bg-slate-900/90 border-emerald-500/40' : 'bg-slate-950/50 border-slate-800 opacity-50'
              }`}>
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    Step 4: Razorpay API Payment Link & Hinglish SMS
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Razorpay Test API</span>
                </div>

                {audit?.customer_message_draft && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-950/90 border border-teal-800/60">
                    <div className="text-[11px] font-bold text-teal-300 mb-1 flex items-center gap-1.5">
                      <Send className="w-3 h-3 text-teal-400" /> Generated Hinglish Recovery SMS:
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans italic">
                      "{audit.customer_message_draft}"
                    </p>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Target Link: https://rzp.io/l/plink_live982
                      </span>
                      
                      <button
                        onClick={() => {
                          setPaymentStep('card');
                          setShowRazorpayModal(true);
                        }}
                        className="btn-3d btn-3d-emerald px-4 py-2 text-xs font-extrabold flex items-center gap-1.5 shadow-md"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
                        Test Razorpay Payment Modal
                      </button>
                    </div>
                  </div>
                )}

                {audit && !audit.customer_message_draft && (
                  <div className="mt-2 text-xs text-slate-400 italic">
                    Action does not require customer SMS dispatch (Automated bank retry or Fraud Flag).
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Embedded Razorpay Payment Modal */}
      <AnimatePresence>
        {showRazorpayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Razorpay Branded Top Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-white text-blue-700 font-black text-xs flex items-center justify-center">
                      RZP
                    </div>
                    <span className="font-extrabold text-sm tracking-wide">Razorpay Standard Checkout</span>
                  </div>
                  <div className="text-xs opacity-90 mt-1 font-mono">{customerName} &bull; ₹{amount} INR</div>
                </div>
                <button
                  onClick={() => setShowRazorpayModal(false)}
                  className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 rounded bg-black/20"
                >
                  ✕ Close
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                
                {paymentStep === 'card' && (
                  <>
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Select Payment Method to Complete Recovery:
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Test Card Number</label>
                        <input
                          type="text"
                          readOnly
                          value="4111 1111 1111 1111"
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-mono font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Expiry</label>
                          <input
                            type="text"
                            readOnly
                            value="12/28"
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">CVV</label>
                          <input
                            type="text"
                            readOnly
                            value="123"
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setPaymentStep('otp')}
                      className="w-full btn-3d btn-3d-emerald py-3 text-xs font-black tracking-wide"
                    >
                      Proceed to Pay ₹{amount}
                    </button>
                  </>
                )}

                {paymentStep === 'otp' && (
                  <>
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider text-center">
                      Razorpay Bank OTP Authentication
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-3">
                      <div className="text-xs text-slate-400">
                        OTP sent to <span className="text-white font-mono">+91 98765*****</span>
                      </div>

                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-40 mx-auto text-center tracking-widest text-lg font-mono font-extrabold px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 focus:outline-none"
                      />

                      <p className="text-[11px] text-slate-500">Demo OTP: 123456</p>
                    </div>

                    <button
                      onClick={handleCompleteRazorpayPayment}
                      disabled={isSubmittingPay}
                      className="w-full btn-3d btn-3d-emerald py-3 text-xs font-black tracking-wide flex items-center justify-center gap-2"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      {isSubmittingPay ? 'Authorizing Gateway Txn...' : 'Submit OTP & Recover Payment'}
                    </button>
                  </>
                )}

                {paymentStep === 'success' && (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-extrabold text-white">Payment Recovered Successfully!</h3>
                    <p className="text-xs text-slate-300">
                      Razorpay Transaction Completed &bull; SQLite Audit Log Updated to <span className="text-emerald-400 font-bold">RECOVERED</span>.
                    </p>

                    <button
                      onClick={() => setShowRazorpayModal(false)}
                      className="btn-3d btn-3d-slate px-6 py-2.5 text-xs font-bold mt-2"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
