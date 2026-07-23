import { FC, ReactNode } from 'react';

export interface ChipProps {
  label: ReactNode;
  selected?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
}

export const Chip: FC<ChipProps> = ({
  label,
  selected = false,
  onRemove,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--sd-space-1)',
        padding: 'var(--sd-space-1) var(--sd-space-3)',
        borderRadius: 'var(--sd-radius-pill)',
        backgroundColor: selected ? 'var(--sd-color-selection)' : 'var(--sd-color-bg-inset)',
        border: selected ? '1px solid var(--sd-color-primary)' : '1px solid var(--sd-color-border)',
        color: selected ? 'var(--sd-color-primary)' : 'var(--sd-color-text)',
        fontSize: 'var(--sd-font-size-xs)',
        fontWeight: 'var(--sd-font-weight-medium)',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove filter"
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: 0,
            fontSize: '12px',
            marginLeft: '4px',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};
