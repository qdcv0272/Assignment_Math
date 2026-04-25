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
    // 줄바꿈은 버튼으로만 추가되므로 드래그로 추가되지 않도록 무시합니다.
    if (d.text === "줄바꿈") return;

    set((state: DragEditorState) => ({
      codeDrags: [...state.codeDrags, d],
      availableDrags: state.availableDrags.filter((t: dragItem) => t.id !== d.id),
    }));
  },

  // 코드 영역에서 특정 인덱스의 조각을 제거하고 사용 가능한 조각 목록 끝으로 되돌립니다.
  removeDragAtIndex: (index: number) => {
    set((state: DragEditorState) => {
      if (index < 0 || index >= state.codeDrags.length) return {} as any;
      const item = state.codeDrags[index];
      const newCodeDrags = state.codeDrags.filter((_, i) => i !== index);

      // 줄바꿈 토큰은 버튼 전용이므로 제거 시 드래그 가능한 목록으로 되돌리지 않습니다.
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

  // 변경: 에러 발생 시 모달을 자동으로 열지 않음. 인라인으로 에러를 표시합니다.
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
