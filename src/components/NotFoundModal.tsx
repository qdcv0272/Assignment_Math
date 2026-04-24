import React, { useEffect } from "react";
import "../css/NotFoundModal.css";

type Props = {
  open?: boolean;
  onClose: () => void;
  name?: string;
  detail?: string;
};

export default function NotFoundModal({ open = true, onClose, name = "민지", detail }: Props) {
  // Esc 키로 모달 닫기 핸들러 등록
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null; // 열려있지 않으면 아무것도 렌더링하지 않음

  // 상세 메시지가 없으면 기본 메시지를 사용
  const defaultMessage = `"${name}"라는 변수나 약속을 찾을 수 없어요.`;
  const display = detail ?? defaultMessage;

  return (
    /* 모달 배경을 클릭하면 닫힘 */
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      {/* 내부 클릭은 이벤트 전파를 막아 배경 클릭으로 인한 닫힘을 방지 */}
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>찾을 수 없음</h3>
        </div>
        <div className="modal-body">
          <p className="modal-label">상세 메시지</p>
          <pre className="modal-message">{display}</pre>
        </div>
        <div className="modal-actions">
          {/* 닫기 버튼은 onClose 호출 */}
          <button className="primary-button" onClick={onClose} type="button">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
