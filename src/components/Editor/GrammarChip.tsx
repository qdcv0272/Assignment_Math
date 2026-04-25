import React from "react";
import type { dragItem } from "../../types/dragType";

type Props = {
  item: dragItem;
  setRef: (el: HTMLDivElement | null) => void;
};

export default function GrammarChip({ item, setRef }: Props) {
  return (
    <div
      className="grammar-chip grammar-word"
      ref={setRef}
      style={{ cursor: "grab", touchAction: "none" }}
    >
      {item.text}
    </div>
  );
}
