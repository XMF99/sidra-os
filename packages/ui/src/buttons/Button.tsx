import { FC, ReactNode, ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  style,
  ...props
}) => {
  const variantStyles: Record<string, { bg: string; color: string; border: string }> = {
    primary: {
      bg: 'var(--sd-color-accent, #6366f1)',
      color: '#ffffff',
      border: 'none',
    },
    secondary: {
      bg: 'var(--sd-color-surface-raised, #12151e)',
      color: 'var(--sd-color-text-primary, #f3f4f6)',
      border: '1px solid var(--sd-color-border-default, #2e3548)',
    },
    ghost: {
      bg: 'transparent',
      color: 'var(--sd-color-text-primary, #f3f4f6)',
      border: 'none',
    },
    outline: {
      bg: 'transparent',
      color: 'var(--sd-color-accent, #6366f1)',
      border: '1px solid var(--sd-color-accent, #6366f1)',
    },
    destructive: {
      bg: 'var(--sd-color-status-error, #ef4444)',
      color: '#ffffff',
      border: 'none',
    },
    success: {
      bg: 'var(--sd-color-status-success, #10b981)',
      color: '#ffffff',
      border: 'none',
    },
  };

  const sizeStyles: Record<string, { height: number; padding: string; fontSize: number }> = {
    sm: { height: 28, padding: '0 10px', fontSize: 12 },
    md: { height: 36, padding: '0 16px', fontSize: 14 },
    lg: { height: 44, padding: '0 20px', fontSize: 16 },
  };

  const currentVariant = variantStyles[variant] ?? variantStyles.primary;
  const currentSize = sizeStyles[size] ?? sizeStyles.md;

  return (
    <button
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: currentSize.height,
        padding: currentSize.padding,
        fontSize: currentSize.fontSize,
        fontWeight: 500,
        borderRadius: 'var(--sd-radius-md, 6px)',
        backgroundColor: currentVariant.bg,
        color: currentVariant.color,
        border: currentVariant.border,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        gap: 8,
        transition: 'background-color 0.15s ease, transform 0.1s ease',
        fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
        outline: 'none',
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
};
