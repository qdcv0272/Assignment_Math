import React from "react";
import DragEditor from "../components/DragEditor";
import type { dragItem } from "../types/dragType";

const grammarTokens: dragItem[] = [
  { id: "mul-1", text: "변수," },
  { id: "mul-2", text: "a" },
  { id: "mul-3", text: "=" },
  { id: "mul-4", text: "6" },
  { id: "mul-5", text: "변수," },
  { id: "mul-6", text: "b" },
  { id: "mul-7", text: "=" },
  { id: "mul-8", text: "4" },
  { id: "mul-9", text: "a" },
  { id: "mul-10", text: "*" },
  { id: "mul-11", text: "b" },
  { id: "mul-12", text: "보여주기" },
];

export default function MultiplyPage() {
  return (
    <DragEditor
      title="곱셈 문제"
      subtitle="달빛약속 조각을 드래그하여 곱셈 코드를 완성하세요."
      grammarTokens={grammarTokens}
    />
  );
}
