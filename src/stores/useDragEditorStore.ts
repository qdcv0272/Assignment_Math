import { create } from "zustand";
import type { dragItem } from "../types/dragType";

type DragEditorState = {
  codeDrags: dragItem[];
  availableDrags: dragItem[];
  running: boolean;
  activeIndex: number;
  output: string;
  error: string;
  errorModalOpen: boolean;
  setAvailableDrags: (drags: dragItem[]) => void;
  addDrag: (d: dragItem) => void;
  insertLineBreak: () => void;
  reset: (initialAvailableDrags?: dragItem[]) => void;
  setOutput: (s: string) => void;
  setError: (s: string) => void;
  setErrorModalOpen: (b: boolean) => void;
  setRunning: (b: boolean) => void;
  setActiveIndex: (i: number) => void;
};

export const useDragEditorStore = create<DragEditorState>((set: any) => ({
  // 코드 영역에 배치된 드래그 조각들
  codeDrags: [],

  // 문법 패널에 표시되는 사용 가능한 드래그 조각들
  availableDrags: [],

  running: false,
  activeIndex: -1,
  output: "",
  error: "",
  errorModalOpen: false,

  setAvailableDrags: (drags: dragItem[]) => set({ availableDrags: drags }),

  // 코드 영역에 드래그 조각 추가 및 available에서 제거
  addDrag: (d: dragItem) =>
    set((state: DragEditorState) => ({
      codeDrags: [...state.codeDrags, d],
      availableDrags: state.availableDrags.filter((t: dragItem) => t.id !== d.id),
    })),

  insertLineBreak: () =>
    set((state: DragEditorState) => ({
      codeDrags: [...state.codeDrags, { id: `br-${Date.now()}`, text: "줄바꿈" }],
    })),

  reset: (initialAvailableDrags?: dragItem[]) =>
    set({
      codeDrags: [],
      availableDrags: initialAvailableDrags || [],
      output: "",
      error: "",
      running: false,
      activeIndex: -1,
    }),

  setOutput: (s: string) => set({ output: s }),

  setError: (s: string) => set({ error: s, errorModalOpen: true }),
  setErrorModalOpen: (b: boolean) => set({ errorModalOpen: b }),
  setRunning: (b: boolean) => set({ running: b }),
  setActiveIndex: (i: number) => set({ activeIndex: i }),
}));
