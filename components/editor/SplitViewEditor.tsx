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
  const mode = useDocumentStore((state) => state.mode);

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full rounded-[32px] overflow-hidden">
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="h-full p-8 md:p-10 border-r border-white/5 overflow-auto bg-[#141010]">
          <div className="flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-[0.2em] text-red-400/80">
            <AlertCircle className="w-4 h-4" />
            Original Text (AI Assessed)
          </div>
          <div className="text-gray-400/90 leading-loose space-y-4 font-serif text-lg">
            {originalText ? (
              originalText.split('. ').map((sentence, i) => (
                <span key={i} className="bg-red-500/5 hover:bg-red-500/10 transition-colors border-b border-red-500/20 px-1.5 py-0.5 rounded-md inline-block mb-1">
                  {sentence}{sentence.endsWith('.') ? '' : '.'}{' '}
                </span>
              ))
            ) : (
              <div className="animate-pulse flex space-y-6 flex-col mt-4">
                <div className="h-3 bg-white/5 rounded-full w-3/4" />
                <div className="h-3 bg-white/5 rounded-full w-full" />
                <div className="h-3 bg-white/5 rounded-full w-5/6" />
                <div className="h-3 bg-white/5 rounded-full w-4/5" />
              </div>
            )}
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle className="w-1 bg-white/5 hover:bg-rose-500/50 active:bg-rose-500 transition-colors cursor-col-resize relative z-10" />

      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="h-full p-8 md:p-10 overflow-auto bg-gradient-to-br from-rose-500/[0.03] to-orange-500/[0.03]">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Humanized Output
              </div>
              {mode === 'simulation' && (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-500 font-bold uppercase tracking-wider backdrop-blur-sm">
                  Smart Simulation
                </span>
              )}
            </div>

            {status !== 'completed' && status !== 'idle' && (
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-[11px] text-rose-400/80 font-medium tracking-wider italic flex items-center gap-2 bg-rose-500/10 px-3 py-1.5 rounded-full"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                rafting natural flow...
              </motion.span>
            )}
          </div>
          <div className="text-gray-200 leading-loose whitespace-pre-wrap font-serif text-lg selection:bg-rose-500/30">
            {humanizedText || (
              <div className="space-y-6 mt-4">
                <div className="h-3 bg-rose-500/10 rounded-full w-full animate-pulse" />
                <div className="h-3 bg-rose-500/10 rounded-full w-5/6 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="h-3 bg-rose-500/10 rounded-full w-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                <div className="h-3 bg-rose-500/10 rounded-full w-2/3 animate-pulse" style={{ animationDelay: '0.6s' }} />
              </div>
            )}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
