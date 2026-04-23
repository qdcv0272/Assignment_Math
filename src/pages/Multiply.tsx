import React from "react";
import TokenEditor, { GrammarToken } from "../components/TokenEditor";

const grammarTokens: GrammarToken[] = [
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
  return <TokenEditor title="곱셈 문제" problem="6개씩 4묶음이 있을 때 전체 개수를 달빛약속으로 계산하세요." subtitle="달빛약속 토큰을 드래그하여 곱셈 코드를 완성하세요." grammarTokens={grammarTokens} />;
}
