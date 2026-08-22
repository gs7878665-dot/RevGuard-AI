import React, { useState } from 'react';
import { ShieldCheck, CreditCard, Sparkles, ArrowRight, Zap, RefreshCw, Layers, CheckCircle2, AlertOctagon, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Interactive3DPaymentStudio({ onLaunchBatch, onNavigateTab }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [activeScenario, setActiveScenario] = useState('card_expired');

  // Handle 3D Mouse Parallax Tilt for physical card
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-y * 0.08);
    setRotateY(x * 0.08);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const scenarios = {
    card_expired: {
      title: "Card Expired (0% Direct Retry Rate)",
      failureCode: "card_expired",
      customer: "cust_772199",
      amount: "₹2,499 / mo",
      action: "send_card_update_link",
      actionLabel: "Razorpay Card Update Link",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      linkUrl: "https://rzp.io/l/card_update_9821",
      explanation: "Direct retries fail 100% of the time on expired cards. Agent instantly dispatches Razorpay self-service card update link via Hinglish SMS.",
      recoveryProb: "62% Net Recovery Rate"
    },
    insufficient_funds: {
      title: "Insufficient Funds (Salary Cycle Align)",
      failureCode: "insufficient_funds",
      customer: "cust_901412",
      amount: "₹4,999 / mo",
      action: "retry_scheduled",
      actionLabel: "Scheduled 3-Day Salary Delay",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      linkUrl: "Auto-retry on 24th (Salary Day)",
      explanation: "Immediate retries bounce. Agent waits 3 days to align with monthly salary top-up, achieving 45% recovery.",
      recoveryProb: "45% Net Recovery Rate"
    },
    bank_technical_error: {
      title: "Bank Technical Error (Transient Glitch)",
      failureCode: "bank_technical_error",
      customer: "cust_331088",
      amount: "₹1,199 / mo",
      action: "retry_immediate",
      actionLabel: "Immediate Retry (0-Day Delay)",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      linkUrl: "Executed via Razorpay API",
      explanation: "Transient gateway downtime. Agent retries immediately, capturing 82% of temporary bank drops.",
      recoveryProb: "82% Net Recovery Rate"
    },
    hard_decline: {
      title: "Card Blocked / Hard Decline",
      failureCode: "card_blocked",
      customer: "cust_440192",
      amount: "₹12,000 / mo",
      action: "stop_and_flag",
      actionLabel: "Claude Risk Override: STOP & FLAG",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      linkUrl: "Flagged for Fraud Audit",
      explanation: "Sonnet LLM flags repeated hard decline risk. Prevents chargebacks and enforces hard stopping rule cap.",
      recoveryProb: "0 Retries Allowed (Fraud Defense)"
    }
  };

  const current = scenarios[activeScenario];

  return (
    <div className="relative w-full glass-panel-3d rounded-3xl p-6 sm:p-10 mb-10 overflow-hidden">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 mb-8 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            3D Interactive Recovery Studio
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            RevGuard AI &bull; <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Autonomous Revenue Guardian
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-normal max-w-xl mt-3 leading-relaxed">
            Diagnoses failed payment mandates, executes Google Gemini LLM risk evaluation, generates Razorpay test links, and stops fraud retries.
          </p>

        </div>


        {/* 3D Tactile Main CTA Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={onLaunchBatch}
            className="btn-3d btn-3d-emerald px-7 py-4 text-xs font-black tracking-wide flex items-center gap-2.5 shadow-xl"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            Execute Agent Pipeline Batch
          </button>
          
          <button
            onClick={() => onNavigateTab('policy')}
            className="btn-3d btn-3d-slate px-6 py-4 text-xs font-bold flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            Policy Matrix Rules
          </button>
        </div>
      </div>

      {/* Interactive 3D Studio Content: Left = 3D Card Visualizer, Right = Scenario Controls */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Col: Physical 3D Tilt Card & Interactive Stage */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center perspective-1000">
          
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Interactive 3D Razorpay Payment Mandate (Move Mouse to Tilt 3D Card)
          </div>

          {/* Physical 3D Card Container */}
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-md h-60 sm:h-64 rounded-3xl p-6 cursor-grab active:cursor-grabbing preserve-3d shadow-2xl transition-transform duration-100 ease-out"
            style={{
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`,
              background: activeScenario === 'hard_decline'
                ? 'linear-gradient(135deg, #1f1215 0%, #3f1720 50%, #150a0d 100%)'
                : 'linear-gradient(135deg, #0b1d24 0%, #0f363b 50%, #07171c 100%)',
              border: activeScenario === 'hard_decline' ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
              boxShadow: activeScenario === 'hard_decline'
                ? '0 25px 50px -12px rgba(244, 63, 94, 0.3), 0 0 30px rgba(244, 63, 94, 0.2)'
                : '0 25px 50px -12px rgba(16, 185, 129, 0.3), 0 0 30px rgba(16, 185, 129, 0.2)'
            }}
          >
            {/* Card Specular Light Sheen */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />

            {/* Top Row: Razorpay Brand & Chip */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center font-black text-slate-950 text-xs shadow-md">
                  RZP
                </div>
                <div>
                  <div className="text-white font-extrabold text-xs tracking-wider">RAZORPAY RECURRING</div>
                  <div className="text-[10px] text-slate-400 font-mono">{current.customer}</div>
                </div>
              </div>

              {/* Holographic Chip */}
              <div className="w-10 h-8 rounded-md bg-gradient-to-tr from-amber-300 via-amber-400 to-yellow-500 border border-amber-200/50 shadow-inner flex items-center justify-center">
                <div className="w-7 h-5 border border-amber-600/40 rounded-sm" />
              </div>
            </div>

            {/* Card Number & Failure Indicator */}
            <div className="my-4">
              <div className="font-mono text-white text-base sm:text-lg font-bold tracking-widest flex justify-between">
                <span>4532</span>
                <span>••••</span>
                <span>••••</span>
                <span>8819</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="text-[11px] text-slate-400 font-medium">
                  Plan: <span className="text-white font-semibold">{current.amount}</span>
                </div>
                <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${current.badgeColor}`}>
                  {current.failureCode}
                </div>
              </div>
            </div>

            {/* Bottom Status Banner */}
            <div className="absolute bottom-4 left-6 right-6 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Agent Action:</span>
              <span className="font-bold text-emerald-400 text-[11px] truncate max-w-[200px]">
                {current.action}
              </span>
            </div>

          </div>

          <div className="text-[11px] text-slate-400 mt-3 font-mono">
            3D Spatial Depth Preserved &bull; Zero Mouse Overlay Blocking
          </div>
        </div>

        {/* Right Col: Scenario Switcher & Real-time AI Diagnosis Box */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Select Payment Failure Scenario to Test Agent Logic:
          </div>

          {/* Scenario Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            {Object.keys(scenarios).map((key) => {
              const item = scenarios[key];
              const isActive = activeScenario === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveScenario(key)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    {item.failureCode}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{item.action}</div>
                </button>
              );
            })}
          </div>

          {/* AI Decision Pipeline Card */}
          <motion.div
            key={activeScenario}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">{current.title}</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 font-mono">{current.recoveryProb}</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {current.explanation}
            </p>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Razorpay Action Target:</span>
              <span className="text-cyan-300 font-semibold">{current.actionLabel}</span>
            </div>
          </motion.div>

        </div>

      </div>

    </div>
  );
}
