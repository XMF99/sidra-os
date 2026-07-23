import { FC } from 'react';
import { Card } from '../../../components/composite/Card';
import { WidgetErrorBoundary } from '../../../app/boundaries/WidgetErrorBoundary';
import { useDocumentsQuery } from '../../../data/queries';
import { navigate } from '../../../routes/navigate';
import { FileText, ArrowRight } from 'lucide-react';

export const RecentDocumentsWidget: FC = () => {
  const { data: docs, isLoading, error } = useDocumentsQuery();

  return (
    <WidgetErrorBoundary widgetName="Recent Documents">
      <Card padding="var(--sd-space-4)">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sd-space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-2)' }}>
            <FileText size={18} style={{ color: 'var(--sd-color-primary)' }} />
            <h4 style={{ margin: 0, fontSize: 'var(--sd-font-size-md)', fontWeight: 'var(--sd-font-weight-semibold)' }}>
              Recent Knowledge Documents
            </h4>
          </div>
          <button
            onClick={() => navigate.knowledge()}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--sd-color-primary)',
              cursor: 'pointer',
              fontSize: 'var(--sd-font-size-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            Search Memory <ArrowRight size={12} />
          </button>
        </div>

        {isLoading ? (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text-muted)' }}>Loading documents...</div>
        ) : error ? (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-status-danger)' }}>Error reading memory</div>
        ) : !docs || docs.length === 0 ? (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text-muted)' }}>No recent documents ingested.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sd-space-2)' }}>
            {docs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => navigate.documentDetail(doc.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--sd-space-2) var(--sd-space-3)',
                  borderRadius: 'var(--sd-radius-md)',
                  backgroundColor: 'var(--sd-color-bg-inset)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-2)' }}>
                  <FileText size={14} style={{ color: 'var(--sd-color-text-muted)' }} />
                  <span style={{ fontSize: 'var(--sd-font-size-sm)', fontWeight: 'var(--sd-font-weight-medium)', color: 'var(--sd-color-text)' }}>
                    {doc.title}
                  </span>
                </div>
                <span style={{ fontSize: 'var(--sd-font-size-xs)', color: 'var(--sd-color-text-subtle)' }}>
                  {doc.source}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </WidgetErrorBoundary>
  );
};
