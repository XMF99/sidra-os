import { FC, ReactNode } from 'react';

export interface KbdProps {
  children: ReactNode;
}

export const Kbd: FC<KbdProps> = ({ children }) => {
  return (
    <kbd
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 5px',
        minWidth: '18px',
        height: '18px',
        borderRadius: 'var(--sd-radius-sm)',
        backgroundColor: 'var(--sd-color-bg-inset)',
        border: '1px solid var(--sd-color-border)',
        color: 'var(--sd-color-text-muted)',
        fontFamily: 'var(--sd-font-mono)',
        fontSize: '11px',
        fontWeight: 'var(--sd-font-weight-medium)',
        lineHeight: 1,
      }}
    >
      {children}
    </kbd>
  );
};
