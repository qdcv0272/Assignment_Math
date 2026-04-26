import React, { useEffect, useState } from "react";
import DragEditor from "../components/DragEditor";
import InstructionModal from "../components/InstructionModal";
import type { dragItem } from "../types/dragType";

const grammarTokens: dragItem[] = [
  { id: "sub-1", text: "책" },
  { id: "sub-2", text: "=" },
  { id: "sub-3", text: "18" },
  { id: "sub-4", text: "빌려준" },
  { id: "sub-5", text: "=" },
  { id: "sub-6", text: "9" },
  { id: "sub-7", text: "책" },
  { id: "sub-8", text: "-" },
  { id: "sub-9", text: "빌려준" },
  { id: "sub-10", text: "보여주기" },
  { id: "sub-11", text: "정답" },
  { id: "sub-12", text: "정답" },
  { id: "sub-13", text: "=" },
];

export default function SubtractPage() {
  const [showInstruction, setShowInstruction] = useState(false);

  useEffect(() => {
    try {
      const shown = localStorage.getItem("subtractInstructionShown");
      if (!shown) setShowInstruction(true);
    } catch (e) {
      setShowInstruction(true);
    }
  }, []);

  const handleClose = () => {
    try {
      localStorage.setItem("subtractInstructionShown", "1");
    } catch (e) {
      /* ignore */
    }
    setShowInstruction(false);
  };

  return (
    <>
      <InstructionModal open={showInstruction} onClose={handleClose} />

      <DragEditor
        title="책이 18권 있었는데 9권을 친구에게 빌려줬어요. 남은 책은 몇 권일까요?"
        subtitle="달빛약속 토큰을 드래그해서 뺄셈 코드를 완성하세요."
        grammarTokens={grammarTokens}
        expectedAnswer={{ op: "-", left: "책", right: "빌려준", commutative: false }}
      />
    </>
  );
}
