import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeBackground3D from './components/ThreeBackground3D';
import Navbar from './components/Navbar';
import InteractiveWorkbench from './components/InteractiveWorkbench';
import Interactive3DPaymentStudio from './components/Interactive3DPaymentStudio';
import MetricsOverview from './components/MetricsOverview';
import BatchRunner from './components/BatchRunner';
import BaselineComparison from './components/BaselineComparison';
import CaseTable from './components/CaseTable';
import AuditDetailModal from './components/AuditDetailModal';
import PolicyMatrixView from './components/PolicyMatrixView';
import ArchitectureVisualizer from './components/ArchitectureVisualizer';

// 3D Spatial Webpage Morph & Flip Transition Variants
const spatial3DTabVariants = {
  initial: {
    opacity: 0,
    rotateY: 20,
    rotateX: -8,
    z: -300,
    scale: 0.92,
    filter: 'blur(8px)'
  },
  animate: {
    opacity: 1,
    rotateY: 0,
    rotateX: 0,
    z: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: {
    opacity: 0,
    rotateY: -20,
    rotateX: 8,
    z: -300,
    scale: 0.92,
    filter: 'blur(8px)',
    transition: {
      duration: 0.35,
      ease: [0.7, 0, 0.84, 0]
    }
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('workbench');
  const [dataset, setDataset] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [baselineComp, setBaselineComp] = useState(null);
  const [policyData, setPolicyData] = useState(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  
  const [selectedCase, setSelectedCase] = useState(null);

  // Initial Data Fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [dsRes, auditRes, sumRes, compRes, polRes] = await Promise.all([
        fetch('/api/dataset').then((r) => r.json()),
        fetch('/api/audit-trail').then((r) => r.json()),
        fetch('/api/summary').then((r) => r.json()),
        fetch('/api/baseline-comparison').then((r) => r.json()),
        fetch('/api/policy-matrix').then((r) => r.json()),
      ]);

      setDataset(dsRes.dataset || []);
      setAuditLogs(auditRes.audit_logs || []);
      setSummary(sumRes);
      setBaselineComp(compRes);
      setPolicyData(polRes);
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  // Run Batch Processing
  const handleRunBatch = async () => {
    setIsProcessing(true);
    setProgressPct(5);

    const interval = setInterval(() => {
      setProgressPct((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 200);

    try {
      await fetch('/api/run-batch', { method: 'POST' });
      
      clearInterval(interval);
      setProgressPct(100);

      await fetchInitialData();
    } catch (err) {
      console.error('Batch run error:', err);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProgressPct(0);
      }, 500);
    }
  };

  // Regenerate Synthetic Dataset
  const handleRegenerateDataset = async () => {
    setIsProcessing(true);
    try {
      await fetch('/api/generate-dataset?seed=42&count=180', { method: 'POST' });
      await fetchInitialData();
    } catch (err) {
      console.error('Dataset regeneration error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden">
      
      {/* Persistent Full-Screen 3D WebGL Background Scene with Dynamic Camera Fly-Through */}
      <ThreeBackground3D activeTab={activeTab} isProcessing={isProcessing} />

      {/* Main UI Overlay Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* 3D Top Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          totalRecords={dataset.length}
          isProcessing={isProcessing}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 perspective-2000">
          
          {/* Spatial 3D Tab View Transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={spatial3DTabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="preserve-3d"
            >
              {/* TAB 0: LIVE JUDGE SANDBOX & TEST WORKBENCH */}
              {activeTab === 'workbench' && (
                <div>
                  <InteractiveWorkbench onRefreshData={fetchInitialData} />
                  <MetricsOverview summary={summary} baselineComp={baselineComp} />
                  <BaselineComparison baselineComp={baselineComp} />
                  <CaseTable auditLogs={auditLogs} onSelectCase={(item) => setSelectedCase(item)} />
                </div>
              )}

              {/* TAB 1: BATCH DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div>
                  {/* 3D Interactive Payment Card & Scenario Studio */}
                  <Interactive3DPaymentStudio
                    onLaunchBatch={handleRunBatch}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                  />

                  {/* 3D Key Performance Indicators */}
                  <MetricsOverview summary={summary} baselineComp={baselineComp} />

                  {/* Batch Pipeline Executor */}
                  <BatchRunner
                    onRunBatch={handleRunBatch}
                    onRegenerateDataset={handleRegenerateDataset}
                    isProcessing={isProcessing}
                    progressPct={progressPct}
                    recentActionLog={auditLogs.slice(-10)}
                  />

                  {/* ROI Lift & Baseline Comparison */}
                  <BaselineComparison baselineComp={baselineComp} />

                  {/* Case Audit Log Table */}
                  <CaseTable auditLogs={auditLogs} onSelectCase={(item) => setSelectedCase(item)} />
                </div>
              )}

              {/* TAB 2: CASE AUDIT LOG */}
              {activeTab === 'audit' && (
                <div>
                  <CaseTable auditLogs={auditLogs} onSelectCase={(item) => setSelectedCase(item)} />
                </div>
              )}

              {/* TAB 3: BASELINE & ROI LIFT */}
              {activeTab === 'baseline' && (
                <div>
                  <BaselineComparison baselineComp={baselineComp} />
                </div>
              )}

              {/* TAB 4: POLICY MATRIX */}
              {activeTab === 'policy' && (
                <div>
                  <PolicyMatrixView policyData={policyData} />
                </div>
              )}

              {/* TAB 5: ARCHITECTURE */}
              {activeTab === 'architecture' && (
                <div>
                  <ArchitectureVisualizer />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

        </main>

        {/* Case Audit Detail Modal */}
        {selectedCase && (
          <AuditDetailModal caseData={selectedCase} onClose={() => setSelectedCase(null)} />
        )}

        {/* Footer */}
        <footer className="border-t border-slate-900/80 py-6 text-center text-xs text-slate-500 backdrop-blur-md">
          Razorpay AI Buildathon &bull; Revenue Recovery Track &bull; Subscription Payment Recovery Agent
        </footer>

      </div>
    </div>
  );
}




