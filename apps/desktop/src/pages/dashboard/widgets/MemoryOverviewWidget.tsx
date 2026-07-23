import { FC } from 'react';
import { Card } from '../../../components/composite/Card';
import { WidgetErrorBoundary } from '../../../app/boundaries/WidgetErrorBoundary';
import { navigate } from '../../../routes/navigate';
import { BookOpen, Search } from 'lucide-react';

export const MemoryOverviewWidget: FC = () => {
  return (
    <WidgetErrorBoundary widgetName="Memory Overview">
      <Card padding="var(--sd-space-4)">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sd-space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-2)' }}>
            <BookOpen size={18} style={{ color: 'var(--sd-color-primary)' }} />
            <h4 style={{ margin: 0, fontSize: 'var(--sd-font-size-md)', fontWeight: 'var(--sd-font-weight-semibold)' }}>
              Memory & Hybrid Retrieval
            </h4>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sd-space-3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sd-space-2)' }}>
            <div style={{ padding: 'var(--sd-space-2)', borderRadius: 'var(--sd-radius-md)', backgroundColor: 'var(--sd-color-bg-inset)' }}>
              <div style={{ fontSize: 'var(--sd-font-size-xs)', color: 'var(--sd-color-text-muted)' }}>Documents</div>
              <div style={{ fontSize: 'var(--sd-font-size-lg)', fontWeight: 'var(--sd-font-weight-bold)' }}>28 Ingested</div>
            </div>
            <div style={{ padding: 'var(--sd-space-2)', borderRadius: 'var(--sd-radius-md)', backgroundColor: 'var(--sd-color-bg-inset)' }}>
              <div style={{ fontSize: 'var(--sd-font-size-xs)', color: 'var(--sd-color-text-muted)' }}>Memory Chunks</div>
              <div style={{ fontSize: 'var(--sd-font-size-lg)', fontWeight: 'var(--sd-font-weight-bold)' }}>1,420 Vectors</div>
            </div>
          </div>

          <button
            onClick={() => navigate.knowledge()}
            style={{
              width: '100%',
              padding: 'var(--sd-space-2)',
              borderRadius: 'var(--sd-radius-md)',
              backgroundColor: 'var(--sd-color-bg-inset)',
              border: '1px solid var(--sd-color-border)',
              color: 'var(--sd-color-text-muted)',
              fontSize: 'var(--sd-font-size-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--sd-space-2)',
              cursor: 'pointer',
            }}
          >
            <Search size={14} /> Open Knowledge Engine
          </button>
        </div>
      </Card>
    </WidgetErrorBoundary>
  );
};
