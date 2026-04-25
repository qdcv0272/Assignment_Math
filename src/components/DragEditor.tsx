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
    // console.log("연결된 cur :", cur);
  }

  if (cur.trim()) lines.push(cur.trim());

  return lines.join("\n");
}

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

  const chipRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const codeAreaRef = useRef<HTMLDivElement>(null);

  const setChipRef = (id: string) => (el: HTMLDivElement | null) => {
    el ? chipRefs.current.set(id, el) : chipRefs.current.delete(id);
  };

  useEffect(() => {
    setAvailableDrags(grammarTokens.filter(t => t.text !== "변수,"));
  }, [grammarTokens, setAvailableDrags]);

  useDraggableChips(availableDrags, chipRefs, codeAreaRef);

  const handleInsertLineBreak = () => {
    insertLineBreak();
  };

  const previewSource = useMemo(() => formatPreview(codeDrags), [codeDrags]);

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
        <TopBanner title={title} />

        <div className="page-body">
          <CodeArea
            subtitle={subtitle}
            codeDrags={codeDrags}
            activeIndex={activeIndex}
            previewSource={previewSource}
            output={output}
            error={error}
            errorModalOpen={errorModalOpen}
            setErrorModalOpen={setErrorModalOpen}
            codeAreaRef={codeAreaRef}
          />
          <GrammarPanel
            availableDrags={availableDrags}
            setChipRef={setChipRef}
            onInsertLineBreak={handleInsertLineBreak}
          />
        </div>

        <BottomActions onStart={handleStart} running={running} onReset={handleReset} />
      </div>
    </div>
  );
}
