import { FC, ReactNode, CSSProperties } from 'react';

export interface StackProps {
  direction?: 'column' | 'row';
  gap?: string | number;
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
  wrap?: boolean;
  style?: CSSProperties;
  children?: ReactNode;
}

export const Stack: FC<StackProps> = ({
  direction = 'column',
  gap = 'var(--sd-space-3, 12px)',
  align = 'stretch',
  justify = 'flex-start',
  wrap = false,
  style,
  children,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction,
        gap,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
