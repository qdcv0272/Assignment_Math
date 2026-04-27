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

/** 코드 드래그 조각들을 코드 형태로 포맷팅 */
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
    return () => {
      // 다른 페이지로 이동하거나 컴포넌트가 언마운트될 때 상태 초기화
      resetStore(grammarTokens.filter(t => t.text !== "줄바꿈"));
    };
  }, [grammarTokens, setDrags, resetStore]);

  useDraggableChips(drags, chipRefs, codeAreaRef);

  const previewSource = useMemo(() => formatPreview(codeDrags), [codeDrags]);

  /** Yaksok 세션을 실행하고 출력 결과를 반환 */
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
        // 보여주기 했을때 오류 메시지
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

  /** animate 활성 인덱스 */
  const animateActiveProgress = async () => {
    for (let i = 0; i < codeDrags.length; i++) {
      storeSetActiveIndex(i);
      await sleep(10);
    }
    storeSetActiveIndex(-1);
  };

  /** 토큰 남고 정답인 경우 경고 */
  const warnIfRemainingTokens = (): boolean => {
    const remaining = useDragEditorStore.getState().drags || [];
    if (remaining.length > 0) {
      const warnMsg = `경고 : 문법 조각을 전부 사용해주세요. 찝찝`;
      window.alert(warnMsg);
      storeSetError(warnMsg);
      return true;
    }
    storeSetError("");
    return false;
  };

  /** 정오답 처리 */
  const handleExpectedAnswerOut = (finalPrev: string): boolean => {
    if (!(expectedAnswer && expectedAnswer.answer !== undefined)) return false;
    const expectedStr = String(expectedAnswer.answer);
    const outStr = String(finalPrev ?? "").trim();

    const existingError = useDragEditorStore.getState().error;
    if (existingError) {
      // 달빛약속 에러 있으면
      storeSetAnswerCheck(false);
      return true;
    }

    // '보여주기' 토큰이 코드에 없으면 정답 체크를 위한 코드가 잘못된 것으로 간주
    const hasShowToken =
      previewSource.includes("보여주기") || codeDrags.some(d => d.text === "보여주기");
    if (!hasShowToken) {
      storeSetAnswerCheck(false);
      storeSetError("정답 체크 하기위한 코드작성이 틀렸습니다.");
      return true;
    }

    if (outStr === expectedStr) {
      // 정답인 경우
      storeSetAnswerCheck(true);
      warnIfRemainingTokens();
      return true;
    }

    storeSetAnswerCheck(false);
    storeSetError(`틀렸습니다. 출력: ${outStr}`);
    return true;
  };

  /** 세션 시작 */
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

  /** 초기화 */
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
          onLineBreak={useDragEditorStore.getState().lineBreak} // 랜더링 최적화 위해 store에서 직접 가져오기
        />
        <BottomActions onStart={handleStart} running={running} onReset={handleReset} />
      </div>
    </div>
  );
}
