import { create } from 'zustand';

interface DocumentState {
  file: File | null;
  originalText: string;
  humanizedText: string;
  status: 'idle' | 'extracting' | 'humanizing' | 'reformatting' | 'completed' | 'error';
  mode: 'simulation' | 'ai-premium' | null;
  progress: number;
  setFile: (file: File | null) => void;
  setOriginalText: (text: string) => void;
  setHumanizedText: (text: string) => void;
  setStatus: (status: DocumentState['status']) => void;
  setMode: (mode: DocumentState['mode']) => void;
  setProgress: (progress: number) => void;
  reset: () => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  file: null,
  originalText: '',
  humanizedText: '',
  status: 'idle',
  mode: null,
  progress: 0,
  setFile: (file) => set({ file }),
  setOriginalText: (originalText) => set({ originalText }),
  setHumanizedText: (humanizedText) => set({ humanizedText }),
  setStatus: (status) => set({ status }),
  setMode: (mode) => set({ mode }),
  setProgress: (progress) => set({ progress }),
  reset: () => set({
    file: null,
    originalText: '',
    humanizedText: '',
    status: 'idle',
    mode: null,
    progress: 0,
  }),
}));

