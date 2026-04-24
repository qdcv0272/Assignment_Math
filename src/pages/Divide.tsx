import React from "react";
import DragEditor from "../components/DragEditor";
import type { dragItem } from "../types/dragType";

const grammarTokens: dragItem[] = [
  { id: "div-1", text: "변수," },
  { id: "div-2", text: "총개" },
  { id: "div-3", text: "=" },
  { id: "div-4", text: "12" },
  { id: "div-5", text: "변수," },
  { id: "div-6", text: "그룹" },
  { id: "div-7", text: "=" },
  { id: "div-8", text: "3" },
  { id: "div-9", text: "총개" },
  { id: "div-10", text: "/" },
  { id: "div-11", text: "그룹" },
  { id: "div-12", text: "보여주기" },
];

export default function DividePage() {
  return (
    <DragEditor
      title="사과 나누기 문제"
      subtitle="달빛약속 조각을 드래그 하여 나눗셈 코드를 조립하세요."
      grammarTokens={grammarTokens}
    />
  );
}
