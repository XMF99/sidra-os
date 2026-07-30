import { FC } from 'react';

export interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

export const BarChart: FC<BarChartProps> = ({
  data,
  color = 'var(--sd-color-accent, #6366f1)',
  height = 160,
}) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value)) || 1;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height,
        gap: 12,
        paddingTop: 16,
        fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
      }}
    >
      {data.map((item, idx) => {
        const barHeightPercent = (item.value / maxValue) * 100;
        return (
          <div
            key={idx}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'flex-end',
            }}
          >
            <div
              style={{
                width: '100%',
                maxHeight: '100%',
                height: `${barHeightPercent}%`,
                backgroundColor: color,
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.3s ease',
              }}
              title={`${item.label}: ${item.value}`}
            />
            <span
              style={{
                fontSize: 11,
                color: 'var(--sd-color-text-muted, #6b7280)',
                marginTop: 6,
                textAlign: 'center',
              }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
