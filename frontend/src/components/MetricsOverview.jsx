import React from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, TrendingUp, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function MetricsOverview({ summary, baselineComp }) {
  if (!summary) return null;

  const netLift = baselineComp?.performance_lift?.net_revenue_lift_inr || 0;
  const pctLift = baselineComp?.performance_lift?.pct_revenue_lift || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 perspective-1000">
      
      {/* Metric 1: Total At Risk */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-card-3d p-6 rounded-3xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Amount at Risk</span>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-black text-white tracking-tight">
          ₹{summary.total_amount_at_risk?.toLocaleString('en-IN')}
        </div>
        <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
          <span className="font-bold text-slate-200 font-mono">{summary.total_cases}</span> failed recurring payments
        </div>
      </motion.div>

      {/* Metric 2: Total Recovered */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="glass-card-3d p-6 rounded-3xl border-emerald-500/40 relative overflow-hidden bg-gradient-to-br from-emerald-950/30 via-slate-900/80 to-slate-950"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Total Revenue Recovered</span>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-5 h-5 font-bold" />
          </div>
        </div>
        <div className="text-3xl font-black text-emerald-400 text-glow-emerald tracking-tight">
          ₹{summary.total_amount_recovered?.toLocaleString('en-IN')}
        </div>
        <div className="text-xs text-emerald-300/90 mt-2 flex items-center gap-1.5 font-medium">
          <span className="font-bold font-mono">{summary.recovered_cases}</span> payments successfully recovered
        </div>
      </motion.div>

      {/* Metric 3: Recovery Rate % */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="glass-card-3d p-6 rounded-3xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recovery Rate %</span>
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-black text-cyan-400 text-glow-cyan tracking-tight font-mono">
          {summary.recovery_rate_pct}%
        </div>
        <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
          <span className="text-emerald-400 font-extrabold flex items-center">
            +{pctLift}% vs Naive
          </span>
          <span className="text-slate-500">&bull; Naive {baselineComp?.naive_baseline?.recovery_rate_pct}%</span>
        </div>
      </motion.div>

      {/* Metric 4: Net Lift over Naive */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="glass-card-3d p-6 rounded-3xl border-indigo-500/40 relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider">Net Lift vs Baseline</span>
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-black text-indigo-300 tracking-tight font-mono">
          +₹{netLift?.toLocaleString('en-IN')}
        </div>
        <div className="text-xs text-indigo-300/90 mt-2 flex items-center gap-1.5 font-medium">
          <span className="font-bold">+{baselineComp?.performance_lift?.additional_cases_recovered}</span> extra subscriptions saved
        </div>
      </motion.div>

    </div>
  );
}

