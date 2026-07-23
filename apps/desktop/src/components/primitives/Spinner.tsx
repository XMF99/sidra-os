import { FC } from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export const Spinner: FC<SpinnerProps> = ({ size = 'md' }) => {
  const dimensions = { sm: '14px', md: '20px', lg: '28px' };

  return (
    <div
      role="progressbar"
      aria-busy="true"
      aria-label="Loading"
      style={{
        width: dimensions[size],
        height: dimensions[size],
        border: '2px solid var(--sd-color-border)',
        borderTopColor: 'var(--sd-color-primary)',
        borderRadius: 'var(--sd-radius-circle)',
        animation: 'sd-spin 0.8s linear infinite',
      }}
    />
  );
};
