import React, { useState, useEffect, useMemo } from "react";
import { YaksokSession } from "@dalbit-yaksok/core";
import { Link } from "react-router-dom";

export type GrammarToken = {
  id: string;
  text: string;
};

type TokenEditorProps = {
  title: string;
  problem: string;
  subtitle: string;
  grammarTokens: GrammarToken[];
};

export default function TokenEditor({ title, problem, subtitle, grammarTokens }: TokenEditorProps) {
  const [menuOpen, setMenuOpen] = useState(true);
  const [codeTokens, setCodeTokens] = useState<GrammarToken[]>([]);
  const [availableTokens, setAvailableTokens] = useState<GrammarToken[]>(() => grammarTokens.filter((t) => t.text !== "변수,"));
  const [running, setRunning] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setAvailableTokens(grammarTokens.filter((t) => t.text !== "변수,"));
  }, [grammarTokens]);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, token: GrammarToken) => {
    event.dataTransfer.setData("application/json", JSON.stringify(token));
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData("application/json");
    if (!raw) return;
    const token: GrammarToken = JSON.parse(raw);
    setCodeTokens((prev) => [...prev, token]);
    // 드롭한 토큰은 사용되었으므로 가용 토큰 목록에서 제거
    setAvailableTokens((prev) => prev.filter((t) => t.id !== token.id));
  };

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const handleInsertLineBreak = () => {
    const brToken: GrammarToken = { id: `br-${Date.now()}`, text: "줄바꿈" };
    setCodeTokens((prev) => [...prev, brToken]);
  };

  const previewSource = useMemo(() => {
    if (codeTokens.length === 0) return "";
    // 토큰을 순회하며 줄바꿈 토큰은 실제 '\n'로 대체해 소스를 생성
    const parts = codeTokens.map((t) => (t.text === "줄바꿈" ? "\n" : t.text));
    let s = parts.join(" ");
    // 줄바꿈 주변의 불필요한 공백 제거
    s = s.replace(/\s*\n\s*/g, "\n");
    // 콤마 등 주요 연산자 공백 정규화
    s = s.replace(/\s*,\s*/g, ", ");
    s = s.replace(/\s*=\s*/g, " = ");
    s = s.replace(/\s*\+\s*/g, " + ");
    s = s.replace(/\s*-\s*/g, " - ");
    s = s.replace(/\s*\*\s*/g, " * ");
    s = s.replace(/\s*\/\s*/g, " / ");
    // '보여주기'는 문장 종료로 개행 처리 — 앞에 공백을 보장하여 붙어붙는 문제 예방
    s = s.replace(/\s*보여주기\s*/g, " 보여주기\n");
    // 다중 공백 제거 (단, 개행은 유지)
    s = s
      .split("\n")
      .map((line) => line.replace(/\s+/g, " ").trim())
      .join("\n");
    return s;
  }, [codeTokens]);

  const handleStart = async () => {
    setError("");
    setOutput("");
    if (codeTokens.length === 0) {
      setError("코드 토큰이 없습니다. 토큰을 드래그하여 코드를 완성하세요.");
      return;
    }

    setRunning(true);
    // 간단한 단계별 하이라이트 애니메이션
    for (let i = 0; i < codeTokens.length; i++) {
      setActiveIndex(i);
      await sleep(300);
    }
    setActiveIndex(-1);

    const source = previewSource;

    try {
      const logs: string[] = [];
      const origLog = console.log;
      // 콘솔 로그 캡처
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (console as any).log = (...args: any[]) => {
        try {
          logs.push(args.map((a) => String(a)).join(" "));
        } catch {}
        origLog(...args);
      };

      const session = new YaksokSession();
      session.addModule("main", source);
      // 실행
      // @ts-ignore
      await session.runModule("main");

      setOutput(logs.join("\n") || "실행 완료");
      // 복원
      (console as any).log = origLog;
    } catch (e: any) {
      const msg = e?.message || String(e);
      setError(msg);
      // 디버깅: 실패 시 생성된 소스를 출력
      setOutput((prev) => (prev ? prev + "\n\n" : "") + "[생성된 소스]\n" + source);
    } finally {
      setRunning(false);
      setActiveIndex(-1);
    }
  };

  const handleReset = () => {
    setCodeTokens([]);
    setAvailableTokens(grammarTokens);
  };

  return (
    <div className="page-shell">
      <div className="page-frame">
        <header className="top-banner">
          <div>
            <span className="top-label">문제</span>
            <h2>{title}</h2>
            <p>{problem}</p>
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
            <div className="code-card" onDragOver={handleDragOver} onDrop={handleDrop}>
              <div className="code-drop-description">
                <p>달빛약속 토큰을 끌어서 여기에 놓으세요.</p>
              </div>
              <div className="code-area">
                {codeTokens.length === 0 ? (
                  <div className="code-placeholder">여기에 토큰을 조립하면 코드가 완성됩니다.</div>
                ) : (
                  <div className="code-token-row">
                    {codeTokens.map((token, index) => (
                      <span key={`${token.id}-${index}`} className={`code-token ${activeIndex === index ? "active" : ""}`}>
                        {token.text}
                      </span>
                    ))}
                  </div>
                )}
                {/* 실행 전 소스 미리보기 */}
                {previewSource && (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ margin: "6px 0", color: "#9dbbd8" }}>생성된 소스(미리보기)</p>
                    <div className="code-block" style={{ background: "rgba(255,255,255,0.03)", padding: 12 }}>
                      {previewSource}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

          <div className="side-divider">
            <button className="menu-toggle-button" onClick={() => setMenuOpen((prev) => !prev)}>
              {menuOpen ? "닫기" : "열기"}
            </button>
          </div>

          <aside className={`grammar-panel page-grammar ${menuOpen ? "open" : "closed"}`}>
            <div className="grammar-header">
              <div>
                <p className="grammar-label">달빛약속 문법</p>
                <p className="grammar-info">문법 토큰을 드래그하여 코드로 조립하세요.</p>
              </div>
            </div>
            <div className="grammar-list grammar-chips">
              {availableTokens.map((token) => (
                <div key={token.id} className="grammar-chip grammar-word" draggable onDragStart={(event) => handleDragStart(event, token)}>
                  {token.text}
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="bottom-actions">
          <button className="primary-button" onClick={handleStart} disabled={running}>
            {running ? "실행 중..." : "시작"}
          </button>
          <button className="secondary-button" onClick={handleInsertLineBreak}>
            줄바꿈
          </button>
          <button className="secondary-button" onClick={handleReset}>
            초기화
          </button>
          <Link to="/" className="text-link">
            홈으로 돌아가기
          </Link>
        </div>
        <div style={{ marginTop: 12 }}>
          {output && (
            <div className="code-output" style={{ whiteSpace: "pre-wrap", color: "#d1fae5", padding: 12 }}>
              {output}
            </div>
          )}
          {error && (
            <div className="code-error" style={{ whiteSpace: "pre-wrap", color: "#fecaca", padding: 12 }}>
              오류: {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
