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
    <div className="min-h-screen bg-[#0a0a0b] text-white p-6 md:p-12 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.location.reload()}
          >
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg shadow-purple-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Humanized<span className="text-purple-400">Brain</span></h1>
          </motion.div>

          <div className="hidden md:flex gap-6 items-center text-sm text-gray-400">
            <span className="hover:text-white cursor-pointer transition-colors">How it works</span>
            <span className="hover:text-white cursor-pointer transition-colors">Integrations</span>
            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md">
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
              className="mt-20"
            >
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-5xl font-extrabold mb-6 leading-tight">
                  Give Your AI Text a <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Human Soul.</span>
                </h2>
                <p className="text-gray-400 text-lg">
                  Upload PDF or Word documents. We analyze AI patterns and inject human burstiness while preserving 100% of your original formatting.
                </p>
              </div>

              <div
                {...getRootProps()}
                className={`
                  relative group cursor-pointer max-w-4xl mx-auto
                  border-2 border-dashed rounded-[32px] p-16 transition-all duration-500
                  ${isDragActive ? 'border-purple-500 bg-purple-500/5' : 'border-white/10 bg-white/5 backdrop-blur-xl'}
                  hover:border-purple-500/50 hover:bg-purple-500/2
                `}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                    <Upload className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-xl font-medium mb-2">Drag & drop your document</p>
                  <p className="text-gray-500">PDF, DOCX up to 25MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
                {[
                  { icon: ShieldCheck, title: "100% Format Preservation", desc: "Headers, tables, and styles remain untouched." },
                  { icon: Zap, title: "Zero Hallucination", desc: "Meaning is preserved with mathematical precision." },
                  { icon: FileText, title: "AI Detector Bypass", desc: "Guaranteed 100% human score on GPTZero." }
                ].map((feature, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                    <feature.icon className="w-6 h-6 text-purple-400 mb-4" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    {status === 'completed' ? 'Humanization Complete' : 'Humanizing Document...'}
                    {status !== 'completed' && status !== 'error' && <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><Sparkles className="w-5 h-5 text-purple-400" /></motion.div>}
                  </h2>
                  <p className="text-gray-400 mt-1">{file?.name}</p>
                </div>
                {status === 'completed' && (
                  <Button
                    onClick={handleDownload}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 gap-2 px-6"
                  >
                    <Download className="w-4 h-4" /> Download Result
                  </Button>
                )}
                {status === 'error' && (
                  <Button
                    onClick={() => window.location.reload()}
                    variant="destructive"
                  >
                    Try Again
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-purple-400 font-medium capitalize">{status}...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-white/5" />
              </div>

              <div className="h-[600px] rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md">
                <SplitViewEditor />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
