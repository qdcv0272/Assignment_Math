import React, { useEffect, useMemo } from 'react';
import { YaksokSession } from '@dalbit-yaksok/core';
import { Link } from 'react-router-dom';
import type { dragItem } from '../types/grammar';
import { useTokenEditorStore } from '../stores/useTokenEditorStore';
import NotFoundModal from './NotFoundModal';
import '../css/TokenEditor.css';

type TokenEditorProps = {
  title: string;
  problem: string;
  subtitle: string;
  grammarTokens: dragItem[];
};

// 유틸리티: 비동기 대기
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// 토큰 배열을 사람이 읽기 좋은 소스로 변환
function formatPreview(tokens: dragItem[]): string {
  if (tokens.length === 0) return '';

  const lines: string[] = [];
  let cur = '';
  let indentLevel = 0;
  const getIndent = () => '  '.repeat(indentLevel);

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i].text;

    if (t === '줄바꿈') {
      if (cur.trim()) lines.push(cur.trim());
      cur = getIndent();
      continue;
    }

    if (t === '보여주기') {
      cur = (cur + (cur.trim() ? ' ' : '') + '보여주기').trim();
      lines.push(cur);
      cur = getIndent();
      continue;
    }

    if (t === '약속,') {
      // 간단하게: 약속 선언 라인을 분리하고 이후 라인들 들여쓰기 적용
      if (cur.trim()) lines.push(cur.trim());
      lines.push('약속,');
      indentLevel++;
      cur = getIndent();
      continue;
    }

    if (t === '반환하기') {
      cur = (cur + (cur.trim() ? ' ' : '') + '반환하기').trim();
      lines.push(cur);
      if (indentLevel > 0) indentLevel--;
      cur = getIndent();
      continue;
    }

    // 기본: 이어쓰기 (연산자는 공백으로 둘러싸여 보이게 함)
    cur += (cur.trim() ? ' ' : '') + t;
  }

  if (cur.trim()) lines.push(cur.trim());
  // 간단한 공백 정리: 여러 공백을 하나로 줄임
  return lines.map((l) => l.replace(/\s+/g, ' ').trim()).join('\n');
}

export default function TokenEditor({ title, problem, subtitle, grammarTokens }: TokenEditorProps) {
  const {
    codeTokens,
    addToken,
    availableTokens,
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
    setAvailableTokens,
  } = useTokenEditorStore();

  useEffect(() => {
    if (error) console.log('[TokenEditor] store error set:', error);
  }, [error]);

  useEffect(() => {
    setAvailableTokens(grammarTokens.filter((t) => t.text !== '변수,'));
  }, [grammarTokens, setAvailableTokens]);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, token: dragItem) => {
    event.dataTransfer.setData('application/json', JSON.stringify(token));
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData('application/json');
    if (!raw) return;
    let token: dragItem | null = null;
    try {
      token = JSON.parse(raw) as dragItem;
    } catch {
      return;
    }
    if (!token) return;
    addToken(token);
  };

  const handleInsertLineBreak = () => {
    insertLineBreak();
  };

  const previewSource = useMemo(() => formatPreview(codeTokens), [codeTokens]);

  const handleStart = async () => {
    storeSetError('');
    storeSetOutput('');
    if (codeTokens.length === 0) {
      storeSetError('코드 토큰이 없습니다. 토큰을 드래그하여 코드를 완성하세요.');
      return;
    }

    storeSetRunning(true);
    // 간단한 단계별 하이라이트 애니메이션
    for (let i = 0; i < codeTokens.length; i++) {
      storeSetActiveIndex(i);
      await sleep(300);
    }
    storeSetActiveIndex(-1);

    const source = previewSource;

    try {
      const logs: string[] = [];

      const session = new YaksokSession({
        stdout: (message: string) => {
          const m = String(message ?? '');
          logs.push(m);
          const prev = useTokenEditorStore.getState().output;
          storeSetOutput(prev ? prev + '\n' + m : m);
          console.log(m);
        },
        // stderr receives (humanReadable: string, machineReadable: MachineReadableError)
        stderr: (humanReadable: string, machineReadable?: any) => {
          const human = String(humanReadable ?? '');
          const prev = useTokenEditorStore.getState().output;
          storeSetOutput(prev ? prev + '\n\n' + human : human);

          let parsedMessage = human || '오류가 발생했습니다';
          if (machineReadable && typeof machineReadable === 'object') {
            let machineMsg = machineReadable.message ? String(machineReadable.message) : '';
            const m = machineMsg.match(/"([^"]+)"/);
            if (m && m[1]) {
              const inner = m[1];
              const toks = inner.split(/\s+/).filter(Boolean);
              if (toks.length > 1) {
                machineMsg = machineMsg.replace(/"[^\"]+"/, toks.map((t) => `"${t}"`).join(' '));
              }
            }
            parsedMessage = machineMsg || human || '오류가 발생했습니다';
            try {
              logs.push(JSON.stringify(machineReadable, null, 2));
            } catch {}
          }

          storeSetError(parsedMessage);
          // Preserve original red error in DevTools
          console.error(humanReadable, machineReadable);
        },
      });

      session.addModule('main', source);
      // 실행
      // @ts-ignore
      await session.runModule('main');

      storeSetOutput(logs.join('\n') || '실행 완료');
    } catch (e: any) {
      const msg = e?.message || String(e);
      storeSetError(msg);
      // 디버깅: 실패 시 생성된 소스를 출력
      const prev = useTokenEditorStore.getState().output;
      storeSetOutput(prev ? prev + '\n\n' + '[생성된 소스]\n' + source : '[생성된 소스]\n' + source);
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
              {codeTokens.length === 0 ? (
                <div className="code-placeholder">여기에 토큰을 조립하면 코드가 완성됩니다.</div>
              ) : (
                <div className="code-token-row">
                  {codeTokens.map((token: dragItem, index: number) => (
                    <span key={`${token.id}-${index}`} className={`code-token ${activeIndex === index ? 'active' : ''}`}>
                      {token.text}
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
          {error && <NotFoundModal onClose={() => setErrorModalOpen(false)} detail={error} open={errorModalOpen} />}
          <aside className="grammar-panel page-grammar">
            <div className="grammar-header">
              <div>
                <p className="grammar-label">달빛약속 문법</p>
                <p className="grammar-info">문법 토큰을 드래그하여 코드로 조립하세요.</p>
              </div>
            </div>
            <div className="grammar-list grammar-chips">
              {availableTokens.map((token: dragItem) => (
                <div key={token.id} className="grammar-chip grammar-word" draggable onDragStart={(event) => handleDragStart(event, token)}>
                  {token.text}
                </div>
              ))}
            </div>

            <div className="grammar-footer">
              <button className="secondary-button grammar-break-button" onClick={handleInsertLineBreak}>
                줄바꿈
              </button>
            </div>
          </aside>
        </div>

        <div className="bottom-actions">
          <button className="primary-button" onClick={handleStart} disabled={running}>
            {running ? '실행 중...' : '시작'}
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
