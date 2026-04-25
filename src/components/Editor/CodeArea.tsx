import React from "react";
import type { dragItem } from "../../types/dragType";
import NotFoundModal from "../NotFoundModal";

type Props = {
  subtitle: string;
  codeDrags: dragItem[];
  activeIndex: number;
  previewSource: string;
  output: string;
  error: string;
  errorModalOpen: boolean;
  setErrorModalOpen: (b: boolean) => void;
  codeAreaRef: React.RefObject<HTMLDivElement | null>;
};

export default function CodeArea({
  subtitle,
  codeDrags,
  activeIndex,
  previewSource,
  output,
  error,
  errorModalOpen,
  setErrorModalOpen,
  codeAreaRef,
}: Props) {
  return (
    <main className="code-panel">
      <div className="code-header">
        <div>
          <p className="editor-label">코드 작성 영역</p>
          <p className="editor-subtitle">{subtitle}</p>
        </div>
      </div>
      <div className="code-area" ref={codeAreaRef}>
        {codeDrags.length === 0 ? (
          <div className="code-placeholder">여기에 조각을 조립하면 코드가 완성됩니다.</div>
        ) : (
          <div className="code-drag-row">
            {codeDrags.map((d: dragItem, index: number) => (
              <span
                key={`${d.id}-${index}`}
                className={`code-drag ${activeIndex === index ? "active" : ""}`}
              >
                {d.text}
              </span>
            ))}
          </div>
        )}

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
                <div className="status-badge status-success">완료했습니다.</div>
                <div className="status-body">{output}</div>
              </div>
            )}
            {error && (
              <div className="code-error">
                <div className="status-badge status-error">실패했습니다.</div>
                <div className="status-body">{error}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <NotFoundModal
          onClose={() => setErrorModalOpen(false)}
          detail={error}
          open={errorModalOpen}
        />
      )}
    </main>
  );
}
