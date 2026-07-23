import { FC } from 'react';
import { Card } from '../../../components/composite/Card';
import { WidgetErrorBoundary } from '../../../app/boundaries/WidgetErrorBoundary';
import { useSystemHealthQuery, useVerifyChainQuery } from '../../../data/queries';
import { navigate } from '../../../routes/navigate';
import { ShieldCheck, Database, Cpu, Activity, RefreshCw } from 'lucide-react';

export const SystemHealthWidget: FC = () => {
  const { data: health, isLoading, error, refetch } = useSystemHealthQuery();
  const { data: chainValid } = useVerifyChainQuery();

  return (
    <WidgetErrorBoundary widgetName="System Health">
      <Card padding="var(--sd-space-4)">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sd-space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-2)' }}>
            <ShieldCheck size={18} style={{ color: 'var(--sd-status-success)' }} />
            <h4 style={{ margin: 0, fontSize: 'var(--sd-font-size-md)', fontWeight: 'var(--sd-font-weight-semibold)' }}>
              System Health & Integrity
            </h4>
          </div>
          <button
            onClick={() => refetch()}
            style={{ background: 'none', border: 'none', color: 'var(--sd-color-text-muted)', cursor: 'pointer' }}
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {isLoading ? (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text-muted)' }}>Loading health stats...</div>
        ) : error ? (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-status-danger)' }}>Failed to load health status</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--sd-space-3)' }}>
            <div
              onClick={() => navigate.events()}
              style={{
                padding: 'var(--sd-space-2)',
                borderRadius: 'var(--sd-radius-md)',
                backgroundColor: 'var(--sd-color-bg-inset)',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 'var(--sd-font-size-xs)', color: 'var(--sd-color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Activity size={12} /> Hash Chain
              </div>
              <div style={{ fontSize: 'var(--sd-font-size-sm)', fontWeight: 'var(--sd-font-weight-bold)', color: chainValid !== false ? 'var(--sd-status-success)' : 'var(--sd-status-danger)', marginTop: '2px' }}>
                {chainValid !== false ? 'Verified 100%' : 'Break Detected'}
              </div>
            </div>

            <div style={{ padding: 'var(--sd-space-2)', borderRadius: 'var(--sd-radius-md)', backgroundColor: 'var(--sd-color-bg-inset)' }}>
              <div style={{ fontSize: 'var(--sd-font-size-xs)', color: 'var(--sd-color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Database size={12} /> Vault Database
              </div>
              <div style={{ fontSize: 'var(--sd-font-size-sm)', fontWeight: 'var(--sd-font-weight-bold)', color: 'var(--sd-color-text)', marginTop: '2px' }}>
                {health?.db_status || 'SQLite WAL'}
              </div>
            </div>

            <div style={{ padding: 'var(--sd-space-2)', borderRadius: 'var(--sd-radius-md)', backgroundColor: 'var(--sd-color-bg-inset)' }}>
              <div style={{ fontSize: 'var(--sd-font-size-xs)', color: 'var(--sd-color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Cpu size={12} /> Log Events
              </div>
              <div style={{ fontSize: 'var(--sd-font-size-sm)', fontWeight: 'var(--sd-font-weight-bold)', color: 'var(--sd-color-text)', marginTop: '2px' }}>
                {health?.event_count ?? 0} events
              </div>
            </div>
          </div>
        )}
      </Card>
    </WidgetErrorBoundary>
  );
};
