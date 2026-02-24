"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Sparkles, Download, ShieldCheck, Zap } from 'lucide-react';
import { useDocumentStore } from '@/lib/store/useStore';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { SplitViewEditor } from '../editor/SplitViewEditor';
import { toast } from 'sonner';
import { extractText, createDownloadableFile } from '@/lib/docs/processor';

export function GlassDashboard() {
  const file = useDocumentStore((state) => state.file);
  const status = useDocumentStore((state) => state.status);
  const progress = useDocumentStore((state) => state.progress);
  const humanizedText = useDocumentStore((state) => state.humanizedText);

  const setFile = useDocumentStore((state) => state.setFile);
  const setStatus = useDocumentStore((state) => state.setStatus);
  const setProgress = useDocumentStore((state) => state.setProgress);
  const setOriginalText = useDocumentStore((state) => state.setOriginalText);
  const setHumanizedText = useDocumentStore((state) => state.setHumanizedText);

  const onDrop = async (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setStatus('extracting');
    setProgress(10);
    const extractionToastId = toast.info("Extracting document content...");

    try {
      // 1. Extraction Phase
      const extractedText = await extractText(uploadedFile);
      setOriginalText(extractedText);
      setProgress(30);
      toast.dismiss(extractionToastId);

      // 2. Humanization Phase
      setStatus('humanizing');
      const humanizeToastId = toast.loading("Rewriting with Claude 3.5 Sonnet...");

      const response = await fetch('/api/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: extractedText, fileType: uploadedFile.type }),
      });

      toast.dismiss(humanizeToastId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Humanization failed');
      }

      setProgress(70);

      // 3. Reformatting Phase
      setStatus('reformatting');
      setHumanizedText(data.humanized);
      setProgress(90);

      // 4. Completion
      setStatus('completed');
      setProgress(100);
      toast.success("Humanization complete!");
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      toast.error(error.message || "An error occurred during processing.");
    }
  };

  const handleDownload = async () => {
    if (!file || !humanizedText) return;
    try {
      const blob = await createDownloadableFile(file, humanizedText);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `humanized_${file.name}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Download started!");
    } catch (error) {
      toast.error("Failed to prepare download.");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  return (
    <div className="min-h-screen bg-[#0c0a09] text-white p-6 md:p-12 overflow-hidden relative selection:bg-rose-500/30">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-rose-600/15 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-600/15 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.location.reload()}
          >
            <div className="p-2.5 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl shadow-lg shadow-rose-500/20 group-hover:shadow-rose-500/40 transition-shadow duration-500">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white/90">Humanized<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">Brain</span></h1>
          </motion.div>

          <div className="hidden md:flex gap-8 items-center text-sm font-medium text-gray-400">
            <span className="hover:text-rose-300 cursor-pointer transition-colors duration-300">How it works</span>
            <span className="hover:text-rose-300 cursor-pointer transition-colors duration-300">Integrations</span>
            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 hover:text-white backdrop-blur-md rounded-full px-6 py-5 transition-all duration-300 h-10">
              Usage: 4/10 Credits
            </Button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {status === 'idle' ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-24"
            >
              <div className="text-center max-w-3xl mx-auto mb-20">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium mb-8"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>The most advanced AI text humanizer</span>
                </motion.div>
                <h2 className="text-5xl md:text-6xl font-extrabold mb-8 leading-[1.1] tracking-tight">
                  Give Your AI Text a <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400">Human Soul.</span>
                </h2>
                <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                  Upload your documents and let our models analyze AI patterns, injecting human burstiness and natural warmth while preserving 100% of your formatting.
                </p>
              </div>

              <div
                {...getRootProps()}
                className={`
                  relative group cursor-pointer max-w-4xl mx-auto
                  border-2 border-dashed rounded-[32px] p-20 transition-all duration-500
                  ${isDragActive ? 'border-rose-400 bg-rose-500/5' : 'border-white/10 bg-white/5 backdrop-blur-xl'}
                  hover:border-rose-500/40 hover:bg-rose-500/5 hover:shadow-2xl hover:shadow-rose-500/10
                `}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-rose-500/20 to-orange-500/20 rounded-3xl flex items-center justify-center mb-8 border border-rose-500/20 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-rose-900/20">
                    <Upload className="w-10 h-10 text-rose-400 group-hover:text-rose-300 transition-colors" />
                  </div>
                  <p className="text-2xl font-semibold mb-3 tracking-tight text-white/90">Click or drag & drop your document</p>
                  <p className="text-gray-500 text-sm font-medium">Supports PDF & DOCX up to 25MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
                {[
                  { icon: ShieldCheck, title: "100% Format Preservation", desc: "Headers, tables, and styles remain untouched during the entire intelligent rewrite process." },
                  { icon: Zap, title: "Zero Hallucination", desc: "Core meaning is preserved with mathematical precision and facts are safeguarded." },
                  { icon: FileText, title: "Undetectable Flow", desc: "Guaranteed 100% human-like flow and rhythm that reads completely naturally." }
                ].map((feature, i) => (
                  <div key={i} className="bg-white/[0.03] hover:bg-white/[0.06] transition-colors duration-500 backdrop-blur-md p-8 rounded-[24px] border border-white/5 hover:border-white/10">
                    <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/20">
                      <feature.icon className="w-6 h-6 text-rose-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-3 text-white/90">{feature.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-3 tracking-tight text-white/90">
                    {status === 'completed' ? 'Humanization Complete' : 'Weaving Human Nuances...'}
                    {status !== 'completed' && status !== 'error' && <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}><Sparkles className="w-6 h-6 text-rose-400" /></motion.div>}
                  </h2>
                  <p className="text-rose-200/60 mt-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> {file?.name}
                  </p>
                </div>
                {status === 'completed' && (
                  <Button
                    onClick={handleDownload}
                    className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white shadow-lg shadow-rose-500/25 border-0 rounded-full px-8 py-6 h-auto text-base font-medium transition-all duration-300 hover:scale-105 gap-3"
                  >
                    <Download className="w-5 h-5" /> Download Result
                  </Button>
                )}
                {status === 'error' && (
                  <Button
                    onClick={() => window.location.reload()}
                    variant="destructive"
                    className="rounded-full px-8 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                  >
                    Try Again
                  </Button>
                )}
              </div>

              <div className="space-y-3 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-rose-300 capitalize flex items-center gap-2">
                    {status === 'extracting' && 'Reading original document...'}
                    {status === 'humanizing' && 'Applying human cognitive models...'}
                    {status === 'reformatting' && 'Restoring formatting and structure...'}
                    {status === 'completed' && 'Done!'}
                  </span>
                  <span className="text-white/60 font-mono">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3 bg-white/5 rounded-full overflow-hidden [&>div]:bg-gradient-to-r [&>div]:from-rose-500 [&>div]:to-orange-500" />
              </div>

              <div className="h-[650px] rounded-[32px] overflow-hidden border border-white/10 bg-[#0c0a09] shadow-2xl shadow-rose-900/10">
                <SplitViewEditor />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
