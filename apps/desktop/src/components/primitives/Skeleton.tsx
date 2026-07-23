import { FC } from 'react';

export interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
}

export const Skeleton: FC<SkeletonProps> = ({
  width = '100%',
  height = '16px',
  borderRadius = 'var(--sd-radius-md)',
}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--sd-color-bg-inset)',
        opacity: 0.6,
        animation: 'sd-pulse 1.5s ease-in-out infinite',
      }}
    />
  );
};
