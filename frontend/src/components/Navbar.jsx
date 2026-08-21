import React from 'react';
import { ShieldCheck, Activity, Database, FileText, Layers, Zap, Server } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, totalRecords, isProcessing }) {
  const tabs = [
    { id: 'workbench', label: '⚡ Live Judge Sandbox', icon: Zap },
    { id: 'dashboard', label: 'Batch Dashboard', icon: Activity },
    { id: 'audit', label: 'Case Audit Trail', icon: Database },
    { id: 'baseline', label: 'Baseline & ROI Lift', icon: FileText },
    { id: 'policy', label: 'Policy Matrix', icon: Layers },
    { id: 'architecture', label: 'Architecture', icon: Server },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 border-b border-slate-800/90 backdrop-blur-2xl mb-8 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div 
          onClick={() => setActiveTab('workbench')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-slate-950 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                RevGuard AI
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                REVENUE RECOVERY
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Autonomous Mandate & Subscription Recovery Agent</p>
          </div>
        </div>


        {/* 3D Tactile Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer select-none whitespace-nowrap ${
                  isActive
                    ? 'btn-3d btn-3d-emerald shadow-lg'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950 fill-slate-950' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Status Pill & Record Count */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs shadow-md">
            <span className={`w-2.5 h-2.5 rounded-full ${isProcessing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            <span className="text-slate-200 font-bold">{isProcessing ? 'Agent Active...' : 'System Ready'}</span>
            <span className="text-slate-700">|</span>
            <span className="text-emerald-400 font-mono font-bold">{totalRecords} cases</span>
          </div>
        </div>

      </div>

      {/* Mobile Nav Tabs */}
      <div className="md:hidden flex border-t border-slate-800 overflow-x-auto px-4 py-2.5 gap-2 bg-slate-950">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap cursor-pointer ${
                isActive ? 'btn-3d btn-3d-emerald' : 'text-slate-400 bg-slate-900 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
