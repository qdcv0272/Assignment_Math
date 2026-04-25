import React from "react";
import { Link } from "react-router-dom";

type Props = {
  onStart: () => Promise<void> | void;
  running: boolean;
  onReset: () => void;
};

export default function BottomActions({ onStart, running, onReset }: Props) {
  return (
    <div className="bottom-actions">
      <button className="primary-button" onClick={() => onStart()} disabled={running}>
        {running ? "실행 중..." : "시작"}
      </button>
      <button className="secondary-button" onClick={onReset}>
        초기화
      </button>
      <Link to="/" className="text-link">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
