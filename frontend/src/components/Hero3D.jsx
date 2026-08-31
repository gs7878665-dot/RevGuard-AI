import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, MeshWobbleMaterial, Line } from '@react-three/drei';
import * as THREE from 'three';
import { ShieldCheck, ArrowRight, Layers, Sparkles, Zap, Cpu, Activity } from 'lucide-react';

function FloatingNode({ position, color, label, type }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.4;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <group position={position}>
      <Float speed={2.5} rotationIntensity={1.2} floatIntensity={1.5}>
        <mesh ref={meshRef}>
          {type === 'failed' && <icosahedronGeometry args={[0.7, 1]} />}
          {type === 'agent' && <torusGeometry args={[0.6, 0.25, 16, 32]} />}
          {type === 'recovered' && <octahedronGeometry args={[0.75, 0]} />}
          <MeshWobbleMaterial
            color={color}
            factor={0.4}
            speed={2}
            roughness={0.2}
            metalness={0.8}
            emissive={color}
            emissiveIntensity={0.6}
          />
        </mesh>
      </Float>
    </group>
  );
}

function ParticleNetwork() {
  const count = 200;
  const meshRef = useRef();

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);

    const cFailed = new THREE.Color('#EF4444');
    const cAgent = new THREE.Color('#06B6D4');
    const cRecovered = new THREE.Color('#10B981');

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 16;
      const y = (Math.random() - 0.5) * 8;
      const z = (Math.random() - 0.5) * 6;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      let c = cFailed;
      if (x > -2.5 && x < 2.5) c = cAgent;
      else if (x >= 2.5) c = cRecovered;

      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }

    return { positions: pos, colors: cols };
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.03) * 0.1;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.12} vertexColors transparent opacity={0.75} sizeAttenuation />
    </points>
  );
}

function PipelineBeams() {
  const pointsLeft = useMemo(() => [
    new THREE.Vector3(-4.5, 0, 0),
    new THREE.Vector3(0, 0.3, 0)
  ], []);

  const pointsRight = useMemo(() => [
    new THREE.Vector3(0, 0.3, 0),
    new THREE.Vector3(4.5, 0, 0)
  ], []);

  return (
    <>
      <Line points={pointsLeft} color="#F59E0B" lineWidth={2} transparent opacity={0.7} />
      <Line points={pointsRight} color="#10B981" lineWidth={3} transparent opacity={0.85} />
    </>
  );
}

export default function Hero3D({ onLaunchDashboard }) {
  return (
    <div className="relative w-full min-h-[660px] rounded-3xl glass-panel border border-slate-800/80 mb-12 p-6 sm:p-10 md:p-14 flex flex-col justify-between overflow-visible">
      
      {/* 3D Interactive Canvas Background */}
      <div className="absolute inset-0 z-0 rounded-3xl overflow-hidden pointer-events-auto">
        <Canvas camera={{ position: [0, 0, 7.5], fov: 55 }}>
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#06B6D4" />
          <pointLight position={[-10, -10, -10]} intensity={1.2} color="#EF4444" />
          
          <FloatingNode position={[-4.5, 0.5, 0]} color="#EF4444" label="Failed Mandates" type="failed" />
          <FloatingNode position={[0, 0.2, 0.5]} color="#06B6D4" label="Gemini AI Agent" type="agent" />
          <FloatingNode position={[4.5, -0.3, 0]} color="#10B981" label="Razorpay Recovered" type="recovered" />
          
          <PipelineBeams />
          <ParticleNetwork />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} maxPolarAngle={Math.PI / 1.8} minPolarAngle={Math.PI / 2.5} />
        </Canvas>
      </div>

      {/* Main Hero Header Content */}
      <div className="relative z-10 max-w-3xl pointer-events-none">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase mb-6 backdrop-blur-md pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          Razorpay AI Buildathon &bull; Revenue Recovery Track
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-5 pointer-events-auto">
          Subscription Payment <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
            Recovery Agent
          </span>
        </h1>

        <p className="text-slate-300 text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-2xl mb-8 pointer-events-auto">
          An autonomous fintech pipeline that diagnoses payment failures, applies Gemini AI risk judgment, executes Razorpay test retries & recovery links, and out-recovers naive baselines.
        </p>

        <div className="flex flex-wrap items-center gap-4 pointer-events-auto">
          <button
            onClick={onLaunchDashboard}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2.5"
          >
            Launch Live Recovery Pipeline
            <ArrowRight className="w-4 h-4 text-slate-950 font-bold" />
          </button>
          
          <a
            href="#policy-matrix"
            className="px-6 py-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-200 font-bold text-sm hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            View Policy Matrix
          </a>
        </div>

      </div>

      {/* 4 Pipeline Step Cards (Fully Spaced & Un-clipped) */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 pt-6 border-t border-slate-800/80">
        
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-xl hover:border-slate-700 transition-all">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span className="w-5 h-5 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px]">1</span>
            Steps 1 & 2
          </div>
          <div className="text-sm font-bold text-white mt-1">Deterministic Root Cause</div>
          <p className="text-xs text-slate-400 mt-1 leading-normal">
            Rule-based code classifies failure codes directly (no LLM latency or cost).
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-xl hover:border-slate-700 transition-all">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">2</span>
            Step 3
          </div>
          <div className="text-sm font-bold text-cyan-400 mt-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Gemini Risk Judgment
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-normal">
            Gemini 2.5 Flash LLM evaluates high-attempt / bad history edge cases to stop & flag fraud.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-xl hover:border-slate-700 transition-all">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">3</span>
            Steps 4 & 5
          </div>
          <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Razorpay Test APIs
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-normal">
            Generates Card Update & Mandate Links + drafts natural Hinglish customer messages.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-xl hover:border-slate-700 transition-all">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">4</span>
            Steps 7 & 8
          </div>
          <div className="text-sm font-bold text-indigo-300 mt-1 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Audit Trail & ROI Lift
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-normal">
            Logs SQLite audit trail per case and computes revenue lift vs naive baseline.
          </p>
        </div>

      </div>

    </div>
  );
}
