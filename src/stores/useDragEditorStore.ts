import { create } from "zustand";
import type { dragItem } from "../types/dragType";

type DragEditorState = {
  codeDrags: dragItem[];
  drags: dragItem[];
  running: boolean;
  activeIndex: number;
  output: string;
  error: string;
  answerCheck: boolean;

  /** 드래그 아이템 설정 */
  setDrags: (drags: dragItem[]) => void;
  /** 드래그 아이템 추가 */
  addDrag: (d: dragItem) => void;
  /** 드래그 아이템 제거 */
  removeDragAtIndex: (index: number) => void;
  /** 줄바꿈 추가 */
  lineBreak: () => void;
  /** 상태 초기화 */
  reset: (initDrags?: dragItem[]) => void;
  /** 에러 메시지 설정 */
  setError: (s: string) => void;
  /** 실행 상태 설정 */
  setRunning: (b: boolean) => void;
  /** 활성화된 드래그 아이템 인덱스 설정 */
  setActiveIndex: (i: number) => void;
  /** 실행 결과 설정 */
  setOutput: (s: string) => void;
  /** 정답 판정 설정 */
  setAnswerCheck: (b: boolean) => void;
};

export const useDragEditorStore = create<DragEditorState>(set => ({
  codeDrags: [],
  drags: [],
  output: "",
  error: "",
  answerCheck: false,
  running: false,
  activeIndex: -1,

  setDrags: (drags: dragItem[]) => set({ drags: drags }),

  addDrag: (d: dragItem) => {
    if (d.text === "줄바꿈") return;

    set(state => ({
      codeDrags: [...state.codeDrags, d],
      drags: state.drags.filter((t: dragItem) => t.id !== d.id), // 목록 제거
    }));
  },

  removeDragAtIndex: (index: number) => {
    set(state => {
      if (index < 0 || index >= state.codeDrags.length) return;

      const item = state.codeDrags[index]; // 제거할 아이템
      const newCodeDrags = state.codeDrags.filter((_, i) => i !== index); // 코드 영역에서 제거

      if (item.text === "줄바꿈") {
        return {
          codeDrags: newCodeDrags,
          drags: state.drags, // 추가하지 않음
        } as any;
      }

      return {
        codeDrags: newCodeDrags,
        drags: [...state.drags, item], // 제거된 아이템을 다시 목록에 추가
      } as any;
    });
  },

  lineBreak: () => {
    set(state => ({
      codeDrags: [...state.codeDrags, { id: `br-${Date.now()}`, text: "줄바꿈" }],
    }));
  },

  reset: (initDrags?: dragItem[]) => {
    set({
      codeDrags: [],
      drags: initDrags || [],
      output: "",
      error: "",
      running: false,
      activeIndex: -1,
    });
  },

  setError: (s: string) => {
    set({ error: s });
  },
  setOutput: (s: string) => {
    set({ output: s });
  },
  setAnswerCheck: (b: boolean) => {
    set({ answerCheck: b });
  },
  setRunning: (b: boolean) => {
    set({ running: b });
  },
  setActiveIndex: (i: number) => {
    set({ activeIndex: i });
  },
}));
