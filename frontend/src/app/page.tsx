"use client";

import { useState } from "react";
import axios from "axios";
import PlotRenderer from "@/components/PlotRenderer";
import { UploadCloud, MessageSquare, PlusCircle, Database, Server, Zap, Compass, Command } from "lucide-react";

export default function Home() {
  // Input State
  const [sourceType, setSourceType] = useState<"file" | "mongo" | "sql">("file");
  const [file, setFile] = useState<File | null>(null);
  const [dbUri, setDbUri] = useState("");
  const [dbName, setDbName] = useState("");
  const [dbCol, setDbCol] = useState("");
  const [sqlQuery, setSqlQuery] = useState("");
  
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  
  // Display State
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [schemaData, setSchemaData] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const defaultChips = [
    "Clean this dataset completely",
    "Visualize correlations and trends",
    "Identify outliers and drop duplicates",
    "Predict the target applying ML model",
    "Generate SQL query for top items"
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
  };
  
  const buildFormData = (promptStr: string = "") => {
    const formData = new FormData();
    formData.append("source_type", sourceType);
    if (sourceType === "file" && file) formData.append("file", file);
    if (sourceType === "mongo") { formData.append("db_uri", dbUri); formData.append("db_name", dbName); formData.append("db_col", dbCol); }
    if (sourceType === "sql") { formData.append("db_uri", dbUri); formData.append("sql_query", sqlQuery); }
    if (promptStr) formData.append("prompt", promptStr);
    return formData;
  }

  const handleConnect = async () => {
    setConnecting(true);
    setErrorMsg(null);
    setPreviewData(null);
    setResult(null);
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/preview_data", buildFormData(), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.error) setErrorMsg(response.data.error);
      else {
        setPreviewData(response.data.data);
        setSchemaData(response.data.schema);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to preview data.");
    } finally {
      setConnecting(false);
    }
  };

  const handleAgentChat = async (directQuery: string = query) => {
    if (!directQuery) return;
    setLoading(true);
    setErrorMsg(null);
    setResult(null);
    
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/process_file", buildFormData(directQuery), {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.error || response.data.status === "error" || response.data.status === "blocked") {
        setErrorMsg(response.data.message || response.data.error || "An error occurred");
      } else {
        setResult(response.data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reach the API backend.");
    } finally {
      setLoading(false);
    }
  };

  const renderDataViewer = () => (
    <div className="flex flex-col h-full bg-white/5 border border-white/10 rounded-2xl p-6 overflow-hidden">
      <h3 className="text-xl font-semibold mb-4 text-gray-200">Data Viewer</h3>
      {previewData ? (
        <div className="overflow-x-auto border border-white/10 rounded-lg h-full">
           <table className="w-full text-left text-sm text-gray-300">
             <thead className="bg-black/50 uppercase text-xs sticky top-0">
               <tr>
                 {Object.keys(previewData[0] || {}).map((key) => (
                   <th key={key} className="px-4 py-3 font-medium border-b border-white/10">{key} <span className="text-gray-500 lowercase ml-1">({schemaData?.[key]})</span></th>
                 ))}
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
               {previewData.map((row: any, i: number) => (
                 <tr key={i} className="hover:bg-white/5">
                   {Object.keys(previewData[0] || {}).map((key) => (
                     <td key={key} className="px-4 py-2 truncate max-w-[200px]">{String(row[key])}</td>
                   ))}
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
           <Database className="w-16 h-16 mb-4" />
           <p>Connect a data source to view it here.</p>
        </div>
      )}
    </div>
  );
  
  const renderAgentResult = () => {
      const intent = result.intent;
      const data = result.data;
      
      return (
        <div className="mt-6 flex flex-col p-6 rounded-2xl bg-gradient-to-tr from-indigo-900/40 to-cyan-900/40 border border-indigo-500/30">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                 <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                 Result: {intent.toUpperCase()}
              </h3>
              {result.status === "healed" && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/50">Auto-Healed by Agent</span>}
           </div>
           
           {result.status === "healed" && (
               <div className="mb-4 bg-black/40 p-4 rounded-lg flex flex-col text-sm border border-emerald-500/20">
                   <p className="font-semibold text-emerald-400 mb-2">Fix applied by Reflection Agent:</p>
                   <code className="text-gray-300 font-mono">{data.healing_code}</code>
               </div>
           )}

           {intent === "clean" && (
              <div className="grid grid-cols-2 gap-4 my-2 text-center">
                 <div className="bg-white/10 p-3 rounded-lg"><p className="text-gray-400 text-sm">Quality Before</p><p className="text-2xl text-red-300 font-bold">{data.quality_before?.score}/100</p></div>
                 <div className="bg-white/10 p-3 rounded-lg"><p className="text-gray-400 text-sm">Quality After</p><p className="text-2xl text-green-400 font-bold">{data.quality_after?.score}/100</p></div>
              </div>
           )}
           {intent === "visualize" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                 {Object.entries(data.charts || {}).map(([name, fig]: [string, any], idx) => (
                    <div key={idx} className="bg-black/30 rounded-xl overflow-hidden"><PlotRenderer figure={fig} /></div>
                 ))}
              </div>
           )}
           {intent === "analyze" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                 {data.insights?.correlations?.map((c: any, i: number) => (
                     <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/10"><div className="text-xs text-gray-400 truncate">{c.feature_1} & {c.feature_2}</div><div className="text-lg font-bold text-indigo-400">{c.correlation}</div></div>
                 ))}
              </div>
           )}
        </div>
      );
  }

  return (
    <main className="min-h-screen h-screen overflow-hidden bg-slate-950 text-white flex flex-col font-sans">
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(90,90,200,0.2),rgba(255,255,255,0))]" />
      
      {/* Header */}
      <header className="h-16 border-b border-white/10 flex items-center px-6 relative z-10 shrink-0 bg-black/20 backdrop-blur-md">
         <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent flex items-center">
            <Command className="mr-2" /> DataPilot Workspace
         </h1>
      </header>

      {/* Main 3-Pane Layout */}
      <div className="flex-1 flex overflow-hidden relative z-10 w-full max-w-[1600px] mx-auto p-4 gap-4">
        
        {/* Left Pane - Sidebar Tools */}
        <aside className="w-[340px] flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar shrink-0">
           {/* Section 1: Data Connection */}
           <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-xl">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-200"><Server className="w-4 h-4 mr-2"/> Database Config</h2>
              
              <div className="flex bg-white/10 p-1 rounded-lg mb-4 text-sm font-medium">
                <button onClick={() => setSourceType("file")} className={`flex-1 py-1 px-2 rounded-md ${sourceType === "file" ? "bg-indigo-500 text-white shadow" : "text-gray-400"}`}>File</button>
                <button onClick={() => setSourceType("mongo")} className={`flex-1 py-1 px-2 rounded-md ${sourceType === "mongo" ? "bg-green-600 text-white shadow" : "text-gray-400"}`}>Mongo</button>
                <button onClick={() => setSourceType("sql")} className={`flex-1 py-1 px-2 rounded-md ${sourceType === "sql" ? "bg-blue-600 text-white shadow" : "text-gray-400"}`}>SQL</button>
              </div>

              {sourceType === "file" && (
                 <label className="flex flex-col items-center justify-center w-full h-24 border border-white/10 border-dashed rounded-xl cursor-pointer hover:bg-white/10 transition">
                    <UploadCloud className="w-6 h-6 mb-1 text-gray-400" />
                    <span className="text-xs text-gray-400 truncate w-11/12 text-center">{file ? <span className="text-green-400">{file.name}</span> : "Upload File"}</span>
                    <input type="file" className="hidden" accept=".csv,.json,.xlsx,.parquet" onChange={handleFileUpload} />
                 </label>
              )}
              {sourceType === "mongo" && (
                 <div className="space-y-3">
                   <input type="text" placeholder="MongoDB String" value={dbUri} onChange={e => setDbUri(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
                   <input type="text" placeholder="DB Name" value={dbName} onChange={e => setDbName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
                   <input type="text" placeholder="Collection" value={dbCol} onChange={e => setDbCol(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
                 </div>
              )}
              {sourceType === "sql" && (
                 <div className="space-y-3">
                   <input type="text" placeholder="SQL Connection String" value={dbUri} onChange={e => setDbUri(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
                   <input type="text" placeholder="SQL Query (SELECT * FROM...)" value={sqlQuery} onChange={e => setSqlQuery(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
                 </div>
              )}

              <button onClick={handleConnect} disabled={connecting} className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm font-semibold transition flex justify-center">
                 {connecting ? "Connecting..." : "Preview Data"}
              </button>
           </div>

           {/* Section 2: Quick Toolbox */}
           <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-xl">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-200"><Compass className="w-4 h-4 mr-2"/> Agent Toolbox</h2>
              <div className="grid grid-cols-1 gap-2">
                 <button onClick={() => handleAgentChat("visualize trends")} className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 py-2 rounded-lg text-sm transition">Data Visualisation</button>
                 <button onClick={() => handleAgentChat("analyze the dataset")} className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 py-2 rounded-lg text-sm transition">Data Analysis</button>
                 <button onClick={() => handleAgentChat("run ml clustering")} className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 py-2 rounded-lg text-sm transition">ML Implementation</button>
              </div>
           </div>
        </aside>

        {/* Right Area - Data Viewer & Chat */}
        <section className="flex-1 flex flex-col min-w-0 pr-2 pb-2 gap-4">
           {/* Top Main Pane: Dataset & Agent Result View */}
           <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
               {errorMsg && (
                 <div className="p-4 bg-red-900/40 border border-red-500 text-red-200 rounded-xl">
                   <p className="font-semibold">Error</p>
                   <p className="text-sm opacity-80">{errorMsg}</p>
                 </div>
               )}
               {renderDataViewer()}
               {result && renderAgentResult()}
           </div>

           {/* Bottom Floating Chatbox */}
           <div className="h-[200px] shrink-0 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col backdrop-blur-lg relative">
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar mb-2">
                 {defaultChips.map((c, i) => (
                    <button key={i} onClick={() => { setQuery(c); handleAgentChat(c); }} className="whitespace-nowrap bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-xs text-gray-300 transition shrink-0 flex items-center">
                       <PlusCircle className="w-3 h-3 mr-1 opacity-50" /> {c}
                    </button>
                 ))}
              </div>
              <div className="flex-1 relative">
                 <textarea
                   className="w-full h-full bg-black/40 border-none rounded-xl p-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none resize-none text-gray-200 placeholder-gray-500 pr-12"
                   placeholder="Ask an agent to process this database/file..."
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                   onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAgentChat(); } }}
                 />
                 <button onClick={() => handleAgentChat()} disabled={loading} className="absolute right-3 bottom-3 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition disabled:opacity-50 shadow-lg">
                    <MessageSquare className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </main>
  );
}
