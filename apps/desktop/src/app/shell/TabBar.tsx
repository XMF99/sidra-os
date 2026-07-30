import { FC } from 'react';
import { useTabStore } from '../../state/useTabStore';

export const TabBar: FC = () => {
  const { tabs, activeTabId, setActiveTab, closeTab, togglePinTab } = useTabStore();

  return (
    <div
      role="tablist"
      aria-label="Workspace Tabs"
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 36,
        backgroundColor: 'var(--sd-color-bg-subtle, #1e293b)',
        borderBottom: '1px solid var(--sd-color-border, #334155)',
        paddingLeft: 8,
        paddingRight: 8,
        gap: 4,
        overflowX: 'auto',
        userSelect: 'none',
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={0}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTab(tab.id);
              }
            }}
            onAuxClick={(e) => {
              if (e.button === 1 && tab.closable !== false) {
                e.preventDefault();
                closeTab(tab.id);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 28,
              padding: tab.pinned ? '0 8px' : '0 12px',
              borderRadius: '6px 6px 0 0',
              backgroundColor: isActive
                ? 'var(--sd-color-bg-app, #0f172a)'
                : 'transparent',
              color: isActive
                ? 'var(--sd-color-text, #f8fafc)'
                : 'var(--sd-color-text-muted, #94a3b8)',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              border: isActive ? '1px solid var(--sd-color-border, #334155)' : 'none',
              borderBottom: 'none',
              transition: 'background-color 0.15s ease, color 0.15s ease',
              gap: 6,
            }}
          >
            {tab.pinned && (
              <span style={{ fontSize: 10, opacity: 0.7 }} title="Pinned Tab">
                📌
              </span>
            )}
            <span>{tab.title}</span>

            {tab.closable !== false && !tab.pinned && (
              <button
                aria-label={`Close tab ${tab.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  togglePinTab(tab.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  padding: 2,
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.6,
                }}
              >
                ✕
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
