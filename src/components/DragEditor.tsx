import React, { useEffect, useMemo, useRef } from "react";
import { YaksokSession } from "@dalbit-yaksok/core";
import BottomActions from "./Editor/BottomActions";
import type { dragItem } from "../types/dragType";
import type { ExpectedAnswer, DragEditorProps } from "../types/dragEditor";
import { useDragEditorStore } from "../stores/useDragEditorStore";
import useDraggableChips from "../hooks/useDraggableChips";
import GrammarPanel from "./Editor/GrammarPanel";
import CodeArea from "./Editor/CodeArea";
import TopBanner from "./Editor/TopBanner";
import "../css/DragEditor.css";

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

// 코드 드래그 조각들을 코드 형태로 포맷팅
function formatPreview(tokens: dragItem[]): string {
  if (tokens.length === 0) return "";

  const lines: string[] = [];
  let cur = "";
  const getIndent = () => " "; // 줄바꿈 표시용

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i].text;

    if (t === "줄바꿈") {
      if (cur.trim()) lines.push(cur.trim());
      cur = getIndent();
      continue;
    }

    cur += (cur.trim() ? " " : "") + t;
  }

  if (cur.trim()) lines.push(cur.trim());

  return lines.join("\n");
}

function getPrintedInfo(source: string): {
  hasJungdab: boolean;
  printedVar?: string;
  expected?: number;
  printed: boolean;
  exprs: Record<string, { op?: string; left?: string; right?: string; raw?: string }>;
  vars: Record<string, number>;
} {
  const lines = String(source || "")
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const vars: Record<string, number> = {};
  const exprs: Record<string, { op?: string; left?: string; right?: string; raw?: string }> = {};
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
      exprs[name] = { op, left: binMatch[2], right: binMatch[4], raw: binMatch[0] };
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
      exprs,
      vars,
    };
  }

  return {
    hasJungdab,
    expected: hasJungdab ? vars["정답"] : undefined,
    printed: false,
    exprs,
    vars,
  };
}

export default function DragEditor({
  title,
  subtitle,
  grammarTokens,
  expectedAnswer,
}: DragEditorProps) {
  const {
    codeDrags,
    drags,
    reset: resetStore,
    running,
    activeIndex,
    output,
    error,
    setError: storeSetError,
    setRunning: storeSetRunning,
    setActiveIndex: storeSetActiveIndex,
    setDrags,
    setOutput: storeSetOutput,
    setAnswerCheck: storeSetAnswerCheck,
  } = useDragEditorStore();

  const chipRefs = useRef<Map<string, HTMLDivElement>>(new Map()); // ref를 저장할 Map

  const codeAreaRef = useRef<HTMLDivElement>(null); // 코드 영역 ref

  const setChipRef = (id: string) => (el: HTMLDivElement | null) => {
    el ? chipRefs.current.set(id, el) : chipRefs.current.delete(id);
  };

  useEffect(() => {
    setDrags(grammarTokens.filter(t => t.text !== "줄바꿈"));
  }, [grammarTokens, setDrags]);

  useDraggableChips(drags, chipRefs, codeAreaRef);

  const previewSource = useMemo(() => formatPreview(codeDrags), [codeDrags]);

  const setsEqual = (a: Set<string>, b: Set<string>) => {
    if (a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;
    return true;
  };

  const runSession = async (src: string): Promise<string> => {
    let lastMessage = "";

    const session = new YaksokSession({
      stdout: (message: string) => {
        const s = String(message ?? "");
        lastMessage = s;
        storeSetOutput(s);
        console.warn(`성공@@@@: ${message}`);
      },

      stderr: (message: string, machineReadable?: any) => {
        console.warn(`오류@@@@: ${message}`);

        if (machineReadable && typeof machineReadable === "object" && machineReadable.message) {
          storeSetError(String(machineReadable.message));
          console.log(`머신 리더블 오류 메시지:`, machineReadable);
          return;
        }
      },
    });

    session.addModule("main", src);
    await session.runModule("main");

    return lastMessage;
  };

  const parseFirstNumber = (s?: string) => {
    if (!s) return undefined;
    const m = String(s).match(/[-+]?[0-9]+(?:\.[0-9]+)?/);
    return m ? (m[0].includes(".") ? parseFloat(m[0]) : parseInt(m[0], 10)) : undefined;
  };

  // animate 활성 인덱스
  const animateActiveProgress = async () => {
    for (let i = 0; i < codeDrags.length; i++) {
      storeSetActiveIndex(i);
      await sleep(10);
    }
    storeSetActiveIndex(-1);
  };

  const warnIfRemainingTokens = (): boolean => {
    const remaining = useDragEditorStore.getState().drags || [];
    if (remaining.length > 0) {
      const warnMsg = `경고 : 문법 조각을 전부 사용해주세요.`;
      window.alert(warnMsg);
      storeSetError(warnMsg);
      return true;
    }
    storeSetError("");
    return false;
  };

  const handleExpectedAnswerOut = (finalPrev: string): boolean => {
    if (!(expectedAnswer && expectedAnswer.answer !== undefined)) return false;
    const expectedStr = String(expectedAnswer.answer);
    const outStr = String(finalPrev ?? "").trim();
    if (outStr === expectedStr) {
      storeSetAnswerCheck(true);
      warnIfRemainingTokens();
      return true;
    }
    storeSetAnswerCheck(false);
    storeSetError(`틀렸습니다. 출력: ${outStr}`);
    return true;
  };

  const evaluatePrintedInfo = (source: string, finalPrev: string): boolean => {
    const expectedInfo = getPrintedInfo(source);
    const { hasJungdab, printedVar, expected, printed, exprs } = expectedInfo;
    const actual = parseFirstNumber(finalPrev);

    if (!hasJungdab) {
      storeSetError(`틀렸습니다. '정답' 변수에 숫자를 할당하세요.`);
      return false;
    }

    if (!printed) {
      storeSetError(`틀렸습니다. '정답'을 보여주기 하세요.`);
      return false;
    }

    if (printedVar !== "정답") {
      storeSetError(`틀렸습니다. 반드시 '정답'을 보여주어야 합니다.`);
      return false;
    }

    if (actual === undefined) {
      storeSetError(`틀렸습니다. 정답을 출력하지 않았습니다.`);
      return false;
    }

    if (expectedAnswer) {
      const va = expectedAnswer;
      const varName = va.varName || "정답";
      const expr = exprs[varName];

      if (!expr || !expr.op) {
        storeSetError(`틀렸습니다. '정답'에 이항 연산을 할당하세요.`);
        return false;
      }

      if (va.op && expr.op !== va.op) {
        storeSetError(`틀렸습니다. 올바른 연산자(${va.op})를 사용하세요.`);
        return false;
      }

      const left = expr.left;
      const right = expr.right;

      const resolveTokenVal = (token?: string) => {
        if (!token) return undefined;
        if (/^[+-]?[0-9]+(?:\.[0-9]+)?$/.test(token)) return Number(token);
        const maybe = expectedInfo.vars?.[token];
        return typeof maybe === "number" && !Number.isNaN(maybe) ? maybe : undefined;
      };

      const expectedLeftVal = resolveTokenVal(va.left);
      const expectedRightVal = resolveTokenVal(va.right);
      const actualLeftVal = resolveTokenVal(left);
      const actualRightVal = resolveTokenVal(right);

      if (va.commutative || expr.op === "+" || expr.op === "*") {
        if (
          // 실제로 모두 숫자일 때만 순서 상관 없는지 검사
          typeof expectedLeftVal === "number" &&
          typeof expectedRightVal === "number" &&
          typeof actualLeftVal === "number" &&
          typeof actualRightVal === "number"
        ) {
          // expected와 actual의 피연산자 집합이 같은지 검사
          const s1 = new Set([String(expectedLeftVal), String(expectedRightVal)]);
          const s2 = new Set([String(actualLeftVal), String(actualRightVal)]);
          if (!setsEqual(s1, s2)) {
            storeSetError(`틀렸습니다. 연산에 사용된 피연산자가 올바르지 않습니다.`);
            return false;
          }
        } else {
          const setA = new Set([String(va.left), String(va.right)]);
          const setB = new Set([String(left), String(right)]);
          if (!setsEqual(setA, setB)) {
            storeSetError(`틀렸습니다. 연산에 사용된 피연산자가 올바르지 않습니다.`);
            return false;
          }
        }
      } else {
        if (typeof expectedLeftVal === "number" && typeof actualLeftVal === "number") {
          if (expectedLeftVal !== actualLeftVal) {
            storeSetError(`틀렸습니다. 피연산자의 순서를 확인하세요.`);
            return false;
          }
          if (expectedRightVal !== actualRightVal) {
            storeSetError(`틀렸습니다. 피연산자의 순서를 확인하세요.`);
            return false;
          }
        } else {
          if (String(left) !== String(va.left) || String(right) !== String(va.right)) {
            storeSetError(`틀렸습니다. 피연산자의 순서를 확인하세요.`);
            return false;
          }
        }
      }
    }

    if (Number(expected) !== Number(actual)) {
      storeSetError(`틀렸습니다. 출력: ${actual} · 정답: ${expected}`);
      return false;
    }

    return true;
  };

  const handleStart = async () => {
    storeSetError("");
    storeSetOutput("");

    if (codeDrags.length === 0) {
      storeSetError("코드 드래그 조각이 없습니다. 조각을 드래그하여 코드를 완성하세요.");
      return;
    }

    storeSetRunning(true);

    if (!useDragEditorStore.getState().setRunning) return;

    try {
      await animateActiveProgress();

      const source = previewSource;
      const finalPrev = await runSession(source);

      // expectedAnswer 우선 처리
      if (handleExpectedAnswerOut(finalPrev)) {
        return;
      }

      // printed-based 검증
      if (!evaluatePrintedInfo(source, finalPrev)) {
        return;
      }

      // 남은 토큰 경고(있어도 성공)
      warnIfRemainingTokens();

      storeSetAnswerCheck(true);
      storeSetError("");
    } catch (e: any) {
      console.warn(`실행 중 오류@@@@:`, e);
      const msg = e?.message || String(e);
      storeSetError(msg);
    } finally {
      storeSetRunning(false);
      storeSetActiveIndex(-1);
      console.log("[생성된 소스]\n" + previewSource);
    }
  };

  const handleReset = () => {
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
          drags={drags}
          setChipRef={setChipRef}
          onLineBreak={useDragEditorStore.getState().lineBreak}
        />
        <BottomActions onStart={handleStart} running={running} onReset={handleReset} />
      </div>
    </div>
  );
}
