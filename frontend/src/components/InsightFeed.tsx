"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquareCode, Target, ArrowUpRight } from 'lucide-react';

interface InsightFeedProps {
    insights: string[];
}

export const InsightFeed: React.FC<InsightFeedProps> = ({ insights }) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <MessageSquareCode className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Executive Insights</h3>
            </div>

            {insights.map((insight, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 relative group"
                >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="w-3 h-3 text-indigo-400" />
                    </div>
                    <div className="flex gap-3">
                        <div className="mt-1">
                            <Target className="w-3 h-3 text-indigo-500" />
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed italic">
                            {insight}
                        </p>
                    </div>
                </motion.div>
            ))}

            {insights.length === 0 && (
                <div className="h-32 flex items-center justify-center border border-dashed border-white/5 rounded-2xl">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest">Synthesis Pending...</p>
                </div>
            )}
        </div>
    );
};
