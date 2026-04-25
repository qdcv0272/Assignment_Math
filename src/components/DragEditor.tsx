import React, { useEffect, useMemo, useRef } from "react";
import { YaksokSession } from "@dalbit-yaksok/core";
import BottomActions from "./Editor/BottomActions";
import type { dragItem } from "../types/dragType";
import { useDragEditorStore } from "../stores/useDragEditorStore";
import useDraggableChips from "../hooks/useDraggableChips";
import GrammarPanel from "./Editor/GrammarPanel";
import CodeArea from "./Editor/CodeArea";
import TopBanner from "./Editor/TopBanner";
import "../css/DragEditor.css";

type DragEditorProps = {
  title: string;
  subtitle: string;
  grammarTokens: dragItem[];
};

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

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
  }

  if (cur.trim()) lines.push(cur.trim());

  return lines.join("\n");
}

function stripError(input: string): string {
  return String(input)
    .replace(/\u001b\[[0-9;]*m/g, "")
    .replace(/\x1b\[[0-9;]*m/g, "")
    .trim();
}

function getPrintedInfo(source: string): {
  hasJungdab: boolean;
  printedVar?: string;
  expected?: number;
  printed: boolean;
} {
  const lines = String(source || "")
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);
  const vars: Record<string, number> = {};
  let printedVar: string | undefined;

  const toNumber = (token: string): number | undefined => {
    if (/^[+-]?\d+$/.test(token)) return parseInt(token, 10);
    if (/^[+-]?\d+\.\d+$/.test(token)) return parseFloat(token);
    return vars[token];
  };

  for (const line of lines) {
    const showMatch = line.match(/^([^\s]+)\s+(?:보여주기|출력하기|출력)$/);
    if (showMatch) {
      printedVar = showMatch[1];
      continue;
    }

    const binMatch = line.match(/^([^\s=]+)\s*=\s*([^\s]+)\s*([+\-*/])\s*([^\s]+)$/);
    if (binMatch) {
      const name = binMatch[1];
      const a = toNumber(binMatch[2]);
      const op = binMatch[3];
      const b = toNumber(binMatch[4]);
      if (a === undefined || b === undefined) {
        vars[name] = NaN;
      } else {
        let v = NaN;
        if (op === "+") v = a + b;
        else if (op === "-") v = a - b;
        else if (op === "*") v = a * b;
        else if (op === "/") v = b !== 0 ? a / b : NaN;
        vars[name] = v;
      }
      continue;
    }

    const assignMatch = line.match(/^([^\s=]+)\s*=\s*([^\s]+)$/);
    if (assignMatch) {
      const name = assignMatch[1];
      const val = toNumber(assignMatch[2]);
      vars[name] = val === undefined ? NaN : val;
      continue;
    }
  }

  const hasJungdab = typeof vars["정답"] === "number" && !Number.isNaN(vars["정답"]);

  if (printedVar) {
    return {
      hasJungdab,
      printedVar,
      expected: hasJungdab ? vars["정답"] : undefined,
      printed: true,
    };
  }

  return { hasJungdab, expected: hasJungdab ? vars["정답"] : undefined, printed: false };
}

export default function DragEditor({ title, subtitle, grammarTokens }: DragEditorProps) {
  const {
    codeDrags,
    availableDrags,
    insertLineBreak,
    reset: resetStore,
    running,
    activeIndex,
    output,
    error,
    setOutput: storeSetOutput,
    setError: storeSetError,
    setRunning: storeSetRunning,
    setActiveIndex: storeSetActiveIndex,
    setAvailableDrags,
  } = useDragEditorStore();

  const chipRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const codeAreaRef = useRef<HTMLDivElement>(null);

  const setChipRef = (id: string) => (el: HTMLDivElement | null) => {
    el ? chipRefs.current.set(id, el) : chipRefs.current.delete(id);
  };

  useEffect(() => {
    // 줄바꿈은 버튼으로 처리하므로 드래그 가능한 목록에서 제외합니다.
    setAvailableDrags(grammarTokens.filter(t => t.text !== "변수," && t.text !== "줄바꿈"));
  }, [grammarTokens, setAvailableDrags]);

  useDraggableChips(availableDrags, chipRefs, codeAreaRef);

  const handleInsertLineBreak = () => {
    insertLineBreak();
  };

  const previewSource = useMemo(() => formatPreview(codeDrags), [codeDrags]);
  /**
   * 실행 세션을 생성하고 실행합니다. 출력/에러는 전달된 setters로 처리됩니다.
   */
  const runSession = async (src: string) => {
    const session = new YaksokSession({
      stdout: (message: string) => {
        const m = stripError(String(message ?? ""));
        storeSetOutput(m);
      },
      stderr: (message: string, machineReadable?: any) => {
        const raw = String(message ?? "");
        const human = stripError(raw);

        storeSetOutput(human);

        if (machineReadable && typeof machineReadable === "object" && machineReadable.message) {
          storeSetError(String(machineReadable.message));
          return;
        }

        const lines = human
          .split("\n")
          .map(l => l.replace("\r", "").trim())
          .filter(Boolean);
        const last = lines.length ? lines[lines.length - 1] : human || "오류가 발생했습니다";
        storeSetError(last);
      },
    });

    session.addModule("main", src);
    await session.runModule("main");
  };

  const parseFirstNumber = (s?: string) => {
    if (!s) return undefined;
    const m = String(s).match(/[-+]?[0-9]+(?:\.[0-9]+)?/);
    return m ? (m[0].includes(".") ? parseFloat(m[0]) : parseInt(m[0], 10)) : undefined;
  };

  const handleStart = async () => {
    storeSetError("");
    storeSetOutput("");

    if (codeDrags.length === 0) {
      storeSetError("코드 드래그 조각이 없습니다. 조각을 드래그하여 코드를 완성하세요.");
      return;
    }

    storeSetRunning(true);

    try {
      for (let i = 0; i < codeDrags.length; i++) {
        storeSetActiveIndex(i);
        await sleep(300);
      }
      storeSetActiveIndex(-1);

      const source = previewSource;

      await runSession(source);

      const finalPrev = useDragEditorStore.getState().output;
      const expectedInfo = getPrintedInfo(source);
      const actual = parseFirstNumber(finalPrev);

      if (expectedInfo) {
        const { hasJungdab, printedVar, expected, printed } = expectedInfo;

        if (!hasJungdab) {
          storeSetError(`틀렸습니다. '정답' 변수에 숫자를 할당하세요.`);
          return;
        }

        if (!printed) {
          storeSetError(`틀렸습니다. '정답'을 보여주기 하세요.`);
          return;
        }

        if (printedVar !== "정답") {
          storeSetError(`틀렸습니다. 반드시 '정답'을 보여주어야 합니다.`);
          return;
        }

        if (actual === undefined) {
          storeSetError(`틀렸습니다. 정답을 출력하지 않았습니다.`);
          return;
        }

        if (Number(expected) !== Number(actual)) {
          storeSetError(`틀렸습니다. 출력: ${actual} · 정답: ${expected}`);
          return;
        }

        const remaining = useDragEditorStore.getState().availableDrags || [];
        if (remaining.length > 0) {
          const msg = `모든 문법 조각을 다 써야 정답입니다`;
          try {
            window.alert(msg);
          } catch (e) {
            /* ignore */
          }
          storeSetError(msg);
          return;
        }

        // 모든 검사를 통과하면 에러 클리어
        storeSetError("");
      }

      if (!useDragEditorStore.getState().output) storeSetOutput("실행 완료");
    } catch (e: any) {
      const msg = e?.message || String(e);
      storeSetError(msg);
      storeSetOutput("[생성된 소스]\n" + previewSource);
    } finally {
      storeSetRunning(false);
      storeSetActiveIndex(-1);
    }
  };

  const handleReset = () => {
    // 리셋 시에도 줄바꿈 토큰은 드래그 목록에 포함되지 않도록 필터링해서 전달
    resetStore(grammarTokens.filter(t => t.text !== "줄바꿈"));
  };

  return (
    <div className="page-frame">
      <TopBanner title={title} />

      <div className="page-body">
        <CodeArea
          title={title}
          subtitle={subtitle}
          codeDrags={codeDrags}
          activeIndex={activeIndex}
          previewSource={previewSource}
          output={output}
          error={error}
          codeAreaRef={codeAreaRef}
        />
        <GrammarPanel
          availableDrags={availableDrags}
          setChipRef={setChipRef}
          onInsertLineBreak={handleInsertLineBreak}
        />
        <BottomActions onStart={handleStart} running={running} onReset={handleReset} />
      </div>
    </div>
  );
}
