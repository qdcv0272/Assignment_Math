import { create } from 'zustand';
import type { dragItem } from '../types/grammar';

type TokenEditorState = {
  codeTokens: dragItem[];
  availableTokens: dragItem[];
  running: boolean;
  activeIndex: number;
  output: string;
  error: string;
  errorModalOpen: boolean;
  setAvailableTokens: (tokens: dragItem[]) => void;
  addToken: (token: dragItem) => void;
  insertLineBreak: () => void;
  reset: (initialAvailable?: dragItem[]) => void;
  setOutput: (s: string) => void;
  setError: (s: string) => void;
  setErrorModalOpen: (b: boolean) => void;
  setRunning: (b: boolean) => void;
  setActiveIndex: (i: number) => void;
};

export const useTokenEditorStore = create<TokenEditorState>((set: any) => ({
  codeTokens: [],
  availableTokens: [],
  running: false,
  activeIndex: -1,
  output: '',
  error: '',
  errorModalOpen: false,
  setAvailableTokens: (tokens: dragItem[]) => set({ availableTokens: tokens }),
  addToken: (token: dragItem) =>
    set((state: TokenEditorState) => ({
      codeTokens: [...state.codeTokens, token],
      availableTokens: state.availableTokens.filter((t: dragItem) => t.id !== token.id),
    })),
  insertLineBreak: () =>
    set((state: TokenEditorState) => ({
      codeTokens: [...state.codeTokens, { id: `br-${Date.now()}`, text: '줄바꿈' }],
    })),
  reset: (initialAvailable?: dragItem[]) =>
    set({
      codeTokens: [],
      availableTokens: initialAvailable || [],
      output: '',
      error: '',
      running: false,
      activeIndex: -1,
    }),
  setOutput: (s: string) => set({ output: s }),
  // setError opens the error modal by default
  setError: (s: string) => set({ error: s, errorModalOpen: true }),
  setErrorModalOpen: (b: boolean) => set({ errorModalOpen: b }),
  setRunning: (b: boolean) => set({ running: b }),
  setActiveIndex: (i: number) => set({ activeIndex: i }),
}));
