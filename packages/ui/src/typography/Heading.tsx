import { FC, ReactNode, CSSProperties, ElementType } from 'react';

export interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  color?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export const Heading: FC<HeadingProps> = ({
  level = 1,
  color = 'var(--sd-color-text-primary, #f3f4f6)',
  style,
  children,
}) => {
  const Tag = `h${level}` as ElementType;
  const sizes = {
    1: 28,
    2: 24,
    3: 20,
    4: 18,
    5: 16,
    6: 14,
  };

  return (
    <Tag
      style={{
        margin: 0,
        fontSize: sizes[level],
        fontWeight: 600,
        lineHeight: 1.3,
        color,
        fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
        ...style,
      }}
    >
      {children}
    </Tag>
  );
};
