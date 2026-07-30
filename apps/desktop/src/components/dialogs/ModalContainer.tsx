import { FC, useEffect } from 'react';
import { useModalStore } from '../../state/useModalStore';

export const ModalContainer: FC = () => {
  const { activeModal, closeModal, confirmDialog, closeConfirm } = useModalStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        closeConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeModal, closeConfirm]);

  if (!activeModal && !confirmDialog?.isOpen) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9000,
        pointerEvents: 'auto',
      }}
      onClick={() => {
        closeModal();
        closeConfirm();
      }}
    >
      {/* Modal Dialog Body */}
      {activeModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: activeModal.width ?? 520,
            maxWidth: '90vw',
            backgroundColor: 'var(--sd-color-bg-app, #0f172a)',
            border: '1px solid var(--sd-color-border, #334155)',
            borderRadius: 12,
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--sd-color-border, #334155)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{activeModal.title}</h3>
            <button
              aria-label="Close dialog"
              onClick={closeModal}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--sd-color-text-muted, #94a3b8)',
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ padding: 20 }}>{activeModal.content}</div>
        </div>
      )}

      {/* Confirmation Dialog Body */}
      {confirmDialog?.isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 420,
            backgroundColor: 'var(--sd-color-bg-app, #0f172a)',
            border: '1px solid var(--sd-color-border, #334155)',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>{confirmDialog.title}</h3>
          <p style={{ margin: '0 0 20px 0', fontSize: 14, color: 'var(--sd-color-text-muted, #94a3b8)' }}>
            {confirmDialog.message}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              onClick={closeConfirm}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                backgroundColor: 'transparent',
                border: '1px solid var(--sd-color-border, #334155)',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                confirmDialog.onConfirm();
                closeConfirm();
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                backgroundColor: '#ef4444',
                border: 'none',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
