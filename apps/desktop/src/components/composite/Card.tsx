import { FC, ReactNode, HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: string;
  elevation?: 0 | 1 | 2;
  interactive?: boolean;
}

export const Card: FC<CardProps> = ({
  children,
  padding = 'var(--sd-space-4)',
  elevation = 1,
  interactive = false,
  style,
  ...rest
}) => {
  const shadows = {
    0: 'var(--sd-shadow-0)',
    1: 'var(--sd-shadow-1)',
    2: 'var(--sd-shadow-2)',
  };

  return (
    <div
      style={{
        padding,
        borderRadius: 'var(--sd-radius-lg)',
        backgroundColor: 'var(--sd-color-bg-surface)',
        border: '1px solid var(--sd-color-border)',
        boxShadow: shadows[elevation],
        transition: interactive ? 'transform var(--sd-motion-fast) var(--sd-ease-standard)' : undefined,
        cursor: interactive ? 'pointer' : 'default',
        boxSizing: 'border-box',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};
