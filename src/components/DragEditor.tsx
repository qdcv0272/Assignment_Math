import React, { useEffect, useMemo } from "react";
import { YaksokSession } from "@dalbit-yaksok/core";
import { Link } from "react-router-dom";
import type { dragItem } from "../types/dragType";
import { useDragEditorStore } from "../stores/useDragEditorStore";
import NotFoundModal from "./NotFoundModal";
import "../css/DragEditor.css";

type DragEditorProps = {
  title: string;
  subtitle: string;
  grammarTokens: dragItem[];
};

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms)); // 실행 시 각 조각에 대한 하이라이트 효과를 위해 딜레이 함수 추가

// 드래그된 조각들을 기반으로 실행 가능한 소스 코드 문자열로 변환하는 함수
function formatPreview(tokens: dragItem[]): string {
  if (tokens.length === 0) return "";

  const lines: string[] = [];
  let cur = "";
  let indentLevel = 0;
  const getIndent = () => "  ".repeat(indentLevel);

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i].text;

    if (t === "줄바꿈") {
      if (cur.trim()) lines.push(cur.trim());
      cur = getIndent();
      continue;
    }

    if (t === "보여주기") {
      cur = (cur + (cur.trim() ? " " : "") + "보여주기").trim();
      lines.push(cur);
      cur = getIndent();
      continue;
    }

    cur += (cur.trim() ? " " : "") + t;
    // console.log("연결된 cur :", cur);
  }

  if (cur.trim()) lines.push(cur.trim());

  return lines.join("\n");
}

// 달빛약속 에러코드 제거 machineReadable.message 가 없음
function stripError(input: string): string {
  console.log("원본 메시지:", input);
  return String(input)
    .replace(/\u001b\[[0-9;]*m/g, "")
    .replace(/\x1b\[[0-9;]*m/g, "")
    .trim();
}

export default function DragEditor({ title, subtitle, grammarTokens }: DragEditorProps) {
  const {
    codeDrags,
    addDrag,
    availableDrags,
    insertLineBreak,
    reset: resetStore,
    running,
    activeIndex,
    output,
    error,
    errorModalOpen,
    setOutput: storeSetOutput,
    setError: storeSetError,
    setErrorModalOpen,
    setRunning: storeSetRunning,
    setActiveIndex: storeSetActiveIndex,
    setAvailableDrags,
  } = useDragEditorStore();

  useEffect(() => {
    console.log(error);
  }, [error]);

  useEffect(() => {
    setAvailableDrags(grammarTokens.filter(t => t.text !== "변수,"));
  }, [grammarTokens, setAvailableDrags]);

  // 드래그 시작 시, 드래그되는 조각의 데이터를 JSON 문자열로 설정
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, d: dragItem) => {
    event.dataTransfer.setData("application/json", JSON.stringify(d));
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData("application/json");
    if (!raw) return;
    let d: dragItem | null = null;
    try {
      d = JSON.parse(raw) as dragItem;
    } catch {
      return;
    }
    if (!d) return;
    addDrag(d);
  };

  const handleInsertLineBreak = () => {
    insertLineBreak();
  };

  const previewSource = useMemo(() => formatPreview(codeDrags), [codeDrags]);

  // 실행 버튼 클릭 시, 현재 코드 조각들을 기반으로 소스를 생성하여 YaksokSession으로 실행
  const handleStart = async () => {
    storeSetError("");
    storeSetOutput("");
    if (codeDrags.length === 0) {
      storeSetError("코드 드래그 조각이 없습니다. 조각을 드래그하여 코드를 완성하세요.");
      return;
    }

    storeSetRunning(true);

    for (let i = 0; i < codeDrags.length; i++) {
      storeSetActiveIndex(i);
      await sleep(300);
    }
    storeSetActiveIndex(-1);

    const source = previewSource;
    console.log("생성된 소스:\n", source);

    try {
      const session = new YaksokSession({
        stdout: (message: string) => {
          const m = stripError(String(message ?? ""));
          storeSetOutput(m);
        },
        stderr: (message: string, machineReadable?: any) => {
          const raw = String(message ?? "");
          const human = stripError(raw);
          // 출력 패널에는 ANSI 제거된 human 메시지를 보여줍니다.
          storeSetOutput(human);

          // machineReadable.message이 있으면 그대로 모달에 표시
          if (machineReadable && typeof machineReadable === "object" && machineReadable.message) {
            storeSetError(String(machineReadable.message));
            return;
          }

          // 없을 경우 마지막 비어있지 않은 줄을 모달에 표시
          const lines = human
            .split("\n")
            .map(l => l.replace("\r", "").trim())
            .filter(Boolean);
          const last = lines.length ? lines[lines.length - 1] : human || "오류가 발생했습니다";
          storeSetError(last);
        },
      });

      session.addModule("main", source);
      await session.runModule("main");

      const finalPrev = useDragEditorStore.getState().output;
      if (!finalPrev) storeSetOutput("실행 완료");
    } catch (e: any) {
      const msg = e?.message || String(e);
      storeSetError(msg);
      storeSetOutput("[생성된 소스]\n" + source);
    } finally {
      storeSetRunning(false);
      storeSetActiveIndex(-1);
    }
  };

  const handleReset = () => {
    resetStore(grammarTokens);
  };

  return (
    <div className="page-shell">
      <div className="page-frame">
        <header className="top-banner">
          <div>
            <span className="top-label">문제</span>
            <h2>{title}</h2>
          </div>
        </header>

        <div className="page-body">
          <main className="code-panel">
            <div className="code-header">
              <div>
                <p className="editor-label">코드 작성 영역</p>
                <p className="editor-subtitle">{subtitle}</p>
              </div>
            </div>
            <div className="code-area" onDragOver={handleDragOver} onDrop={handleDrop}>
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
              {/* 실행 전 소스 미리보기 */}
              {previewSource && (
                <div className="preview-section">
                  <p className="preview-label">생성된 소스(미리보기)</p>
                  <div className="code-block preview-code-block">{previewSource}</div>
                </div>
              )}
              {/* 실행 결과(미리보기 아래로 이동) */}
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
          </main>

          {/* 에러 모달 */}
          {error && (
            <NotFoundModal
              onClose={() => setErrorModalOpen(false)}
              detail={error}
              open={errorModalOpen}
            />
          )}
          <aside className="grammar-panel page-grammar">
            <div className="grammar-header">
              <div>
                <p className="grammar-label">달빛약속 문법</p>
                <p className="grammar-info">문법 조각을 드래그하여 코드로 조립하세요.</p>
              </div>
            </div>
            <div className="grammar-list grammar-chips">
              {availableDrags.map((d: dragItem) => (
                <div
                  key={d.id}
                  className="grammar-chip grammar-word"
                  draggable
                  onDragStart={event => handleDragStart(event, d)}
                >
                  {d.text}
                </div>
              ))}
            </div>

            <div className="grammar-footer">
              <button
                className="secondary-button grammar-break-button"
                onClick={handleInsertLineBreak}
              >
                줄바꿈
              </button>
            </div>
          </aside>
        </div>

        <div className="bottom-actions">
          <button className="primary-button" onClick={handleStart} disabled={running}>
            {running ? "실행 중..." : "시작"}
          </button>
          <button className="secondary-button" onClick={handleReset}>
            초기화
          </button>
          <Link to="/" className="text-link">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
