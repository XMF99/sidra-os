import { FC, ReactNode, CSSProperties } from 'react';

export interface TextProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | string;
  style?: CSSProperties;
  children?: ReactNode;
}

export const Text: FC<TextProps> = ({
  size = 'sm',
  weight = 'regular',
  color = 'primary',
  style,
  children,
}) => {
  const fontSizes = { xs: 12, sm: 14, md: 16, lg: 18 };
  const fontWeights = { regular: 400, medium: 500, semibold: 600, bold: 700 };

  const colorMap: Record<string, string> = {
    primary: 'var(--sd-color-text-primary, #f3f4f6)',
    secondary: 'var(--sd-color-text-secondary, #9ca3af)',
    muted: 'var(--sd-color-text-muted, #6b7280)',
  };

  const finalColor = colorMap[color] ?? color;

  return (
    <span
      style={{
        fontSize: fontSizes[size],
        fontWeight: fontWeights[weight],
        color: finalColor,
        fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
        lineHeight: 1.5,
        ...style,
      }}
    >
      {children}
    </span>
  );
};
