import { FC } from 'react';

export interface ProgressProps {
  value: number; // 0..100
  color?: string;
  height?: number;
}

export const Progress: FC<ProgressProps> = ({
  value,
  color = 'var(--sd-color-accent, #6366f1)',
  height = 6,
}) => {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        width: '100%',
        height,
        backgroundColor: 'var(--sd-color-surface-sunken, #050608)',
        borderRadius: height / 2,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: height / 2,
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
};
