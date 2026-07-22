import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPlugins } from '../lib/api';

export const Settings: React.FC = () => {
  const { data: plugins } = useQuery<string[]>({
    queryKey: ['pluginsList'],
    queryFn: getPlugins,
  });

  return (
    <div style={{ flex: 1, padding: '24px', backgroundColor: 'var(--sd-color-surface-base)', color: 'var(--sd-color-text-primary)' }}>
      <h1>Settings</h1>
      <p style={{ color: 'var(--sd-color-text-secondary)' }}>Security Fences, Model Router Providers, & WASM Plugin Manager</p>

      <div style={{ backgroundColor: 'var(--sd-color-surface-raised)', padding: '16px', borderRadius: '8px', border: '1px solid var(--sd-color-border-subtle)', marginBottom: '16px' }}>
        <h3>Security Fences (ADR-0006)</h3>
        <p style={{ fontSize: '13px', color: 'var(--sd-color-text-secondary)' }}>Allowed Path Scopes: /workspace/app</p>
        <p style={{ fontSize: '13px', color: 'var(--sd-color-text-secondary)' }}>Network Egress Allowlist: api.sidra.os, github.com</p>
        <p style={{ fontSize: '13px', color: 'var(--sd-color-text-secondary)' }}>Spend Ceiling: $100.00 / month</p>
      </div>

      <div style={{ backgroundColor: 'var(--sd-color-surface-raised)', padding: '16px', borderRadius: '8px', border: '1px solid var(--sd-color-border-subtle)' }}>
        <h3>Installed WASM Plugins (M7)</h3>
        {Array.isArray(plugins) && plugins.map((p: string, i: number) => (
          <div key={i} style={{ fontSize: '13px', color: 'var(--sd-color-text-primary)' }}>
            ● {p}
          </div>
        ))}
      </div>
    </div>
  );
};
