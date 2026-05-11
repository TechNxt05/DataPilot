"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ShieldCheck, ShieldAlert, TrendingUp } from 'lucide-react';

interface Hypothesis {
  id: string;
  statement: string;
  explanation: string;
  confidence: number;
  evidence: string[];
  conflicting_evidence: string[];
  status: string;
}

export const HypothesisConsole: React.FC<{ hypotheses: Hypothesis[] }> = ({ hypotheses }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-gray-200">Strategic Hypotheses</h3>
      </div>
      
      <AnimatePresence>
        {hypotheses.map((h, i) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-indigo-500/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${h.confidence > 0.8 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-xs font-mono text-gray-400 uppercase">Confidence: {(h.confidence * 100).toFixed(0)}%</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-mono uppercase">
                {h.status}
              </span>
            </div>
            
            <p className="text-sm text-white font-medium mb-2">{h.statement}</p>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">{h.explanation}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Evidence
                </span>
                {h.evidence.map((e, idx) => (
                  <span key={idx} className="text-[10px] text-gray-500">- {e}</span>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-rose-400 uppercase font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Conflicts
                </span>
                {h.conflicting_evidence.map((e, idx) => (
                  <span key={idx} className="text-[10px] text-gray-500">- {e}</span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {hypotheses.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl">
            <TrendingUp className="w-8 h-8 text-gray-700 mb-2" />
            <p className="text-xs text-gray-500">Autonomous theory engine idling...</p>
        </div>
      )}
    </div>
  );
};
