import React from "react";
import type { dragItem } from "../../types/dragType";
import GrammarChip from "./GrammarChip";

type Props = {
  availableDrags: dragItem[];
  setChipRef: (id: string) => (el: HTMLDivElement | null) => void;
  onInsertLineBreak: () => void;
};

export default function GrammarPanel({ availableDrags, setChipRef, onInsertLineBreak }: Props) {
  return (
    <aside className="grammar-panel page-grammar">
      <div className="grammar-header">
        <div>
          <p className="grammar-label">달빛약속 문법</p>
          <p className="grammar-info">문법 조각을 드래그하여 코드로 조립하세요.</p>
        </div>
      </div>

      <div className="grammar-list grammar-chips">
        {availableDrags.map(d => (
          <GrammarChip key={d.id} item={d} setRef={setChipRef(d.id)} />
        ))}
      </div>

      <div className="grammar-footer">
        <button className="secondary-button grammar-break-button" onClick={onInsertLineBreak}>
          줄바꿈
        </button>
      </div>
    </aside>
  );
}
