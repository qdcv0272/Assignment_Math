import React from "react";
import type { dragItem } from "../../types/dragType";

type GrammarChipProps = {
  item: dragItem;
  setRef: (el: HTMLDivElement | null) => void;
};

export default function GrammarChip({ item, setRef }: GrammarChipProps) {
  return (
    <div className="grammar-chip grammar-word" ref={setRef}>
      {item.text}
    </div>
  );
}
