import { FC, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  invalid?: boolean;
}

export const Input: FC<InputProps> = ({
  label,
  hint,
  invalid = false,
  id,
  style,
  ...rest
}) => {
  const inputId = id || `sd-input-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sd-space-1)', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 'var(--sd-font-size-xs)',
            fontWeight: 'var(--sd-font-weight-medium)',
            color: 'var(--sd-color-text-muted)',
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={invalid}
        aria-describedby={hint ? `${inputId}-hint` : undefined}
        style={{
          padding: 'var(--sd-space-2) var(--sd-space-3)',
          borderRadius: 'var(--sd-radius-md)',
          backgroundColor: 'var(--sd-color-bg-inset)',
          border: invalid ? '1px solid var(--sd-status-danger)' : '1px solid var(--sd-color-border)',
          color: 'var(--sd-color-text)',
          fontSize: 'var(--sd-font-size-sm)',
          outline: 'none',
          boxSizing: 'border-box',
          width: '100%',
          ...style,
        }}
        {...rest}
      />
      {hint && (
        <span
          id={`${inputId}-hint`}
          style={{
            fontSize: 'var(--sd-font-size-xs)',
            color: invalid ? 'var(--sd-status-danger)' : 'var(--sd-color-text-subtle)',
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
};
