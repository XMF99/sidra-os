import { FC } from 'react';

export interface TabItem {
  id: string;
  label: string;
  badge?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
}

export const Tabs: FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sd-space-4)',
        borderBottom: '1px solid var(--sd-color-border)',
        marginBottom: 'var(--sd-space-4)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              padding: 'var(--sd-space-2) var(--sd-space-1)',
              background: 'none',
              border: 'none',
              borderBottom: isActive ? '2px solid var(--sd-color-primary)' : '2px solid transparent',
              color: isActive ? 'var(--sd-color-primary)' : 'var(--sd-color-text-muted)',
              fontSize: 'var(--sd-font-size-sm)',
              fontWeight: isActive ? 'var(--sd-font-weight-semibold)' : 'var(--sd-font-weight-regular)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--sd-space-2)',
              marginBottom: '-1px',
            }}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                style={{
                  padding: '1px 6px',
                  borderRadius: 'var(--sd-radius-pill)',
                  backgroundColor: 'var(--sd-color-bg-inset)',
                  fontSize: '11px',
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
