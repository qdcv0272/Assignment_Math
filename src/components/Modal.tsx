import React from "react";
import "../css/Modal.css";

type InstructionModalProps = {
  open?: boolean;
  onClose: () => void;
};

export default function InstructionModal({ open = true, onClose }: InstructionModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-body">
          <p className="modal-label">설명</p>
          <p className="modal-message">{`
          문제를 읽고 달빛약속 으로 문제를 풀어주세요
          정답을 맞출려면 정답에다가 변수를 할당해주세요`}</p>
        </div>
        <div className="modal-actions">
          <button className="primary-button" onClick={onClose} type="button">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
