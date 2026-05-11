"use client";

import React from "react";
import { motion } from "framer-motion";

interface NeuralCoreProps {
  status: "idle" | "planning" | "executing" | "success" | "error";
}

export const NeuralCore: React.FC<NeuralCoreProps> = ({ status }) => {
  const getColors = () => {
    switch (status) {
      case "planning":
        return ["#818cf8", "#c084fc"]; // Indigo to Purple
      case "executing":
        return ["#22d3ee", "#818cf8"]; // Cyan to Indigo
      case "success":
        return ["#34d399", "#22d3ee"]; // Emerald to Cyan
      case "error":
        return ["#f87171", "#fb923c"]; // Red to Orange
      default:
        return ["#475569", "#1e293b"]; // Slate
    }
  };

  const colors = getColors();

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Outer Rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-white/10"
          animate={{
            rotate: 360 * i,
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 10 / i,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* The Core */}
      <motion.div
        className="w-16 h-16 rounded-full blur-xl"
        animate={{
          scale: status === "idle" ? [1, 1.1, 1] : [1, 1.3, 1],
          backgroundColor: colors[0],
        }}
        transition={{
          duration: status === "idle" ? 3 : 1,
          repeat: Infinity,
        }}
      />
      
      <motion.div
        className="absolute w-12 h-12 rounded-full z-10 flex items-center justify-center overflow-hidden bg-black/40 backdrop-blur-md border border-white/20 shadow-2xl"
        animate={{
          boxShadow: `0 0 20px ${colors[0]}`,
          borderColor: colors[1],
        }}
      >
        <motion.div
          className="w-4 h-4 rounded-full"
          animate={{
            backgroundColor: colors[0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      </motion.div>

      {/* Floating Particles */}
      {status !== "idle" && [1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 100,
            backgroundColor: colors[i % 2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
          }}
        />
      ))}
    </div>
  );
};
