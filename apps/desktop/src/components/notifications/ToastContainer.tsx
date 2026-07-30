import { FC } from 'react';
import { useNotificationStore } from '../../state/useNotificationStore';

export const ToastContainer: FC = () => {
  const { toasts, removeToast } = useNotificationStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notification Toasts"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 360,
        pointerEvents: 'auto',
      }}
    >
      {toasts.map((toast) => {
        const colors = {
          info: '#3b82f6',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        };
        const color = colors[toast.type] ?? '#3b82f6';

        return (
          <div
            key={toast.id}
            style={{
              backgroundColor: 'var(--sd-color-bg-app, #0f172a)',
              border: `1px solid ${color}`,
              borderLeft: `4px solid ${color}`,
              borderRadius: 8,
              padding: '12px 16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              color: '#fff',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{toast.title}</div>
              {toast.message && (
                <div style={{ fontSize: 12, color: 'var(--sd-color-text-muted, #94a3b8)', marginTop: 4 }}>
                  {toast.message}
                </div>
              )}
            </div>
            <button
              aria-label="Dismiss notification"
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};
