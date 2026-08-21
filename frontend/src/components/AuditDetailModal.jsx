import React from 'react';
import { X, ShieldCheck, Cpu, Sparkles, Link, CheckCircle2, AlertTriangle, MessageSquare, Clock } from 'lucide-react';

export default function AuditDetailModal({ caseData, onClose }) {
  if (!caseData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-panel border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white font-mono tracking-tight">{caseData.payment_id}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                caseData.outcome === 'recovered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                caseData.outcome === 'stopped' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                {caseData.outcome}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Customer: <span className="text-slate-300 font-mono">{caseData.customer_id}</span> &bull; Amount: <span className="text-emerald-400 font-bold">₹{caseData.amount} INR</span>
            </p>
          </div>
        </div>

        {/* Timeline of Steps */}
        <div className="space-y-6 border-l-2 border-slate-800 ml-4 pl-6 relative">
          
          {/* Step 1: Input Failure Details */}
          <div className="relative">
            <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600" />
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 1 &bull; Input Failure Record</div>
            <div className="mt-2 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Failure Code</span>
                <span className="font-mono font-semibold text-rose-400">{caseData.failure_code}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Attempt #</span>
                <span className="font-mono font-semibold text-slate-200">{caseData.attempt_number}</span>
              </div>
              <div>
                <span className="text-slate-500 block">History Flag</span>
                <span className="font-semibold text-slate-300">{caseData.customer_payment_history_flag || 'reliable'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Mandate Type</span>
                <span className="font-mono font-semibold text-slate-300">{caseData.mandate_type}</span>
              </div>
            </div>
          </div>

          {/* Step 2: Deterministic Classification */}
          <div className="relative">
            <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-cyan-500 border-2 border-cyan-300 shadow-md shadow-cyan-500/50" />
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Step 2 &bull; Deterministic Root Cause (Plain Code)
            </div>
            <div className="mt-2 p-4 rounded-xl bg-slate-900/90 border border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Classified Root Cause:</span>
                <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-500/30">
                  {caseData.root_cause}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                "{caseData.root_cause_reasoning}"
              </p>
            </div>
          </div>

          {/* Step 3: Claude Risk Judgment */}
          <div className="relative">
            <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 ${
              caseData.risk_verdict === 'stop_and_flag' ? 'bg-amber-500 border-amber-300' : 'bg-indigo-500 border-indigo-300'
            }`} />
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Step 3 &bull; Claude Risk Judgment Agent (Sonnet LLM)
            </div>
            <div className="mt-2 p-4 rounded-xl bg-slate-900/90 border border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Verdict:</span>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-extrabold uppercase ${
                    caseData.risk_verdict === 'stop_and_flag' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {caseData.risk_verdict || 'continue_recovery'}
                  </span>
                </div>
                {caseData.llm_risk_called && (
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded">
                    LIVE SONNET API CALL
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                "{caseData.risk_reasoning || 'Standard risk profile.'}"
              </p>
            </div>
          </div>

          {/* Step 4: Decision Engine & Stopping Rules */}
          <div className="relative">
            <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-emerald-300" />
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Step 4 &bull; Decision Engine Policy Matrix
            </div>
            <div className="mt-2 p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Action Selected:</span>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/40">
                  {caseData.action_taken}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {caseData.policy_reasoning}
              </p>

              {caseData.stopping_rule_triggered && (
                <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-300 font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Hard Stopping Rule Triggered:</span>
                    {caseData.stopping_rule_triggered}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 5: Hinglish Customer Message (if applicable) */}
          {caseData.customer_message_draft && (
            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-teal-500 border-2 border-teal-300" />
              <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Step 5 &bull; Hinglish Customer Message Draft (Claude LLM)
              </div>
              <div className="mt-2 p-4 rounded-xl bg-slate-900/90 border border-slate-800/80">
                <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800/50 text-xs text-teal-200 font-medium leading-relaxed font-sans">
                  "{caseData.customer_message_draft}"
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Final Outcome */}
          <div className="relative">
            <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 ${
              caseData.outcome === 'recovered' ? 'bg-emerald-400 border-emerald-200 shadow-md shadow-emerald-400/50' : 'bg-slate-700 border-slate-500'
            }`} />
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Step 6 &bull; Final Outcome & Revenue Log</div>
            <div className="mt-2 p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Simulation Result</span>
                <span className="text-sm font-semibold text-slate-200">{caseData.outcome_reasoning}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Revenue Impact</span>
                <span className={`text-lg font-extrabold ${caseData.outcome === 'recovered' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  ₹{caseData.amount_recovered || 0} INR
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
          >
            Close Audit Trail
          </button>
        </div>

      </div>
    </div>
  );
}
