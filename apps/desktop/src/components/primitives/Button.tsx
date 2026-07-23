import { FC, ButtonHTMLAttributes, ReactNode } from 'react';
import { PermissionState } from '../../app/providers/PermissionProvider';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  permission?: PermissionState;
  children: ReactNode;
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  permission = 'enabled',
  disabled,
  children,
  style,
  ...rest
}) => {
  if (permission === 'hidden') {
    return null;
  }

  const isBtnDisabled = disabled || loading || permission === 'disabled';

  let bg = 'var(--sd-color-primary)';
  let color = 'var(--sd-color-primary-contrast)';
  let border = 'none';

  if (variant === 'secondary') {
    bg = 'var(--sd-color-bg-inset)';
    color = 'var(--sd-color-text)';
    border = '1px solid var(--sd-color-border)';
  } else if (variant === 'ghost') {
    bg = 'transparent';
    color = 'var(--sd-color-text)';
    border = 'none';
  } else if (variant === 'danger') {
    bg = 'var(--sd-status-danger)';
    color = '#ffffff';
    border = 'none';
  } else if (variant === 'link') {
    bg = 'transparent';
    color = 'var(--sd-color-primary)';
    border = 'none';
  }

  const paddings = {
    sm: 'var(--sd-space-1) var(--sd-space-3)',
    md: 'var(--sd-space-2) var(--sd-space-4)',
    lg: 'var(--sd-space-3) var(--sd-space-6)',
  };

  return (
    <button
      disabled={isBtnDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--sd-space-2)',
        padding: paddings[size],
        borderRadius: 'var(--sd-radius-md)',
        backgroundColor: isBtnDisabled ? 'var(--sd-color-bg-inset)' : bg,
        color: isBtnDisabled ? 'var(--sd-color-text-subtle)' : color,
        border,
        fontWeight: 'var(--sd-font-weight-medium)',
        fontSize: size === 'sm' ? 'var(--sd-font-size-xs)' : size === 'lg' ? 'var(--sd-font-size-md)' : 'var(--sd-font-size-sm)',
        cursor: isBtnDisabled ? 'not-allowed' : 'pointer',
        transition: 'all var(--sd-motion-fast) var(--sd-ease-standard)',
        ...style,
      }}
      {...rest}
    >
      {loading ? <span>Loading...</span> : children}
    </button>
  );
};
