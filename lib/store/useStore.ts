import { create } from 'zustand';

interface DocumentState {
  file: File | null;
  originalText: string;
  humanizedText: string;
  status: 'idle' | 'extracting' | 'humanizing' | 'reformatting' | 'checking' | 'completed' | 'error';
  mode: 'simulation' | 'ai-premium' | null;
  intensity: 'Standard' | 'Professional' | 'Academic' | 'Creative';
  progress: number;
  logs: string[];
  detectorScore: number;
  perplexityScore: number;
  burstinessScore: number;
  hoveredIndex: number | null;
  clickedIndex: number | null;
  variations: string[];
  setFile: (file: File | null) => void;
  setOriginalText: (text: string) => void;
  setHumanizedText: (text: string) => void;
  setStatus: (status: DocumentState['status']) => void;
  setMode: (mode: DocumentState['mode']) => void;
  setIntensity: (intensity: DocumentState['intensity']) => void;
  setProgress: (progress: number) => void;
  setLogs: (logs: string[] | ((prev: string[]) => string[])) => void;
  addLog: (log: string) => void;
  setScores: (detector: number, perplexity: number, burstiness: number) => void;
  setHoveredIndex: (index: number | null) => void;
  setClickedIndex: (index: number | null, variations?: string[]) => void;
  reset: () => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  file: null,
  originalText: '',
  humanizedText: '',
  status: 'idle',
  mode: null,
  intensity: 'Standard',
  progress: 0,
  logs: [],
  detectorScore: 0,
  perplexityScore: 0,
  burstinessScore: 0,
  hoveredIndex: null,
  clickedIndex: null,
  variations: [],
  setFile: (file) => set({ file }),
  setOriginalText: (originalText) => set({ originalText }),
  setHumanizedText: (humanizedText) => set({ humanizedText }),
  setStatus: (status) => set({ status }),
  setMode: (mode) => set({ mode }),
  setIntensity: (intensity) => set({ intensity }),
  setProgress: (progress) => set({ progress }),
  setLogs: (logs) => set((state) => ({ logs: typeof logs === 'function' ? logs(state.logs) : logs })),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  setScores: (detector, perplexity, burstiness) => set({ detectorScore: detector, perplexityScore: perplexity, burstinessScore: burstiness }),
  setHoveredIndex: (index) => set({ hoveredIndex: index }),
  setClickedIndex: (index, variations = []) => set({ clickedIndex: index, variations }),
  reset: () => set({
    file: null,
    originalText: '',
    humanizedText: '',
    status: 'idle',
    mode: null,
    intensity: 'Standard',
    progress: 0,
    logs: [],
    detectorScore: 0,
    perplexityScore: 0,
    burstinessScore: 0,
    hoveredIndex: null,
    clickedIndex: null,
    variations: [],
  }),
}));
