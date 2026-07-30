import { FC, ReactNode, CSSProperties } from 'react';

export interface GridProps {
  columns?: number | string;
  gap?: string | number;
  style?: CSSProperties;
  children?: ReactNode;
}

export const Grid: FC<GridProps> = ({
  columns = 1,
  gap = 'var(--sd-space-4, 16px)',
  style,
  children,
}) => {
  const gridTemplateColumns = typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns,
        gap,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
