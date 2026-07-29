import React, { useState } from 'react';
import { Bot, Activity, Sparkles, ChevronRight } from 'lucide-react';
import { useShellStore } from '../../state/useShellStore';

export const RightActivityPanel: React.FC = () => {
  const { rightPanelOpen, toggleRightPanel } = useShellStore();
  const [activeTab, setActiveTab] = useState<'feed' | 'agents' | 'notifications'>('feed');

  if (!rightPanelOpen) return null;

  const activityFeed = [
    {
      id: 'act-1',
      title: 'Physics Collision Matrix Completed',
      agent: 'Lead Architect Agent',
      time: '5 mins ago',
      type: 'success',
    },
    {
      id: 'act-2',
      title: 'Verified Security Identity Token Handler',
      agent: 'QA Certification Bot',
      time: '24 mins ago',
      type: 'info',
    },
    {
      id: 'act-3',
      title: 'Rendered Water Shader Surface Mesh',
      agent: 'Game Studio Assistant',
      time: '1 hour ago',
      type: 'success',
    },
  ];

  const runningAgents = [
    { id: 'ag-1', name: 'Lead Architect Agent', role: 'System Architecture', status: 'Executing Mission' },
    { id: 'ag-2', name: 'Game Studio Assistant', role: 'Graphics & Physics', status: 'Rendering Shaders' },
    { id: 'ag-3', name: 'Full-Stack Dev Agent', role: 'Backend Services', status: 'Standby' },
    { id: 'ag-4', name: 'QA Certification Bot', role: 'Test Verification', status: 'Active Watch' },
  ];

  const notifications = [
    { id: 'n-1', title: 'Mission #m-101 requires principal review', time: '10m ago' },
    { id: 'n-2', title: 'New project template "GORA" provisioned', time: '1h ago' },
    { id: 'n-3', title: 'Connector GitHub Egress authorized', time: '2h ago' },
  ];

  return (
    <aside
      aria-label="Executive Activity Panel"
      style={{
        width: '320px',
        height: '100%',
        backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
        borderLeft: '1px solid var(--sd-color-border, #334155)',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--sd-color-border, #334155)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} style={{ color: 'var(--sd-color-primary, #6366f1)' }} />
          <span style={{ fontWeight: 600, fontSize: '14px' }}>Executive Panel</span>
        </div>
        <button
          onClick={toggleRightPanel}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Tabs Switcher */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--sd-color-border, #334155)',
          backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
        }}
      >
        <button
          onClick={() => setActiveTab('feed')}
          style={{
            flex: 1,
            padding: '10px 0',
            fontSize: '12px',
            fontWeight: 600,
            border: 'none',
            borderBottom: activeTab === 'feed' ? '2px solid var(--sd-color-primary, #6366f1)' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'feed' ? 'var(--sd-color-primary, #6366f1)' : '#94a3b8',
            cursor: 'pointer',
          }}
        >
          Feed
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          style={{
            flex: 1,
            padding: '10px 0',
            fontSize: '12px',
            fontWeight: 600,
            border: 'none',
            borderBottom: activeTab === 'agents' ? '2px solid var(--sd-color-primary, #6366f1)' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'agents' ? 'var(--sd-color-primary, #6366f1)' : '#94a3b8',
            cursor: 'pointer',
          }}
        >
          AI Team ({runningAgents.length})
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          style={{
            flex: 1,
            padding: '10px 0',
            fontSize: '12px',
            fontWeight: 600,
            border: 'none',
            borderBottom: activeTab === 'notifications' ? '2px solid var(--sd-color-primary, #6366f1)' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'notifications' ? 'var(--sd-color-primary, #6366f1)' : '#94a3b8',
            cursor: 'pointer',
          }}
        >
          Alerts ({notifications.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* Activity Feed */}
        {activeTab === 'feed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {activityFeed.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                  border: '1px solid var(--sd-color-border, #334155)',
                  fontSize: '12px',
                }}
              >
                <div style={{ fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} style={{ color: '#8b5cf6' }} /> {item.title}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  {item.agent} • {item.time}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Agents Roster */}
        {activeTab === 'agents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {runningAgents.map((ag) => (
              <div
                key={ag.id}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                  border: '1px solid var(--sd-color-border, #334155)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bot size={14} style={{ color: '#6366f1' }} /> {ag.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{ag.role}</div>
                </div>

                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                  }}
                >
                  {ag.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                  borderLeft: '3px solid var(--sd-color-primary, #6366f1)',
                  fontSize: '12px',
                }}
              >
                <div style={{ fontWeight: 500 }}>{n.title}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{n.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
