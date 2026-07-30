import { FC } from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Switch: FC<SwitchProps> = ({ checked, onChange, label, disabled = false }) => {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => !disabled && onChange(!checked)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        style={{
          width: 38,
          height: 20,
          borderRadius: 10,
          backgroundColor: checked
            ? 'var(--sd-color-accent, #6366f1)'
            : 'var(--sd-color-border-default, #2e3548)',
          position: 'relative',
          transition: 'background-color 0.2s ease',
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            position: 'absolute',
            top: 2,
            left: checked ? 20 : 2,
            transition: 'left 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        />
      </div>
      {label && (
        <span
          style={{
            fontSize: 14,
            color: 'var(--sd-color-text-primary, #f3f4f6)',
            fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
          }}
        >
          {label}
        </span>
      )}
    </label>
  );
};
