import { FC, ButtonHTMLAttributes, ReactNode } from 'react';
import { PermissionState } from '../../app/providers/PermissionProvider';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  'aria-label': string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  permission?: PermissionState;
}

export const IconButton: FC<IconButtonProps> = ({
  icon,
  'aria-label': ariaLabel,
  variant = 'ghost',
  size = 'md',
  permission = 'enabled',
  disabled,
  style,
  ...rest
}) => {
  if (permission === 'hidden') return null;

  const isDisabled = disabled || permission === 'disabled';
  const dimensions = { sm: '28px', md: '36px', lg: '44px' };

  return (
    <button
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={isDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dimensions[size],
        height: dimensions[size],
        borderRadius: 'var(--sd-radius-md)',
        backgroundColor: variant === 'secondary' ? 'var(--sd-color-bg-inset)' : 'transparent',
        border: variant === 'secondary' ? '1px solid var(--sd-color-border)' : 'none',
        color: isDisabled ? 'var(--sd-color-text-subtle)' : 'var(--sd-color-text)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      {...rest}
    >
      {icon}
    </button>
  );
};
