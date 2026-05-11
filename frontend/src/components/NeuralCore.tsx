"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NeuralCoreProps {
  state: "idle" | "planning" | "executing" | "debating" | "healing" | "success" | "failure";
}

export const NeuralCore: React.FC<NeuralCoreProps> = ({ state }) => {
  const getCoreColor = () => {
    switch (state) {
      case 'planning': return 'from-indigo-500 to-purple-500';
      case 'executing': return 'from-amber-400 to-orange-600';
      case 'debating': return 'from-rose-500 to-pink-600';
      case 'healing': return 'from-cyan-400 to-emerald-500';
      case 'success': return 'from-emerald-400 to-teal-600';
      case 'failure': return 'from-rose-600 to-red-800';
      default: return 'from-slate-700 to-slate-900';
    }
  };

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Background Glow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1.2 }}
          exit={{ opacity: 0, scale: 1.5 }}
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${getCoreColor()} blur-3xl`}
        />
      </AnimatePresence>

      {/* Main Pulse Orbs */}
      <div className="relative w-16 h-16">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: 360,
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`w-full h-full rounded-full border-2 border-white/10 p-1`}
        >
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${getCoreColor()} shadow-[0_0_20px_rgba(99,102,241,0.5)]`} />
        </motion.div>

        {/* Orbitals */}
        <AnimatePresence>
            {state !== 'idle' && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-10px] border border-dashed border-indigo-500/30 rounded-full"
                    />
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, rotate: -360 }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-20px] border border-white/5 rounded-full"
                    />
                </>
            )}
        </AnimatePresence>
        
        {/* State Indicator Particle */}
        <motion.div
            layoutId="particle"
            className={`absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]`}
            animate={{
                x: state === 'idle' ? 0 : [20, -20, 20],
                y: state === 'idle' ? 0 : [-20, 20, -20],
            }}
            transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      
      {/* State Label */}
      <div className="absolute -bottom-8 w-full text-center">
        <AnimatePresence mode="wait">
            <motion.span
                key={state}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]"
            >
                {state}
            </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};
