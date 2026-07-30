import { FC } from 'react';

export interface ThinkingIndicatorProps {
  label?: string;
}

export const ThinkingIndicator: FC<ThinkingIndicatorProps> = ({ label = 'Agent reasoning...' }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderRadius: 9999,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        color: '#818cf8',
        fontSize: 12,
        fontWeight: 500,
        fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
      }}
    >
      <span style={{ display: 'inline-block', animation: 'spin 1.5s linear infinite' }}>🧠</span>
      <span>{label}</span>
    </div>
  );
};
