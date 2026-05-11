"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  UploadCloud, 
  Database, 
  Terminal, 
  Activity, 
  Sparkles,
  Command,
  LayoutDashboard,
  BrainCircuit,
  Settings,
  Share2,
  FileText,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NeuralCore } from "@/components/NeuralCore";
import { ExecutionGraph } from "@/components/ExecutionGraph";
import { ThoughtStream } from "@/components/ThoughtStream";
import { HypothesisConsole } from "@/components/HypothesisConsole";
import { InsightFeed } from "@/components/InsightFeed";
import { InteractiveChart } from "@/components/InteractiveChart";

export default function MissionControl() {
  const [file, setFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentState, setAgentState] = useState<any>({ agent_id: 'ADS', state: 'idle', message: 'System standby.' });
  const [graph, setGraph] = useState<any>({ nodes: [], edges: [] });
  const [logs, setLogs] = useState<any[]>([]);
  const [hypotheses, setHypotheses] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [artifacts, setArtifacts] = useState<any[]>([]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    formData.append("source_type", "file");
    
    try {
      const res = await axios.post(`${API_BASE_URL}/api/ads/preview_data`, formData);
      setSessionId(res.data.session_id);
      setLogs(prev => [...prev, { agent_id: 'System', message: 'Neural link established with dataset.' }]);
    } catch (err) {
      console.error(err);
    }
  };

  const runMission = async (isDiscovery = false) => {
    if (!sessionId) return;
    setLoading(true);
    setGraph({ nodes: [], edges: [] });
    setHypotheses([]);
    setInsights([]);
    setArtifacts([]);
    
    const endpoint = isDiscovery ? "/api/ads/discovery/stream" : "/api/ads/stream";
    const params = new URLSearchParams({ session_id: sessionId });
    if (!isDiscovery) params.append("prompt", query);

    const eventSource = new EventSource(`${API_BASE_URL}${endpoint}?${params.toString()}`);

    eventSource.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      
      switch (type) {
        case 'agent_state':
          setAgentState(payload);
          setLogs(prev => [...prev, payload]);
          break;
        case 'planner':
          setGraph(payload);
          break;
        case 'cell':
          if (payload.artifacts?.chart) {
            setArtifacts(prev => [...prev, { node_id: payload.node_id, chart: payload.artifacts.chart }]);
          }
          break;
        case 'hypotheses':
          setHypotheses(payload);
          break;
        case 'insights':
          setInsights(payload);
          break;
        case 'final':
          setLoading(false);
          eventSource.close();
          break;
      }
    };
  };

  return (
    <main className="h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col relative">
      {/* Dynamic Background Scanning Effect */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.02] to-transparent pointer-events-none" />
      
      {/* Cinematic Header */}
      <header className="h-14 border-b border-white/[0.03] bg-black/40 backdrop-blur-2xl flex items-center justify-between px-6 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-md opacity-20 animate-pulse" />
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center relative shadow-lg">
                <Activity className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xs font-black tracking-[0.2em] text-white uppercase">DataPilot <span className="text-indigo-400">AI</span></h1>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">Neural Horizon v2.0 // System Active</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-indigo-400/60 uppercase tracking-[0.2em]">Current Protocol</span>
            <span className="text-xs font-bold text-white uppercase tracking-widest leading-none mt-0.5">{agentState.state}</span>
          </div>
          <div className="h-6 w-px bg-white/[0.05]" />
          <div className="flex gap-4">
            <Settings className="w-3.5 h-3.5 text-gray-500 hover:text-white cursor-pointer transition-colors" />
            <Share2 className="w-3.5 h-3.5 text-gray-500 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel - Thought Stream */}
        <aside className="w-[320px] border-r border-white/[0.03] bg-black/20 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/[0.03] flex items-center justify-between bg-white/[0.01]">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Thought Stream</span>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                    <span className="text-[8px] text-indigo-400 font-mono">LIVE</span>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <ThoughtStream logs={logs} />
            </div>
            <div className="p-4 bg-white/[0.02] border-t border-white/[0.03]">
                <div className="flex items-center gap-2 mb-2">
                    <Database className="w-3 h-3 text-indigo-400" />
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Memory Context</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.03] text-[10px] text-gray-500 font-mono leading-relaxed italic">
                    Dataset synchronized. Cluster topology mapped.
                </div>
            </div>
        </aside>

        {/* Center Canvas - The Neural Workspace */}
        <section className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-8 space-y-12 scrollbar-hide pb-32">
            
            {/* Neural Core Centerpiece */}
            <div className="flex justify-center relative">
              <div className="absolute inset-0 bg-indigo-500/5 blur-[120px] rounded-full" />
              <NeuralCore state={agentState.state} />
            </div>

            {/* Execution Graph */}
            <div className="relative max-w-5xl mx-auto w-full group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                <ExecutionGraph graph={graph} />
            </div>

            {/* Dynamic Result Artifacts */}
            <div className="grid grid-cols-2 gap-8 max-w-5xl mx-auto w-full pb-12">
                {artifacts.map((art, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative"
                    >
                        <div className="absolute -inset-px bg-gradient-to-br from-indigo-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                        <InteractiveChart data={art.chart} title={`Neural Output: ${art.node_id}`} />
                    </motion.div>
                ))}
            </div>
          </div>

          {/* Floating Control Hub - Cinematic Pill */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-[100]">
            <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(79,70,229,0.1)] flex items-center gap-3"
            >
                <div className="relative flex-1">
                    <input 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Synchronize objective..."
                        className="w-full h-11 bg-white/[0.03] border border-white/[0.05] rounded-xl px-12 text-sm focus:outline-none focus:border-indigo-500/50 transition-all font-mono placeholder:text-gray-600"
                    />
                    <Command className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                </div>
                
                <div className="flex items-center gap-2 h-11 px-1">
                    <button 
                        onClick={() => runMission()}
                        disabled={loading || !sessionId}
                        className="h-9 px-5 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-30 whitespace-nowrap"
                    >
                        <Zap className="w-3.5 h-3.5" /> Execute
                    </button>
                    
                    <button 
                        onClick={() => runMission(true)}
                        disabled={loading || !sessionId}
                        className="h-9 px-5 rounded-lg border border-white/10 text-white font-bold text-xs flex items-center gap-2 hover:bg-white/5 transition-all disabled:opacity-30 whitespace-nowrap"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Discovery
                    </button>

                    <div className="w-px h-6 bg-white/10 mx-1" />

                    <label className="cursor-pointer">
                        <input type="file" className="hidden" onChange={handleUpload} />
                        <div className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all text-gray-500 hover:text-indigo-400">
                            <UploadCloud className="w-4 h-4" />
                        </div>
                    </label>
                </div>
            </motion.div>
          </div>
        </section>

        {/* Right Panel - Strategic Intelligence */}
        <aside className="w-[380px] border-l border-white/[0.03] bg-black/20 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/[0.03] bg-white/[0.01]">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Strategic Intelligence</span>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-10 pb-12">
                <HypothesisConsole hypotheses={hypotheses} />
                <div className="h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
                <InsightFeed insights={insights} />
                
                {insights.length > 0 && (
                    <motion.button 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full py-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] hover:bg-white/[0.05] hover:text-white transition-all flex items-center justify-center gap-3 group"
                    >
                        <FileText className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> 
                        Generate Strategic Report
                    </motion.button>
                )}
            </div>
        </aside>

      </div>
    </main>
  );
}
