import type { dragItem } from "./dragType";

export type ExpectedAnswer = {
  varName?: string;
  op?: "+" | "-" | "*" | "/";
  left?: string;
  right?: string;
  commutative?: boolean;
  answer?: number;
};

export type DragEditorProps = {
  title: string;
  subtitle: string;
  grammarTokens: dragItem[];
  expectedAnswer?: ExpectedAnswer;
};
