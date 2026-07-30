import { FC, ReactNode, CSSProperties, ElementType } from 'react';

export interface BoxProps {
  as?: ElementType;
  padding?: string | number;
  margin?: string | number;
  bg?: string;
  color?: string;
  border?: string;
  borderRadius?: string | number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export const Box: FC<BoxProps> = ({
  as: Component = 'div',
  padding,
  margin,
  bg,
  color,
  border,
  borderRadius,
  className,
  style,
  children,
}) => {
  return (
    <Component
      className={className}
      style={{
        padding,
        margin,
        backgroundColor: bg,
        color,
        border,
        borderRadius,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </Component>
  );
};
