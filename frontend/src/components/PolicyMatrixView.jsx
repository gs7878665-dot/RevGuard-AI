import React, { useState } from 'react';
import { Layers, ShieldCheck, Clock, AlertOctagon, CheckCircle2, RotateCw, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PolicyMatrixView({ policyData }) {
  const [flippedIndex, setFlippedIndex] = useState(null);

  if (!policyData) return null;

  const toggleFlip = (idx) => {
    setFlippedIndex(flippedIndex === idx ? null : idx);
  };

  return (
    <div id="policy-matrix" className="glass-panel-3d p-6 md:p-8 rounded-3xl mb-10">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg shadow-indigo-500/20">
          <Layers className="w-6 h-6 font-bold" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Policy Matrix & Hard Stopping Rules</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Explicit, defense-oriented rule table mapping payment root causes to targeted recovery actions. Click any 3D card below to flip it!
          </p>
        </div>
      </div>

      {/* Hard Stopping Rules 3D Box */}
      <div className="mb-8 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-xl">
        <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-amber-400" />
          Hard Stopping Rules (Enforced in Python Code, Non-Negotiable)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-200">
          <div className="glass-card-3d p-4 rounded-xl">
            <span className="font-bold text-amber-300 block mb-1">1. Max Attempts Cap</span>
            Max <span className="font-mono text-emerald-400 font-bold">{policyData.max_attempts}</span> total attempts per payment_id, ever. Stops excessive card hits and prevents customer harassment.
          </div>
          <div className="glass-card-3d p-4 rounded-xl">
            <span className="font-bold text-amber-300 block mb-1">2. Customer Message Rate Limit</span>
            No more than <span className="font-mono text-emerald-400 font-bold">{policyData.max_messages_per_7_days}</span> customer message per 7 days per customer. Prevents customer spamming.
          </div>
          <div className="glass-card-3d p-4 rounded-xl">
            <span className="font-bold text-amber-300 block mb-1">3. Claude Risk Override</span>
            Any case where Claude risk verdict is <span className="font-mono text-rose-400 font-bold">"stop_and_flag"</span> is stopped immediately regardless of root cause.
          </div>
        </div>
      </div>

      {/* Interactive 3D Flip Cards Grid */}
      <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        Interactive 3D Policy Rule Cards (Click Card to Flip & View Defense Detail)
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {policyData.policy_table?.map((row, idx) => {
          const isFlipped = flippedIndex === idx;
          return (
            <div
              key={idx}
              onClick={() => toggleFlip(idx)}
              className="perspective-1000 h-52 cursor-pointer group"
            >
              <div
                className={`relative w-full h-full duration-500 preserve-3d transition-transform ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden glass-card-3d p-5 rounded-2xl flex flex-col justify-between border-slate-800 group-hover:border-emerald-500/40">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs border border-cyan-500/30">
                        {row.root_cause}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <RotateCw className="w-3 h-3 text-slate-500" /> Flip
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">Condition: <span className="text-slate-200 font-semibold">{row.condition}</span></div>
                    <div className="text-sm font-bold text-emerald-400 mt-2">{row.action}</div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Delay: <span className="text-white font-mono">{row.delay}</span></span>
                    <span className="text-emerald-400 font-extrabold flex items-center gap-1 text-[11px]">
                      View Defense Rationale &rarr;
                    </span>
                  </div>
                </div>

                {/* Back Side (Flipped) */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 glass-card-3d p-5 rounded-2xl flex flex-col justify-between border-emerald-500/50 bg-slate-900/95">
                  <div>
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Business Defense Rationale
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {row.reasoning}
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-400 text-right font-mono">
                    Click anywhere to flip back
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Standard Action Table Backup */}
      <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider mb-3">
        Complete Decision Table
      </h3>
      <div className="overflow-x-auto rounded-2xl border border-slate-800/80 mb-8">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
            <tr>
              <th className="px-4 py-3">Root Cause</th>
              <th className="px-4 py-3">Condition / Attempt</th>
              <th className="px-4 py-3">Action Selected</th>
              <th className="px-4 py-3">Retry Delay</th>
              <th className="px-4 py-3">Business Defense</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {policyData.policy_table?.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-cyan-300">{row.root_cause}</td>
                <td className="px-4 py-3 font-medium text-slate-400">{row.condition}</td>
                <td className="px-4 py-3 font-semibold text-emerald-400">{row.action}</td>
                <td className="px-4 py-3 font-mono text-slate-300">{row.delay}</td>
                <td className="px-4 py-3 text-slate-400">{row.reasoning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Benchmark Simulation Probabilities */}
      <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider mb-3">
        Assumed Simulation Probabilities (Defensible Config Constants)
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
        {policyData.success_probabilities?.map((item, i) => (
          <div key={i} className="glass-card-3d p-3 rounded-xl">
            <div className="text-[11px] font-mono text-slate-400">{item.root_cause}</div>
            <div className="font-semibold text-emerald-400 truncate mt-0.5">{item.action}</div>
            <div className="text-right text-xs font-bold text-white mt-1">
              {intPercent(item.success_probability)}% success
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

function intPercent(prob) {
  return Math.round(prob * 100);
}

