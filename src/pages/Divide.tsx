import React, { useEffect, useState } from "react";
import DragEditor from "../components/DragEditor";
import InstructionModal from "../components/Modal";
import type { dragItem } from "../types/dragType";

const grammarTokens: dragItem[] = [
  { id: "div-1", text: "연필" },
  { id: "div-2", text: "=" },
  { id: "div-3", text: "20" },
  { id: "div-4", text: "사람" },
  { id: "div-5", text: "=" },
  { id: "div-6", text: "4" },
  { id: "div-7", text: "연필" },
  { id: "div-8", text: "/" },
  { id: "div-9", text: "사람" },
  { id: "div-10", text: "보여주기" },
  { id: "div-11", text: "정답" },
  { id: "div-12", text: "정답" },
  { id: "div-13", text: "=" },
];

export default function DividePage() {
  const [showInstruction, setShowInstruction] = useState(false);

  useEffect(() => {
    try {
      const shown = localStorage.getItem("divideInstructionShown");
      if (!shown) setShowInstruction(true);
    } catch (e) {
      setShowInstruction(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("divideInstructionShown", "1");
    setShowInstruction(false);
  };

  return (
    <>
      <InstructionModal open={showInstruction} onClose={handleClose} />

      <DragEditor
        title="연필 20자루를 4명에게 똑같이 나눠주려고 해요. 한 사람당 몇 자루씩 받을까요? 정답을 보여주세요!"
        subtitle="달빛약속 토큰을 드래그해서 나눗셈 코드를 완성하세요."
        grammarTokens={grammarTokens}
        expectedAnswer={{ op: "/", left: "연필", right: "사람", commutative: false, answer: 5 }}
      />
    </>
  );
}
