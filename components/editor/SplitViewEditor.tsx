"use client";

import React from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable";
import { motion } from 'framer-motion';
import { useDocumentStore } from '@/lib/store/useStore';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function SplitViewEditor() {
  const originalText = useDocumentStore((state) => state.originalText);
  const humanizedText = useDocumentStore((state) => state.humanizedText);
  const status = useDocumentStore((state) => state.status);

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full">
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="h-full p-8 border-r border-white/10 overflow-auto bg-black/40">
          <div className="flex items-center gap-2 mb-6 text-xs font-bold uppercase tracking-widest text-red-400">
            <AlertCircle className="w-4 h-4" />
            Original Document (AI Detected)
          </div>
          <div className="text-gray-300 leading-relaxed space-y-4">
            {originalText ? (
              originalText.split('. ').map((sentence, i) => (
                <span key={i} className="bg-red-500/10 border-b border-red-500/30 px-1 rounded-sm">
                  {sentence}{sentence.endsWith('.') ? '' : '.'}{' '}
                </span>
              ))
            ) : (
              <div className="animate-pulse flex space-y-4 flex-col">
                <div className="h-4 bg-white/5 rounded w-3/4" />
                <div className="h-4 bg-white/5 rounded w-full" />
                <div className="h-4 bg-white/5 rounded w-5/6" />
              </div>
            )}
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle className="w-px bg-white/10 hover:bg-purple-500/50 transition-colors cursor-col-resize" />

      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="h-full p-8 overflow-auto bg-purple-500/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Humanized Output
              </div>
              {humanizedText?.includes('[NOTE:') && (
                <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] text-yellow-500 font-bold uppercase tracking-tighter">
                  Smart Simulation
                </span>
              )}
            </div>
            {status !== 'completed' && status !== 'idle' && (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-[10px] text-purple-400 font-mono"
              >
                PROCESSING_PIPELINE_V2...
              </motion.span>
            )}
          </div>
          <div className="text-gray-100 leading-relaxed whitespace-pre-wrap">
            {humanizedText || (
              <div className="space-y-4">
                <div className="h-4 bg-purple-500/10 rounded w-full animate-pulse" />
                <div className="h-4 bg-purple-500/10 rounded w-5/6 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="h-4 bg-purple-500/10 rounded w-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
