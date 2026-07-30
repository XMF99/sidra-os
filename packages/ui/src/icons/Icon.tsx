import { FC } from 'react';
import * as LucideIcons from 'lucide-react';

export interface IconProps {
  name: string;
  size?: number | string;
  color?: string;
  className?: string;
}

export const Icon: FC<IconProps> = ({ name, size = 18, color, className }) => {
  const IconComponent = (LucideIcons as unknown as Record<string, FC<{ size?: number | string; color?: string; className?: string }>>)[name];

  if (!IconComponent) {
    return <span style={{ fontSize: Number(size) || 18 }}>📍</span>;
  }

  return <IconComponent size={size} color={color} className={className} />;
};
