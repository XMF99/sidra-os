import { FC } from 'react';

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'active' | 'idle' | 'offline';
}

export const Avatar: FC<AvatarProps> = ({
  name,
  size = 'md',
  status,
}) => {
  const dimensions = { sm: '24px', md: '32px', lg: '40px' };
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const statusColors = {
    active: 'var(--sd-status-success)',
    idle: 'var(--sd-status-warning)',
    offline: 'var(--sd-neutral-400)',
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        style={{
          width: dimensions[size],
          height: dimensions[size],
          borderRadius: 'var(--sd-radius-circle)',
          backgroundColor: 'var(--sd-color-primary)',
          color: 'var(--sd-color-primary-contrast)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'var(--sd-font-weight-semibold)',
          fontSize: size === 'sm' ? '10px' : size === 'lg' ? '14px' : '12px',
          userSelect: 'none',
        }}
      >
        {initials}
      </div>
      {status && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '8px',
            height: '8px',
            borderRadius: 'var(--sd-radius-circle)',
            backgroundColor: statusColors[status],
            border: '2px solid var(--sd-color-bg-surface)',
          }}
        />
      )}
    </div>
  );
};
