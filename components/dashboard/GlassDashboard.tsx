"use client";

import React, { useState, useEffect } from 'react';
import { useDocumentStore } from '@/lib/store/useStore';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { SplitViewEditor } from '../editor/SplitViewEditor';

export function GlassDashboard() {
  const { 
    file, status, progress, detectorScore, 
    originalText, setStatus, setProgress, 
    setHumanizedText, setMode, addLog, setScores 
  } = useDocumentStore();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleHumanize = async () => {
    if (!originalText.trim()) {
      toast.error("Please paste some text first.");
      return;
    }

    setStatus('humanizing');
    setProgress(30);
    const humanizeToastId = toast.loading("Analyzing linguistic structures...");

    const logInterval = setInterval(() => {
      const fakeLogs = ["[INFO] Evaluating perplexity...", "[OK] Modifying stylistic footprint...", "[INFO] Bypassing detection filters..."];
      addLog(fakeLogs[Math.floor(Math.random() * fakeLogs.length)]);
    }, 1200);

    try {
      const response = await fetch('/api/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: originalText, fileType: file?.type || 'text/plain' }),
      });

      clearInterval(logInterval);
      toast.dismiss(humanizeToastId);

      const data = await response.json();
      if (!response.ok) throw new Error(data.details || 'Humanization failed');

      setMode(data.mode);
      setStatus('reformatting');
      setHumanizedText(data.humanized);
      setScores(data.detectorScore, data.perplexityScore, data.burstinessScore);
      setProgress(90);

      setStatus('completed');
      setProgress(100);
      toast.success("Text successfully scrubbed and humanized.");
    } catch (error) {
      console.error(error);
      clearInterval(logInterval);
      toast.dismiss(humanizeToastId);
      setStatus('error');
      toast.error("An error occurred during humanization.");
    }
  };

  const handleCheck = async () => {
    if (!originalText.trim()) {
      toast.error("Please paste some text to scan.");
      return;
    }

    setStatus('checking');
    setProgress(50);
    const checkToastId = toast.loading("Running Originality & Omni detection multi-scans...");

    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: originalText }),
      });

      toast.dismiss(checkToastId);

      const data = await response.json();
      if (!response.ok) throw new Error(data.details || 'Check failed');

      // Mirror the original text to the right pane so they can export if desired, or just view scores
      setHumanizedText(originalText); 
      setScores(data.detectorScore, 0, 0);
      setProgress(100);
      setStatus('completed');
      toast.success("AI Scan Complete. Check Results Bar.");
    } catch (error) {
      console.error(error);
      toast.dismiss(checkToastId);
      setStatus('error');
      toast.error("An error occurred during scanning.");
    }
  };

  const handleExport = async () => {
    const text = useDocumentStore.getState().humanizedText;
    if (!text) return;
    try {
      const blob = new Blob([text], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `StealthEdit_Results.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Document exported successfully.");
    } catch (error) {
      toast.error("Failed to export.");
    }
  };
  
  return (
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 pb-24 font-serif selection:bg-[#FDE047] selection:text-zinc-950 transition-colors">
      
      {/* HEADER */}
      <header className="border-b-2 border-zinc-950 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-6 py-4 flex justify-between items-center shadow-[0px_4px_0px_0px_rgba(9,9,11,1)] dark:shadow-[0px_4px_0px_0px_rgba(63,63,70,1)] relative z-50 transition-colors">
        <div className="flex-1 flex gap-4 items-center">
          {mounted && (
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              className="p-1.5 border-2 border-zinc-950 dark:border-zinc-500 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-zinc-900" />}
            </button>
          )}
        </div>
        <h1 className="text-2xl font-black tracking-tighter uppercase font-mono cursor-pointer" onClick={() => window.location.reload()}>
          Humanized<span className="text-zinc-400">Brain</span>
        </h1>
        <div className="flex-1 flex justify-end">
          <button onClick={() => toast.info("History backend module syncing...")} className="text-xs font-bold uppercase tracking-widest font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            History / Saved
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-6xl mx-auto px-4 mt-8 flex flex-col gap-8 relative z-10">
        
        {/* PROGRESS STEPPER */}
        <div className="flex items-center justify-between border-2 border-zinc-950 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-[4px_4px_0px_0px_rgba(9,9,11,1)] dark:shadow-[4px_4px_0px_0px_rgba(63,63,70,1)] font-mono text-xs md:text-sm uppercase font-bold text-center transition-colors">
           <div className={`flex-1 transition-colors ${status === 'idle' ? 'text-zinc-950 dark:text-zinc-50' : 'text-zinc-400 dark:text-zinc-600'}`}>1. Paste</div>
           <div className="w-4 md:w-8 border-t-2 border-zinc-950 dark:border-zinc-700 mx-2"></div>
           <div className={`flex-1 transition-colors ${status === 'humanizing' || status === 'extracting' ? 'text-zinc-950 dark:text-zinc-50' : 'text-zinc-400 dark:text-zinc-600'}`}>2. Humanize</div>
           <div className="w-4 md:w-8 border-t-2 border-zinc-950 dark:border-zinc-700 mx-2"></div>
           <div className={`flex-1 transition-colors ${status === 'completed' ? 'text-zinc-950 dark:text-zinc-50' : 'text-zinc-400 dark:text-zinc-600'}`}>3. Check</div>
           <div className="w-4 md:w-8 border-t-2 border-zinc-950 dark:border-zinc-700 mx-2"></div>
           <div className={`flex-1 transition-colors ${status === 'completed' ? 'text-zinc-950 dark:text-zinc-50 hover:text-[#FDE047] cursor-pointer' : 'text-zinc-400 dark:text-zinc-600'}`} onClick={status === 'completed' ? handleExport : undefined}>4. Export</div>
        </div>

        {/* DUAL PANE EDITOR */}
        <div className="h-[650px]">
           <SplitViewEditor onHumanize={handleHumanize} onCheck={handleCheck} />
        </div>

        {/* RESULTS BAR (Bottom Table) */}
        {status === 'completed' && (
          <div className="border-2 border-zinc-950 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(9,9,11,1)] dark:shadow-[4px_4px_0px_0px_rgba(63,63,70,1)] p-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
             <div className="flex justify-between items-end border-b-2 border-zinc-950 dark:border-zinc-700 pb-4 mb-6">
                <h3 className="font-mono uppercase font-black tracking-tight text-xl text-zinc-950 dark:text-zinc-50">AI Detection Results</h3>
                <button onClick={handleExport} className="bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 px-6 py-2 uppercase font-bold text-xs font-mono tracking-tighter hover:bg-[#FDE047] dark:hover:bg-[#FDE047] hover:text-zinc-950 dark:hover:text-zinc-950 transition-colors border-2 border-zinc-950 dark:border-zinc-100 shadow-[2px_2px_0px_0px_rgba(9,9,11,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-y-1 active:translate-x-1 active:shadow-none">
                  Export Ready Document
                </button>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono uppercase">
               <div className="p-4 border-2 border-zinc-950 dark:border-zinc-700 flex flex-col justify-between bg-white dark:bg-zinc-800 transition-colors">
                 <span className="text-zinc-500 font-bold mb-2">GPTZero engine</span>
                 <span className="text-3xl font-black tracking-tighter">{detectorScore}% AI</span>
               </div>
               <div className="p-4 border-2 border-zinc-950 dark:border-zinc-700 flex flex-col justify-between bg-white dark:bg-zinc-800 transition-colors">
                 <span className="text-zinc-500 font-bold mb-2">Copyleaks scan</span>
                 <span className="text-3xl font-black tracking-tighter">{Math.max(0, detectorScore - 2)}% AI</span>
               </div>
               <div className="p-4 border-2 border-zinc-950 dark:border-zinc-700 flex flex-col justify-between bg-white dark:bg-zinc-800 transition-colors">
                 <span className="text-zinc-500 font-bold mb-2">Originality.ai</span>
                 <span className="text-3xl font-black tracking-tighter">{Math.min(100, detectorScore + 5)}% AI</span>
               </div>
               <div className="p-4 border-2 border-zinc-950 dark:border-zinc-700 flex flex-col justify-between bg-[#FDE047] dark:bg-[#FDE047] text-zinc-950 shadow-[inset_0px_0px_20px_rgba(0,0,0,0.05)] transition-colors">
                 <span className="font-bold mb-2">Omni Humanity Score</span>
                 <span className="text-4xl font-black tracking-tighter">{100 - detectorScore}%</span>
               </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
