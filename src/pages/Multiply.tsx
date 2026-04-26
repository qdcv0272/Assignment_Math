import React, { useEffect, useState } from "react";
import DragEditor from "../components/DragEditor";
import InstructionModal from "../components/Modal";
import type { dragItem } from "../types/dragType";

const grammarTokens: dragItem[] = [
  { id: "mul-1", text: "한줄" },
  { id: "mul-2", text: "=" },
  { id: "mul-3", text: "8" },
  { id: "mul-4", text: "줄" },
  { id: "mul-5", text: "=" },
  { id: "mul-6", text: "3" },
  { id: "mul-7", text: "한줄" },
  { id: "mul-8", text: "*" },
  { id: "mul-9", text: "줄" },
  { id: "mul-10", text: "보여주기" },
  { id: "mul-11", text: "정답" },
  { id: "mul-12", text: "정답" },
  { id: "mul-13", text: "=" },
];

export default function MultiplyPage() {
  const [showInstruction, setShowInstruction] = useState(false);

  useEffect(() => {
    try {
      const shown = localStorage.getItem("multiplyInstructionShown");
      if (!shown) setShowInstruction(true);
    } catch (e) {
      setShowInstruction(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("multiplyInstructionShown", "1");
    setShowInstruction(false);
  };

  return (
    <>
      <InstructionModal open={showInstruction} onClose={handleClose} />

      <DragEditor
        title="의자가 한 줄에 8개씩 놓여 있어요. 이런 줄이 3줄 있어요. 의자는 모두 몇 개일까요?"
        subtitle="달빛약속 토큰을 드래그해서 곱셈 코드를 완성하세요."
        grammarTokens={grammarTokens}
        expectedAnswer={{ op: "*", left: "한줄", right: "줄", commutative: true, answer: 24 }}
      />
    </>
  );
}
