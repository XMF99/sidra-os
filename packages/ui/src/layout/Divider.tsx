import { FC, CSSProperties } from 'react';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  color?: string;
  style?: CSSProperties;
}

export const Divider: FC<DividerProps> = ({
  orientation = 'horizontal',
  color = 'var(--sd-color-border-subtle, #242938)',
  style,
}) => {
  return (
    <div
      role="separator"
      style={{
        width: orientation === 'horizontal' ? '100%' : '1px',
        height: orientation === 'horizontal' ? '1px' : '100%',
        backgroundColor: color,
        margin: orientation === 'horizontal' ? '8px 0' : '0 8px',
        boxSizing: 'border-box',
        ...style,
      }}
    />
  );
};
