import React, { useEffect, useState } from "react";
import DragEditor from "../components/DragEditor";
import InstructionModal from "../components/InstructionModal";
import type { dragItem } from "../types/dragType";

const grammarTokens: dragItem[] = [
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
  { id: "add-11", text: "정답" },
  { id: "add-12", text: "정답" },
  { id: "add-13", text: "=" },
];

export default function AddPage() {
  const [showInstruction, setShowInstruction] = useState(false);

  useEffect(() => {
    try {
      const shown = localStorage.getItem("addInstructionShown");
      if (!shown) setShowInstruction(true);
    } catch (e) {
      // localStorage 접근 불가 시에도 모달 표시
      setShowInstruction(true);
    }
  }, []);

  const handleClose = () => {
    try {
      localStorage.setItem("addInstructionShown", "1");
    } catch (e) {
      /* ignore */
    }
    setShowInstruction(false);
  };

  return (
    <>
      <InstructionModal open={showInstruction} onClose={handleClose}></InstructionModal>

      <DragEditor
        title="민지는 사과 18개가 있는데 친구에게 7개를 더 받았어요. 모두 몇 개일까요?"
        subtitle="달빛약속 토큰을 드래그해서 올바른 코드를 완성하세요."
        grammarTokens={grammarTokens}
        expectedAnswer={{ op: "+", left: "민지", right: "친구", commutative: true }}
      />
    </>
  );
}
