import React from 'react';
import { Play, RefreshCw, Cpu, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export default function BatchRunner({ onRunBatch, onRegenerateDataset, isProcessing, progressPct, recentActionLog }) {
  return (
    <div className="glass-panel-3d p-6 sm:p-8 rounded-3xl mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-emerald-400" />
            Batch Pipeline Executor
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Processes failed payments through Deterministic Classification &rarr; Gemini Risk Judgment &rarr; Policy Engine &rarr; Razorpay APIs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onRegenerateDataset}
            disabled={isProcessing}
            className="btn-3d btn-3d-slate px-5 py-3 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            Regenerate Seed 42 Data
          </button>

          <button
            onClick={onRunBatch}
            disabled={isProcessing}
            className="btn-3d btn-3d-emerald px-7 py-3 text-xs font-black flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            <Play className="w-4 h-4 text-slate-950 fill-slate-950" />
            {isProcessing ? 'Executing Agent Batch...' : 'Run Agent Pipeline'}
          </button>
        </div>
      </div>

      {/* Real-time Progress Bar */}
      {isProcessing && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Processing Payments via Gemini Risk & Razorpay APIs...
            </span>
            <span className="text-slate-200 font-mono">{progressPct}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-300 ease-out shadow-lg shadow-emerald-500/50"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Live Feed Stream */}
      {recentActionLog && recentActionLog.length > 0 && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
          <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            Live Processing Stream (Recent Actions Executed)
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {recentActionLog.slice(-4).reverse().map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-white">{item.payment_id}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">{item.root_cause}</span>
                  <span className="text-slate-500">&rarr;</span>
                  <span className="font-bold text-emerald-400">{item.action_taken}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                  item.outcome === 'recovered' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                  item.outcome === 'stopped' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {item.outcome}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

