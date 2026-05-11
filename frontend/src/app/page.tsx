"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  UploadCloud, 
  MessageSquare, 
  Database, 
  Server, 
  Command, 
  BrainCircuit, 
  Zap, 
  Activity, 
  Terminal, 
  Sparkles,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NeuralCore } from "@/components/NeuralCore";
import { InteractiveChart } from "@/components/InteractiveChart";

type TableRow = Record<string, string | number | boolean | null>;
type SchemaData = Record<string, string>;
type PlanData = Record<string, any> | null;

type ExecutionCell = {
  cell_id: string;
  title: string;
  status: "pending" | "running" | "success" | "error" | "critic_retry";
  code: string;
  stdout?: string;
  error?: string;
  artifacts?: {
    charts?: { plotly_json: any; title: string }[];
  };
};

export default function Home() {
  const [sourceType, setSourceType] = useState<"file" | "mongo" | "sql">("file");
  const [file, setFile] = useState<File | null>(null);
  const [dbUri, setDbUri] = useState("");
  const [dbName, setDbName] = useState("");
  const [dbCol, setDbCol] = useState("");
  const [sqlQuery, setSqlQuery] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [previewData, setPreviewData] = useState<TableRow[] | null>(null);
  const [schemaData, setSchemaData] = useState<SchemaData | null>(null);
  const [plan, setPlan] = useState<PlanData>(null);
  const [cells, setCells] = useState<ExecutionCell[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [streamLogs, setStreamLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"workspace" | "data">("workspace");

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamLogs]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("source_type", sourceType);
    if (sourceType === "file" && file) formData.append("file", file);
    if (sourceType === "mongo") {
      formData.append("db_uri", dbUri);
      formData.append("db_name", dbName);
      formData.append("db_col", dbCol);
    }
    if (sourceType === "sql") {
      formData.append("db_uri", dbUri);
      formData.append("sql_query", sqlQuery);
    }
    return formData;
  };

  const handleConnect = async () => {
    setConnecting(true);
    setErrorMsg(null);
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/ads/preview_data", buildFormData(), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.error) setErrorMsg(response.data.error);
      else {
        setSessionId(response.data.session_id);
        setPreviewData(response.data.data);
        setSchemaData(response.data.schema);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to preview data.");
    } finally {
      setConnecting(false);
    }
  };

  const handleAgentChat = async (overridePrompt?: string) => {
    const finalPrompt = overridePrompt || query;
    if (!finalPrompt || !sessionId) return;
    
    setLoading(true);
    setErrorMsg(null);
    setPlan(null);
    setCells([]);
    setInsights([]);
    setStreamLogs([]);

    const params = new URLSearchParams({
      session_id: sessionId,
      prompt: finalPrompt,
      sql_connection_string: sourceType === "sql" ? dbUri : "",
    });

    const eventSource = new EventSource(`http://127.0.0.1:8000/api/ads/stream?${params.toString()}`);
    
    eventSource.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === "planner") {
        setPlan(payload.payload);
      } else if (payload.type === "log") {
        setStreamLogs((prev) => [...prev, payload.payload.message]);
      } else if (payload.type === "cell") {
        setCells((prev) => [...prev, payload.payload]);
      } else if (payload.type === "insights") {
        setInsights(payload.payload);
      } else if (payload.type === "final") {
        setPlan(payload.payload.plan);
        setCells(payload.payload.cells || []);
        setInsights(payload.payload.insights || []);
        eventSource.close();
        setLoading(false);
      } else if (payload.type === "error") {
        setErrorMsg(payload.payload);
        eventSource.close();
        setLoading(false);
      }
    };
    
    eventSource.onerror = () => {
      setErrorMsg("Streaming connection failed.");
      eventSource.close();
      setLoading(false);
    };
  };

  const getAgentStatus = (): "idle" | "planning" | "executing" | "success" | "error" => {
    if (errorMsg) return "error";
    if (loading) {
      if (cells.length > 0) return "executing";
      return "planning";
    }
    if (insights.length > 0) return "success";
    return "idle";
  };

  return (
    <main className="min-h-screen h-screen overflow-hidden bg-[#020617] text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-black/40 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Command className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              DataPilot <span className="text-indigo-400 font-black">ADS</span>
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Secure Node</span>
              <span className="w-1 h-1 bg-slate-700 rounded-full" />
              <span>v2.0 Neural Horizon</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
            <button 
              onClick={() => setActiveTab("workspace")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeTab === "workspace" ? "bg-white/10 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
            >
              Workspace
            </button>
            <button 
              onClick={() => setActiveTab("data")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeTab === "data" ? "bg-white/10 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
            >
              Data Explorer
            </button>
          </div>
          <NeuralCore status={getAgentStatus()} />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden w-full p-4 gap-4 z-10">
        <AnimatePresence mode="wait">
          {activeTab === "workspace" ? (
            <motion.div 
              key="workspace"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex gap-4 min-w-0"
            >
              {/* Left Panel: Config & Schema */}
              <aside className="w-[300px] flex flex-col gap-4 overflow-y-auto pr-1 shrink-0">
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                  <h2 className="text-xs font-bold mb-4 flex items-center text-slate-400 uppercase tracking-widest"><Server className="w-4 h-4 mr-2 text-indigo-400" /> Source</h2>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {(["file", "mongo", "sql"] as const).map((type) => (
                      <button 
                        key={type}
                        onClick={() => setSourceType(type)} 
                        className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${sourceType === type ? "bg-indigo-500/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10" : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    {sourceType === "file" && (
                      <label className="group flex flex-col items-center justify-center w-full h-24 border border-white/10 border-dashed rounded-2xl cursor-pointer hover:bg-white/5 transition-all">
                        <UploadCloud className="w-6 h-6 mb-2 text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] text-slate-400 font-medium px-4 text-center truncate w-full">{file ? file.name : "Drop dataset here"}</span>
                        <input type="file" className="hidden" accept=".csv,.json,.xlsx,.parquet" onChange={handleFileUpload} />
                      </label>
                    )}
                    {sourceType === "mongo" && (
                      <div className="space-y-2">
                        <input type="text" placeholder="Mongo URI" value={dbUri} onChange={e => setDbUri(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs focus:border-indigo-500/50 outline-none transition-all" />
                        <input type="text" placeholder="DB Name" value={dbName} onChange={e => setDbName(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs focus:border-indigo-500/50 outline-none transition-all" />
                      </div>
                    )}
                    {sourceType === "sql" && (
                      <div className="space-y-2">
                        <input type="text" placeholder="SQL Connection" value={dbUri} onChange={e => setDbUri(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs focus:border-indigo-500/50 outline-none transition-all" />
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={handleConnect} 
                    disabled={connecting} 
                    className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {connecting ? <Activity className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    {connecting ? "Synchronizing..." : "Initialize Engine"}
                  </button>
                </div>

                <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col min-h-0">
                  <h2 className="text-xs font-bold mb-4 text-slate-400 uppercase tracking-widest flex items-center"><Database className="w-4 h-4 mr-2 text-cyan-400" /> Intelligence Schema</h2>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                    {schemaData ? Object.entries(schemaData).map(([name, dtype]) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={name} 
                        className="flex items-center justify-between bg-white/5 rounded-lg p-2.5 border border-white/5 hover:border-white/10 transition-all"
                      >
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-300 truncate max-w-[120px]">{name}</span>
                          <span className="text-[9px] text-slate-500 font-mono">{String(dtype)}</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                      </motion.div>
                    )) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-600 opacity-50 italic py-10">
                        <Database className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-[10px]">No data projected</p>
                      </div>
                    )}
                  </div>
                </div>
              </aside>

              {/* Center: Execution Workspace */}
              <section className="flex-1 grid grid-cols-12 gap-4 min-w-0">
                <div className="col-span-8 flex flex-col gap-4 min-h-0">
                  <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-3xl p-6 overflow-auto min-h-0 relative group shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center">
                        <BrainCircuit className="w-4 h-4 mr-3 text-indigo-400" /> Neural Pipeline
                      </h2>
                      {loading && (
                        <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                          <Activity className="w-3 h-3 text-indigo-400 animate-pulse" />
                          <span className="text-[10px] text-indigo-300 font-bold uppercase">Synthesizing...</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6 pb-20">
                      {!plan && !cells.length && (
                        <div className="flex flex-col items-center justify-center h-[300px] text-slate-700 opacity-40">
                          <Sparkles className="w-12 h-12 mb-4" />
                          <p className="text-sm font-medium">Initialize a session to start autonomous analysis</p>
                        </div>
                      )}
                      
                      {plan && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-indigo-500/5 rounded-2xl p-4 border border-indigo-500/10">
                          <div className="flex items-center gap-2 mb-2 text-indigo-300 text-[10px] font-bold uppercase tracking-widest">
                            <ChevronRight className="w-3 h-3" /> Mission Goal
                          </div>
                          <p className="text-sm font-medium text-slate-300 italic">"{plan.goal}"</p>
                        </motion.div>
                      )}

                      {cells.map((cell, idx) => (
                        <motion.div 
                          key={cell.cell_id} 
                          initial={{ opacity: 0, y: 20 }} 
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="group/cell relative border border-white/5 rounded-2xl bg-white/[0.02] overflow-hidden hover:border-white/10 transition-all"
                        >
                          <div className={`h-1 w-full ${cell.status === 'success' ? 'bg-emerald-500/40' : cell.status === 'error' ? 'bg-red-500/40' : 'bg-indigo-500/40 animate-pulse'}`} />
                          <div className="p-4">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-[10px] text-indigo-400">{idx + 1}</span>
                                {cell.title}
                              </span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border ${
                                cell.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                cell.status === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                              }`}>
                                {cell.status}
                              </span>
                            </div>
                            
                            <div className="relative group/code">
                              <pre className="text-[11px] text-slate-400 bg-black/40 p-4 rounded-xl font-mono overflow-x-auto border border-white/5 scrollbar-thin scrollbar-thumb-white/5">
                                {cell.code}
                              </pre>
                              <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                <Terminal className="w-3 h-3 text-slate-600" />
                              </div>
                            </div>

                            {cell.stdout && (
                              <div className="mt-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1 tracking-widest flex items-center gap-1.5">
                                  <Activity className="w-3 h-3" /> Runtime Output
                                </p>
                                <pre className="text-[11px] text-emerald-300/80 font-mono whitespace-pre-wrap">{cell.stdout}</pre>
                              </div>
                            )}

                            {cell.error && (
                              <div className="mt-3 p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                                <p className="text-[10px] text-red-400 font-bold uppercase mb-1 tracking-widest">Execution Failure</p>
                                <pre className="text-[11px] text-red-300/80 font-mono whitespace-pre-wrap">{cell.error}</pre>
                              </div>
                            )}

                            {cell.artifacts?.charts && (
                              <div className="grid grid-cols-1 gap-4 mt-4">
                                {cell.artifacts.charts.map((chart: any, cIdx: number) => (
                                  <motion.div 
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    key={cIdx}
                                  >
                                    <InteractiveChart data={chart.plotly_json} title={chart.title} />
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Chat / Control Panel Overlay */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="bg-white/[0.05] border border-white/10 rounded-[2rem] p-2 flex items-center backdrop-blur-2xl shadow-2xl ring-1 ring-white/10 group-focus-within:ring-indigo-500/40 transition-all">
                        <div className="flex gap-2 pl-4">
                          <button 
                            onClick={() => handleAgentChat("Perform a deep-dive autonomous audit of the dataset and find key drivers.")}
                            className="p-2.5 rounded-full bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-lg shadow-indigo-500/10"
                            title="Discovery Audit"
                          >
                            <Sparkles className="w-5 h-5" />
                          </button>
                        </div>
                        <input
                          className="flex-1 bg-transparent border-none px-4 py-4 text-sm text-white placeholder-slate-500 focus:outline-none"
                          placeholder="Command the Autonomous Data Scientist..."
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAgentChat(); } }}
                        />
                        <button 
                          onClick={() => handleAgentChat()} 
                          disabled={loading || !sessionId || !query} 
                          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest flex items-center transition-all shadow-lg shadow-indigo-600/20"
                        >
                          {loading ? <Activity className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-2" />}
                          {loading ? "In Loop" : "Execute"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-4 flex flex-col gap-4 min-h-0">
                  {/* Thought Stream Panel */}
                  <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex flex-col min-h-0 backdrop-blur-md">
                    <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4 flex items-center">
                      <Activity className="w-4 h-4 mr-2" /> Thought Stream
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-none font-mono">
                      {streamLogs.length ? streamLogs.map((log, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={idx} 
                          className="flex gap-2"
                        >
                          <span className="text-indigo-500/50 text-[10px] shrink-0 mt-1">[{idx + 1}]</span>
                          <p className="text-[11px] text-slate-400 leading-relaxed border-l border-white/5 pl-3">{log}</p>
                        </motion.div>
                      )) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-30">
                          <Terminal className="w-10 h-10 mb-2" />
                          <p className="text-[10px] uppercase tracking-widest font-bold">Waiting for uplink...</p>
                        </div>
                      )}
                      <div ref={logEndRef} />
                    </div>
                  </div>

                  {/* Insights Panel */}
                  <div className="h-[280px] bg-gradient-to-br from-indigo-600/10 to-cyan-500/5 border border-white/10 rounded-2xl p-5 flex flex-col min-h-0 backdrop-blur-md shadow-inner">
                    <h2 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-4 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" /> Mission Insights
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/5">
                      {insights.length ? insights.map((insight, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={idx} 
                          className="bg-white/5 border border-white/5 rounded-xl p-3"
                        >
                          <p className="text-[11px] text-slate-300 font-medium leading-normal">{insight}</p>
                        </motion.div>
                      )) : (
                        <p className="text-[10px] text-slate-600 italic text-center mt-10">Neural synthesis pending...</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div 
              key="data"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 bg-white/[0.02] border border-white/5 rounded-3xl p-8 overflow-hidden flex flex-col"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Database className="w-6 h-6 text-indigo-400" /> 
                Raw Intelligence Projection
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/20 uppercase tracking-widest">10 Sample Records</span>
              </h2>
              <div className="flex-1 overflow-auto border border-white/5 rounded-2xl scrollbar-thin scrollbar-thumb-white/10">
                {previewData ? (
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-900 z-10">
                      <tr>
                        {Object.keys(previewData[0] || {}).map((k) => (
                          <th key={k} className="px-4 py-4 font-black uppercase tracking-widest text-slate-400 border-b border-white/10 text-[10px]">
                            {k}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {previewData.slice(0, 50).map((row: TableRow, idx: number) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-all">
                          {Object.keys(row).map((k) => (
                            <td key={k} className="px-4 py-3 font-mono text-[11px] text-slate-400">
                              {String(row[k])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-700">
                    <Database className="w-16 h-16 mb-4 opacity-20" />
                    <p className="font-bold uppercase tracking-widest text-sm opacity-50">No data projected into memory</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {errorMsg && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-24 right-6 max-w-sm p-4 bg-red-500/10 border border-red-500/20 backdrop-blur-2xl rounded-2xl z-[100] shadow-2xl"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Zap className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Pipeline Fault</h3>
              <p className="text-[11px] text-red-200/70">{errorMsg}</p>
            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
}
