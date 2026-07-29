import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Terminal, Shield, Plug, Cpu } from 'lucide-react';
import { getPlugins } from '../lib/api';
import { useShellStore } from '../state/useShellStore';

export const Settings: React.FC = () => {
  const { developerMode, toggleDeveloperMode } = useShellStore();

  const { data: plugins } = useQuery<string[]>({
    queryKey: ['pluginsList'],
    queryFn: getPlugins,
  });

  return (
    <div
      style={{
        flex: 1,
        padding: '32px',
        maxWidth: '1000px',
        margin: '0 auto',
        backgroundColor: 'var(--sd-color-bg-app)',
        color: 'var(--sd-color-text, #f8fafc)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0 }}>Application Settings</h1>
        <p style={{ color: 'var(--sd-color-text-muted, #94a3b8)', fontSize: '14px', margin: '4px 0 0 0' }}>
          Configure product preferences, developer options, and security parameters.
        </p>
      </div>

      {/* Developer Mode Toggle Section */}
      <div
        style={{
          backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
          padding: '24px',
          borderRadius: '16px',
          border: developerMode ? '1px solid var(--sd-color-primary, #6366f1)' : '1px solid var(--sd-color-border, #334155)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div
            style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: developerMode ? 'rgba(99, 102, 241, 0.2)' : 'var(--sd-color-bg-inset, #0f172a)',
              color: developerMode ? 'var(--sd-color-primary, #6366f1)' : '#94a3b8',
            }}
          >
            <Terminal size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Developer Mode</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--sd-color-text-muted, #94a3b8)', lineHeight: 1.4 }}>
              Unlocks internal architecture inspection tools, kernel diagnostics, event bus telemetry, and engineering consoles.
            </p>
          </div>
        </div>

        <button
          onClick={toggleDeveloperMode}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: developerMode ? 'var(--sd-color-primary, #6366f1)' : 'var(--sd-color-bg-inset, #0f172a)',
            color: developerMode ? '#ffffff' : 'var(--sd-color-text, #f8fafc)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: developerMode ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {developerMode ? '✓ Developer Mode Enabled' : 'Enable Developer Mode'}
        </button>
      </div>

      {/* Security & Governance */}
      <div
        style={{
          backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid var(--sd-color-border, #334155)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Shield size={20} style={{ color: '#10b981' }} />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Security & Guardrails</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'var(--sd-color-bg-inset, #0f172a)' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Path Scopes</div>
            <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>/workspace/app</div>
          </div>

          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'var(--sd-color-bg-inset, #0f172a)' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Egress Allowlist</div>
            <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>api.sidra.os, github.com</div>
          </div>

          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'var(--sd-color-bg-inset, #0f172a)' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Monthly Spend Limit</div>
            <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>$100.00 / month</div>
          </div>
        </div>

        {developerMode && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--sd-color-border, #334155)', fontSize: '12px', color: '#8b5cf6' }}>
            [Developer Mode Metadata]: Enforcement governed by Kernel Policy Engine (ADR-0006).
          </div>
        )}
      </div>

      {/* Plugins */}
      <div
        style={{
          backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid var(--sd-color-border, #334155)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Plug size={20} style={{ color: '#3b82f6' }} />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Active Extensions</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Array.isArray(plugins) && plugins.length > 0 ? (
            plugins.map((p: string, i: number) => (
              <div
                key={i}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Cpu size={14} style={{ color: '#3b82f6' }} /> {p}
              </div>
            ))
          ) : (
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>Core platform plugins active.</div>
          )}
        </div>
      </div>
    </div>
  );
};
