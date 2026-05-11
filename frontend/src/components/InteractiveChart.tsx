"use client";

import React from "react";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface InteractiveChartProps {
  data: any;
  title: string;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ data, title }) => {
  return (
    <div className="w-full h-full bg-black/20 rounded-xl border border-white/5 overflow-hidden group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
      <div className="p-2 border-b border-white/5 flex justify-between items-center bg-white/5">
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{title}</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-indigo-500/50" />
          <div className="w-2 h-2 rounded-full bg-cyan-500/50" />
        </div>
      </div>
      <div className="p-1">
        <Plot
          data={data.data}
          layout={{
            ...data.layout,
            autosize: true,
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            margin: { t: 30, b: 40, l: 40, r: 20 },
            font: { color: "#94a3b8", size: 10, family: "Inter, sans-serif" },
            xaxis: { ...data.layout?.xaxis, gridcolor: "rgba(255,255,255,0.05)" },
            yaxis: { ...data.layout?.yaxis, gridcolor: "rgba(255,255,255,0.05)" },
          }}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: "100%", height: "300px" }}
          useResizeHandler={true}
        />
      </div>
    </div>
  );
};
