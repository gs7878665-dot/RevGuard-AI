import React from 'react';
import { Award, Zap, TrendingUp, CheckCircle, XCircle, ArrowUpRight, Sparkles } from 'lucide-react';

export default function BaselineComparison({ baselineComp }) {
  if (!baselineComp) return null;

  const agent = baselineComp.intelligent_agent;
  const naive = baselineComp.naive_baseline;
  const lift = baselineComp.performance_lift;

  return (
    <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-800/80 mb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Performance Evaluation Report
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Intelligent Agent vs. Naive Baseline Comparison
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Comparing the smart root-cause recovery policy against a naive blind retry baseline on the exact same synthetic dataset ({agent.total_cases} cases).
          </p>
        </div>

        {/* Lift Badge */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 text-right">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Net Revenue Lift</div>
          <div className="text-2xl font-extrabold text-emerald-400 text-glow-emerald mt-0.5">
            +₹{lift.net_revenue_lift_inr?.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-emerald-300/80 font-medium flex items-center justify-end gap-1 mt-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +{lift.pct_revenue_lift}% revenue performance lift
          </div>
        </div>
      </div>

      {/* Head to Head Side-by-Side Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Intelligent Agent Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-emerald-950/20 border-2 border-emerald-500/40 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider rounded-bl-xl">
            OUR AGENT
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5 fill-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">RevGuard AI Agent</h3>
              <p className="text-xs text-slate-400">Root-cause diagnosis + Gemini Risk + Razorpay Links</p>
            </div>


          </div>

          <div className="space-y-4 my-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Total Amount Recovered</span>
              <span className="text-xl font-extrabold text-emerald-400">₹{agent.total_recovered?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Recovery Rate %</span>
              <span className="text-lg font-bold text-white">{agent.recovery_rate_pct}%</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Subscriptions Recovered</span>
              <span className="text-sm font-semibold text-slate-200">{agent.recovered_cases} / {agent.total_cases} cases</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Why it wins:
            </div>
            <p className="text-slate-400 leading-relaxed">
              Routes expired cards to Razorpay Card Update links (62% recovery rate) instead of failing blind retries. Aligns balance retries with 3-day salary cycles.
            </p>
          </div>
        </div>

        {/* Naive Baseline Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 relative">
          <div className="absolute top-0 right-0 px-3 py-1 bg-slate-800 text-slate-400 font-extrabold text-[11px] uppercase tracking-wider rounded-bl-xl">
            NAIVE BASELINE
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Naive Blind Retry Policy</h3>
              <p className="text-xs text-slate-400">Retry everything blindly after 3 days, max 2 attempts</p>
            </div>
          </div>

          <div className="space-y-4 my-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Total Amount Recovered</span>
              <span className="text-xl font-extrabold text-slate-300">₹{naive.total_recovered?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Recovery Rate %</span>
              <span className="text-lg font-bold text-slate-400">{naive.recovery_rate_pct}%</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Subscriptions Recovered</span>
              <span className="text-sm font-semibold text-slate-400">{naive.recovered_cases} / {naive.total_cases} cases</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="font-semibold text-amber-400 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-amber-400" /> Naive Flaws:
            </div>
            <p className="text-slate-400 leading-relaxed">
              Wastes retries on expired cards (~0% success), spams customer accounts without diagnosis, and fails to offer card update self-service links.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
