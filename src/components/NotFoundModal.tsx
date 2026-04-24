import React, { useEffect } from 'react';
import '../css/NotFoundModal.css';

type Props = {
  open?: boolean;
  onClose: () => void;
  name?: string;
  detail?: string;
};

export default function NotFoundModal({ open = true, onClose, name = '민지', detail }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!open) return null;

  const defaultMessage = `"${name}"라는 변수나 약속을 찾을 수 없어요.`;
  const display = detail ?? defaultMessage;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>찾을 수 없음</h3>
        </div>
        <div className="modal-body">
          <p className="modal-label">상세 메시지</p>
          <pre className="modal-message">{display}</pre>
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
