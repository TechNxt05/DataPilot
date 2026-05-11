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
    <main className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col">
      {/* Cinematic Header */}
      <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tighter text-white uppercase tracking-widest">DataPilot AI</h1>
            <p className="text-[10px] text-gray-500 font-mono">Neural Horizon OS v2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">Mission Protocol</span>
            <span className="text-xs font-bold text-white uppercase tracking-widest">{agentState.state}</span>
          </div>
          <div className="h-8 w-px bg-white/5" />
          <div className="flex gap-4">
            <Settings className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer transition-colors" />
            <Share2 className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </header>

      {/* Main Mission Control Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Thought Stream & Memory */}
        <aside className="w-[350px] border-r border-white/5 bg-black/40 p-4 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <ThoughtStream logs={logs} />
          </div>
          <div className="h-48 rounded-2xl border border-white/5 bg-black/20 p-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
            <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                    <Database className="w-3 h-3 text-indigo-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Longitudinal Memory</span>
                </div>
                <p className="text-[10px] text-gray-600 leading-relaxed italic">
                    Historical context synchronized. No prior anomalies detected in this cluster range.
                </p>
            </div>
          </div>
        </aside>

        {/* Center - Execution & Visualization */}
        <section className="flex-1 flex flex-col overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-transparent to-transparent">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            
            {/* Neural Core Centerpiece */}
            <div className="flex justify-center py-8">
              <NeuralCore state={agentState.state} />
            </div>

            {/* Execution Graph */}
            <div className="relative">
                <ExecutionGraph graph={graph} />
            </div>

            {/* Interactive Charts Feed */}
            <div className="grid grid-cols-2 gap-6">
                {artifacts.map((art, idx) => (
                    <InteractiveChart key={idx} data={art.chart} title={`Artifact: ${art.node_id}`} />
                ))}
            </div>
          </div>

          {/* Control Hub */}
          <div className="bg-black/60 backdrop-blur-3xl border-t border-white/5 p-4 flex items-center gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Synchronize objective..."
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-12 text-sm focus:outline-none focus:border-indigo-500/50 transition-all font-mono"
              />
              <Command className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
            
            {/* Scrollable Action Bar */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar flex-nowrap shrink-0">
                <button 
                  onClick={() => runMission()}
                  disabled={loading || !sessionId}
                  className="px-6 h-12 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-50 whitespace-nowrap"
                >
                  <Zap className="w-4 h-4" /> Run Objective
                </button>
                
                <button 
                  onClick={() => runMission(true)}
                  disabled={loading || !sessionId}
                  className="px-6 h-12 rounded-xl border border-white/10 text-white font-bold text-sm flex items-center gap-2 hover:bg-white/5 transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" /> Discovery Mode
                </button>

                <div className="h-8 w-px bg-white/5" />

                <button 
                  disabled={!insights.length}
                  className="px-4 h-12 rounded-xl border border-white/10 text-gray-400 hover:text-white font-bold text-sm flex items-center gap-2 hover:bg-white/5 transition-all whitespace-nowrap"
                >
                  <FileText className="w-4 h-4" /> Export Strategic Report
                </button>

                <div className="relative shrink-0">
                    <label className="cursor-pointer">
                        <input type="file" className="hidden" onChange={handleUpload} />
                        <div className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all">
                            <UploadCloud className="w-5 h-5 text-gray-400" />
                        </div>
                    </label>
                </div>
            </div>
          </div>
        </section>

        {/* Right Sidebar - Insights & Hypotheses */}
        <aside className="w-[400px] border-l border-white/5 bg-black/40 p-6 overflow-y-auto space-y-8 scrollbar-hide">
          <HypothesisConsole hypotheses={hypotheses} />
          <div className="h-px bg-white/5" />
          <InsightFeed insights={insights} />
          
          {insights.length > 0 && (
            <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <FileText className="w-3 h-3" /> Export Strategic Report
            </button>
          )}
        </aside>

      </div>
    </main>
  );
}
