"use client";

import React, { useEffect, useState } from 'react';
import { useDocumentStore } from '@/lib/store/useStore';
import { ArrowRight } from 'lucide-react';

export function SplitViewEditor({ onHumanize, onCheck }: { onHumanize: () => void, onCheck: () => void }) {
  const {
    originalText,
    setOriginalText,
    humanizedText,
    setHumanizedText,
    status,
    intensity,
    setIntensity,
    detectorScore,
    hoveredIndex,
    setHoveredIndex,
    clickedIndex,
    setClickedIndex,
    variations
  } = useDocumentStore();

  const originalSentences = originalText ? originalText.split(/(?<=\.)\s+/) : [];
  const humanizedSentences = humanizedText ? humanizedText.split(/(?<=\.)\s+/) : [];

  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    if (status === 'completed') {
      let start = 0;
      const target = 100 - detectorScore;
      const interval = setInterval(() => {
        start += 2;
        if (start >= target) {
          setDisplayScore(target);
          clearInterval(interval);
        } else {
          setDisplayScore(start);
        }
      }, 20);
      return () => clearInterval(interval);
    } else {
      setDisplayScore(0);
    }
  }, [status, detectorScore]);

  const generateVariations = (sentence: string) => {
    return [
      `Fundamentally, ${sentence.charAt(0).toLowerCase() + sentence.slice(1)}`,
      `${sentence.replace(/The/g, 'A').replace(/is/g, 'often operates as')} ...`,
      `${sentence} To put it simply.`
    ];
  };

  const handleSentenceClick = (e: React.MouseEvent, index: number, sentence: string) => {
    e.stopPropagation();
    setClickedIndex(index, generateVariations(sentence));
  };

  const handleVariationReplace = (e: React.MouseEvent, variation: string) => {
    e.stopPropagation();
    if (clickedIndex === null) return;
    const newSentences = [...humanizedSentences];
    newSentences[clickedIndex] = variation;
    setHumanizedText(newSentences.join(' ')); // Add exact spacing if needed, mapped cleanly
    setClickedIndex(null);
  };

  return (
    <div className="flex flex-col h-full gap-5 relative">
      {/* FLOATING CONTROL BAR */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-zinc-900 border-2 border-zinc-950 dark:border-zinc-700 p-3 shadow-[4px_4px_0px_0px_rgba(9,9,11,1)] dark:shadow-[4px_4px_0px_0px_rgba(63,63,70,1)] font-mono z-20 transition-colors">
        <div className="flex gap-2 mb-3 md:mb-0 w-full md:w-auto">
          {['Standard', 'Professional', 'Academic', 'Creative'].map((level) => (
            <button
              key={level}
              onClick={() => setIntensity(level as any)}
              className={`flex-1 md:flex-none px-4 py-2 uppercase tracking-tighter text-xs font-bold border-2 transition-all ${
                intensity === level 
                  ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-950 dark:border-zinc-100' 
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-300 border-transparent hover:border-zinc-950 dark:hover:border-zinc-300'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <button 
            className="flex-1 md:flex-none bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 px-6 py-2 uppercase font-black tracking-tighter text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 active:translate-y-1 active:translate-x-1 active:shadow-none shadow-[2px_2px_0px_0px_rgba(9,9,11,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] border-2 border-zinc-950 dark:border-zinc-500 transition-transform flex items-center justify-center whitespace-nowrap"
            onClick={onCheck}
            disabled={status === 'humanizing' || status === 'checking' || !originalText}
          >
            {status === 'checking' ? 'Scanning...' : 'Check AI'}
          </button>
          <button 
            className="flex-1 md:flex-none bg-[#FDE047] text-zinc-950 px-8 py-2 uppercase font-black tracking-tighter text-sm hover:bg-[#EACD34] active:translate-y-1 active:translate-x-1 active:shadow-none shadow-[2px_2px_0px_0px_rgba(9,9,11,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] border-2 border-zinc-950 transition-transform flex items-center justify-center gap-2 whitespace-nowrap"
            onClick={onHumanize}
            disabled={status === 'humanizing' || status === 'checking' || !originalText}
          >
            {status === 'humanizing' ? 'Processing...' : 'Humanize Text'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DUAL PANE EDITOR */}
      <div className="flex-1 flex flex-col md:flex-row border-2 border-zinc-950 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(9,9,11,1)] dark:shadow-[4px_4px_0px_0px_rgba(63,63,70,1)] relative overflow-hidden transition-colors" onClick={() => setClickedIndex(null)}>
        
        {/* CENTER HUMANITY GAUGE */}
        <div className="hidden md:flex absolute top-1/2 left-[calc(50%-1px)] -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-white dark:bg-zinc-900 border-4 border-zinc-950 dark:border-zinc-700 rounded-full z-10 shadow-[0px_4px_15px_rgba(0,0,0,0.15)] dark:shadow-[0px_4px_15px_rgba(0,0,0,0.5)] flex-col items-center justify-center transition-transform hover:scale-105">
          <svg className="absolute inset-0 w-full h-full -rotate-90 rounded-full" viewBox="0 0 112 112">
             <circle cx="56" cy="56" r="48" fill="none" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="8" />
             <circle 
               cx="56" cy="56" r="48" fill="none" stroke="currentColor" className="text-zinc-950 dark:text-zinc-100" strokeWidth="8" strokeLinecap="round"
               strokeDasharray="301" strokeDashoffset={301 - (301 * displayScore) / 100}
               style={{ transition: 'stroke-dashoffset 0.3s ease' }}
             />
          </svg>
          <span className="font-mono text-[10px] uppercase font-bold text-zinc-500 z-10 mt-1 tracking-widest">Score</span>
          <span className="font-black text-3xl font-mono text-zinc-950 dark:text-zinc-50 z-10 leading-none">{displayScore}</span>
        </div>

        {/* LEFT PANE */}
        <div className="flex-1 border-b-2 md:border-b-0 md:border-r-2 border-zinc-950 dark:border-zinc-700 p-6 md:p-8 overflow-auto bg-white dark:bg-zinc-900 flex flex-col relative group transition-colors">
          <div className="flex justify-between items-center mb-6 border-b-2 border-zinc-100 dark:border-zinc-800 pb-2">
            <h2 className="font-mono uppercase text-xs font-bold text-zinc-400">Input Container</h2>
            <span className="font-mono text-[10px] font-bold text-zinc-400">{originalText.length} Chars</span>
          </div>
          
          {status === 'idle' || status === 'completed' && !humanizedText ? (
            <textarea 
              className="flex-1 w-full resize-none focus:outline-none font-serif text-lg leading-relaxed bg-transparent text-zinc-950 dark:text-zinc-200 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 selection:bg-[#FDE047] selection:text-zinc-950"
              placeholder="Paste your AI-generated text here, then select your mode..."
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
            />
          ) : (
            <div className="font-serif text-lg leading-relaxed text-zinc-950 dark:text-zinc-200">
              {originalSentences.map((sentence, i) => (
                <span 
                  key={i} 
                  className={`inline transition-colors duration-150 ${hoveredIndex === i ? 'bg-[#FDE047] dark:bg-[#EACD34] text-zinc-950 dark:text-zinc-900' : ''}`}
                >
                  {sentence}{' '}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT PANE */}
        <div className="flex-1 p-6 md:p-8 overflow-auto relative bg-zinc-100 dark:bg-zinc-950 flex flex-col transition-colors">
          <div className="flex justify-between items-center mb-6 border-b-2 border-zinc-950 dark:border-zinc-700 pb-2">
            <h2 className="font-mono uppercase text-xs font-black text-zinc-950 dark:text-zinc-100">Humanized Output</h2>
            <span className="font-mono text-[10px] font-bold text-zinc-500 dark:text-zinc-400">{humanizedText ? humanizedText.length : 0} Chars</span>
          </div>
          
          <div className="font-serif text-lg leading-relaxed text-zinc-950 dark:text-zinc-200 pb-32">
            {status === 'humanizing' || status === 'extracting' ? (
              <div className="space-y-4 opacity-50 mt-2 animate-pulse">
                <div className="h-5 bg-zinc-300 dark:bg-zinc-800 w-full rounded-none" />
                <div className="h-5 bg-zinc-300 dark:bg-zinc-800 w-11/12 rounded-none" />
                <div className="h-5 bg-zinc-300 dark:bg-zinc-800 w-4/5 rounded-none" />
                <div className="h-5 bg-zinc-300 dark:bg-zinc-800 w-full rounded-none" />
                <div className="h-5 bg-zinc-300 dark:bg-zinc-800 w-3/4 rounded-none" />
              </div>
            ) : humanizedText ? (
              humanizedSentences.map((sentence, i) => (
                <span 
                  key={i} 
                  onClick={(e) => handleSentenceClick(e, i, sentence)}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`inline cursor-pointer transition-all duration-150 border-b-2 ${
                    clickedIndex === i 
                      ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-950 dark:border-zinc-100' 
                      : hoveredIndex === i 
                        ? 'bg-[#FDE047] dark:bg-[#EACD34] border-zinc-950 dark:border-zinc-700 dark:text-zinc-900 text-zinc-950' 
                        : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {sentence}{' '}
                </span>
              ))
            ) : (
              <div className="text-zinc-400 dark:text-zinc-600 italic text-sm">
                Output will appear here...
              </div>
            )}
          </div>

          {/* SENTENCE VARIATIONS POPUP */}
          {clickedIndex !== null && humanizedSentences[clickedIndex] && (
            <div 
              className="absolute bottom-6 left-6 right-6 border-2 border-zinc-950 dark:border-zinc-500 bg-white dark:bg-zinc-900 p-4 shadow-[4px_4px_0px_0px_rgba(9,9,11,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] z-30 animate-in slide-in-from-bottom-5 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4 border-b-2 border-zinc-100 dark:border-zinc-800 pb-2">
                 <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-zinc-950 dark:text-zinc-100">Alternative Fragments</span>
                 <span className="font-mono text-[10px] text-zinc-500">Click to replace</span>
                 <button onClick={() => setClickedIndex(null)} className="font-mono text-[10px] flex items-center gap-1 uppercase font-bold text-zinc-400 hover:text-red-500 transition-colors">Close x</button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {variations.map((v, idx) => (
                  <div 
                    key={idx} 
                    onClick={(e) => handleVariationReplace(e, v)}
                    className="p-3 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-serif cursor-pointer hover:bg-[#FDE047] dark:hover:bg-[#EACD34] hover:text-zinc-950 dark:hover:text-zinc-950 hover:border-zinc-950 dark:hover:border-zinc-950 hover:shadow-[2px_2px_0px_0px_rgba(9,9,11,1)] transition-all"
                  >
                    {v}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
