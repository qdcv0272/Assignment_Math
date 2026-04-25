import React, { useState } from "react";
import type { dragItem } from "../../types/dragType";
import InstructionModal from "../InstructionModal";
import { useDragEditorStore } from "../../stores/useDragEditorStore";

type Props = {
  subtitle: string;
  codeDrags: dragItem[];
  activeIndex: number;
  previewSource: string;
  output: string;
  error: string;
  codeAreaRef: React.RefObject<HTMLDivElement | null>;
  title?: string;
};

export default function CodeArea({
  subtitle,
  codeDrags,
  activeIndex,
  previewSource,
  output,
  error,

  codeAreaRef,
  title,
}: Props) {
  const [showInstruction, setShowInstruction] = useState(false);
  const removeAtIndex = useDragEditorStore(state => state.removeDragAtIndex);
  return (
    <main className="code-panel">
      <div className="code-area" ref={codeAreaRef}>
        <div className="code-header">
          <div>
            <p className="editor-label">코드 작성 영역</p>
            <p className="editor-subtitle">{subtitle}</p>
          </div>
          <button
            type="button"
            className="help-button"
            aria-label="문제 도움말"
            onClick={() => setShowInstruction(true)}
          >
            ?
          </button>
        </div>
        <div className="tokens-wrap">
          {codeDrags.length === 0 ? (
            <div className="code-placeholder">여기에 조각을 조립하면 코드가 완성됩니다.</div>
          ) : (
            <div className="code-drag-row">
              {codeDrags.map((d: dragItem, index: number) => {
                const token = (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={() => removeAtIndex(index)}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") removeAtIndex(index);
                    }}
                    key={`token-${d.id}-${index}`}
                    className={`code-drag ${activeIndex === index ? "active" : ""}`}
                  >
                    {d.text}
                  </span>
                );

                if (d.text === "줄바꿈") {
                  return [
                    token,
                    <span key={`br-${d.id}-${index}`} className="code-line-break d-none" />,
                  ];
                }

                return token;
              })}
            </div>
          )}
        </div>

        {previewSource && (
          <div className="preview-section">
            <p className="preview-label">생성된 소스(미리보기)</p>
            <div className="code-block preview-code-block">{previewSource}</div>
          </div>
        )}

        {(output || error) && (
          <div className="output-section">
            {output && !error && (
              <div className="code-output">
                <div className="status-body">{output}</div>
              </div>
            )}
            {error && (
              <div className="code-error">
                <div className="status-body">{error}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 모달 제거: 에러는 인라인으로 표시됩니다. */}

      <InstructionModal
        open={showInstruction}
        onClose={() => setShowInstruction(false)}
      ></InstructionModal>
    </main>
  );
}
