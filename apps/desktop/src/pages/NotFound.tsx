import { FC } from 'react';
import { navigate } from '../routes/navigate';

export const NotFound: FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: 'var(--sd-space-6)',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          margin: '0 0 var(--sd-space-2) 0',
          fontSize: 'var(--sd-font-size-2xl)',
          color: 'var(--sd-color-text)',
        }}
      >
        404 — Surface Not Found
      </h2>
      <p
        style={{
          margin: '0 0 var(--sd-space-4) 0',
          fontSize: 'var(--sd-font-size-base)',
          color: 'var(--sd-color-text-muted)',
          maxWidth: '400px',
        }}
      >
        The requested address or target surface does not exist in this build of Sidra OS.
      </p>
      <button
        onClick={() => navigate.dashboard()}
        style={{
          padding: 'var(--sd-space-2) var(--sd-space-4)',
          borderRadius: 'var(--sd-radius-md)',
          backgroundColor: 'var(--sd-color-primary)',
          color: 'var(--sd-color-primary-contrast)',
          border: 'none',
          fontSize: 'var(--sd-font-size-sm)',
          fontWeight: 'var(--sd-font-weight-medium)',
          cursor: 'pointer',
        }}
      >
        Return to Dashboard
      </button>
    </div>
  );
};
