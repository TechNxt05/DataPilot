"use client";

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, BrainCircuit, Zap, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface Log {
  agent_id?: string;
  state?: string;
  message: string;
  timestamp?: number;
}

export const ThoughtStream: React.FC<{ logs: Log[] }> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [logs]);

  const getAgentIcon = (id: string) => {
    switch (id) {
      case 'PlannerAgent': return <BrainCircuit className="w-3 h-3 text-indigo-400" />;
      case 'ExecutorAgent': return <Zap className="w-3 h-3 text-amber-400" />;
      case 'CriticAgent': return <ShieldAlert className="w-3 h-3 text-rose-400" />;
      case 'ReflectionAgent': return <AlertCircle className="w-3 h-3 text-cyan-400" />;
      default: return <Terminal className="w-3 h-3 text-gray-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-500" />
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">Thought Stream</h3>
        </div>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] text-emerald-500/80 font-mono uppercase">Live</span>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
      >
        <AnimatePresence mode="popLayout">
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="flex gap-3"
            >
              <div className="mt-1">
                {getAgentIcon(log.agent_id || '')}
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-200 uppercase tracking-tighter">
                    {log.agent_id || 'System'}
                  </span>
                  {log.state && (
                    <span className="text-[8px] px-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase font-mono">
                      {log.state}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-mono selection:bg-indigo-500/30">
                  {log.message}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {logs.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <p className="text-[10px] text-gray-600 font-mono animate-pulse">Waiting for neural link synchronization...</p>
          </div>
        )}
      </div>
    </div>
  );
};
