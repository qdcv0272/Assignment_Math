import React from "react";
import TokenEditor, { GrammarToken } from "../components/TokenEditor";

const grammarTokens: GrammarToken[] = [
  { id: "add-1", text: "민지" },
  { id: "add-2", text: "=" },
  { id: "add-3", text: "18" },
  { id: "add-4", text: "친구" },
  { id: "add-5", text: "=" },
  { id: "add-6", text: "7" },
  { id: "add-7", text: "민지" },
  { id: "add-8", text: "+" },
  { id: "add-9", text: "친구" },
  { id: "add-10", text: "보여주기" },
];

export default function AddPage() {
  return (
    <TokenEditor
      title="민지의 사과 문제"
      problem="민지는 사과 18개를 가지고 있고, 친구에게서 7개를 받았습니다. 총 개수를 달빛약속으로 계산하세요."
      subtitle="달빛약속 토큰을 드래그해서 올바른 코드를 완성하세요."
      grammarTokens={grammarTokens}
    />
  );
}
