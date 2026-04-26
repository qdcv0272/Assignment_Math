import { create } from "zustand";
import type { dragItem } from "../types/dragType";

type DragEditorState = {
  codeDrags: dragItem[];
  availableDrags: dragItem[];
  running: boolean;
  activeIndex: number;
  output: string;
  error: string;
  setAvailableDrags: (drags: dragItem[]) => void;
  addDrag: (d: dragItem) => void;
  removeDragAtIndex: (index: number) => void;
  insertLineBreak: () => void;
  reset: (initialAvailableDrags?: dragItem[]) => void;
  setOutput: (s: string) => void;
  setError: (s: string) => void;
  setRunning: (b: boolean) => void;
  setActiveIndex: (i: number) => void;
};

export const useDragEditorStore = create<DragEditorState>((set: any) => ({
  codeDrags: [],
  availableDrags: [],
  running: false,
  activeIndex: -1,
  output: "",
  error: "",

  setAvailableDrags: (drags: dragItem[]) => set({ availableDrags: drags }),
  addDrag: (d: dragItem) => {
    if (d.text === "줄바꿈") return;

    set((state: DragEditorState) => ({
      codeDrags: [...state.codeDrags, d],
      availableDrags: state.availableDrags.filter((t: dragItem) => t.id !== d.id),
    }));
  },

  removeDragAtIndex: (index: number) => {
    set((state: DragEditorState) => {
      if (index < 0 || index >= state.codeDrags.length) return {} as any;
      const item = state.codeDrags[index];
      const newCodeDrags = state.codeDrags.filter((_, i) => i !== index);

      if (item.text === "줄바꿈") {
        return {
          codeDrags: newCodeDrags,
          availableDrags: state.availableDrags,
        } as any;
      }

      return {
        codeDrags: newCodeDrags,
        availableDrags: [...state.availableDrags, item],
      } as any;
    });
  },

  insertLineBreak: () => {
    set((state: DragEditorState) => ({
      codeDrags: [...state.codeDrags, { id: `br-${Date.now()}`, text: "줄바꿈" }],
    }));
  },

  reset: (initialAvailableDrags?: dragItem[]) => {
    set({
      codeDrags: [],
      availableDrags: initialAvailableDrags || [],
      output: "",
      error: "",
      running: false,
      activeIndex: -1,
    });
  },

  setOutput: (s: string) => {
    set({ output: s });
  },

  setError: (s: string) => {
    set({ error: s });
  },
  setRunning: (b: boolean) => {
    set({ running: b });
  },
  setActiveIndex: (i: number) => {
    set({ activeIndex: i });
  },
}));
