import { FC, InputHTMLAttributes, ReactNode } from 'react';

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const TextInput: FC<TextInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  style,
  id,
  ...props
}) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--sd-color-text-secondary, #9ca3af)',
            fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 36,
          backgroundColor: 'var(--sd-color-surface-sunken, #050608)',
          border: error
            ? '1px solid var(--sd-color-status-error, #ef4444)'
            : '1px solid var(--sd-color-border-default, #2e3548)',
          borderRadius: 'var(--sd-radius-md, 6px)',
          padding: '0 12px',
          gap: 8,
        }}
      >
        {leftIcon}
        <input
          id={inputId}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'var(--sd-color-text-primary, #f3f4f6)',
            fontSize: 14,
            fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
            ...style,
          }}
          {...props}
        />
        {rightIcon}
      </div>
      {error && (
        <span
          style={{
            fontSize: 11,
            color: 'var(--sd-color-status-error, #ef4444)',
            fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
};
