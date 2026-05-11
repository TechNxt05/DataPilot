"use client";

import React, { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Handle, 
  Position, 
  NodeProps,
  Edge,
  Node,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';

const TaskNode = ({ data }: NodeProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'border-emerald-500/50 shadow-emerald-500/20';
      case 'running': return 'border-indigo-500 shadow-indigo-500/30 animate-pulse';
      case 'error': return 'border-rose-500/50 shadow-rose-500/20';
      case 'healed': return 'border-amber-500/50 shadow-amber-500/20';
      default: return 'border-white/10';
    }
  };

  return (
    <div className={`px-4 py-2 rounded-lg bg-slate-900 border ${getStatusColor(data.status)} shadow-lg backdrop-blur-xl min-w-[150px]`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-indigo-500" />
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-widest">{data.tool}</span>
        <span className="text-xs font-semibold text-white truncate">{data.title}</span>
        <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${data.status === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
            <span className="text-[8px] text-gray-400 uppercase">{data.status}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-indigo-500" />
    </div>
  );
};

const nodeTypes = {
  task: TaskNode,
};

interface ExecutionGraphProps {
  graph: {
    nodes: any[];
    edges: any[];
  };
}

export const ExecutionGraph: React.FC<ExecutionGraphProps> = ({ graph }) => {
  const nodes: Node[] = useMemo(() => graph.nodes.map((n, i) => ({
    id: n.id,
    type: 'task',
    data: n,
    position: { x: 250 * (i % 3), y: 100 * Math.floor(i / 3) },
  })), [graph]);

  const edges: Edge[] = useMemo(() => graph.edges.map(e => ({
    id: `e-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
  })), [graph]);

  return (
    <div className="w-full h-[400px] bg-slate-950/50 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-4 left-4 z-10">
            <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Neural Execution DAG</h3>
        </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        className="bg-transparent"
      >
        <Background color="#1e293b" gap={20} />
        <Controls showInteractive={false} className="bg-slate-900 border-white/10 fill-white" />
      </ReactFlow>
    </div>
  );
};
