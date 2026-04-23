import React from "react";
import TokenEditor, { GrammarToken } from "../components/TokenEditor";

const grammarTokens: GrammarToken[] = [
  { id: "sub-1", text: "변수," },
  { id: "sub-2", text: "사과" },
  { id: "sub-3", text: "=" },
  { id: "sub-4", text: "10" },
  { id: "sub-5", text: "변수," },
  { id: "sub-6", text: "바구니" },
  { id: "sub-7", text: "=" },
  { id: "sub-8", text: "4" },
  { id: "sub-9", text: "사과" },
  { id: "sub-10", text: "-" },
  { id: "sub-11", text: "바구니" },
  { id: "sub-12", text: "보여주기" },
];

export default function SubtractPage() {
  return (
    <TokenEditor
      title="사과 나누기 문제"
      problem="사과 10개에서 바구니에 담긴 4개를 뺀 결과를 달빛약속으로 계산하세요."
      subtitle="달빛약속 조각을 드래그 하여 뺄셈 코드를 조립하세요."
      grammarTokens={grammarTokens}
    />
  );
}
