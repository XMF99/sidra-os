import { FC } from 'react';
import { Card } from '../../../components/composite/Card';
import { Button } from '../../../components/primitives/Button';
import { WidgetErrorBoundary } from '../../../app/boundaries/WidgetErrorBoundary';
import { useNotificationsQuery } from '../../../data/queries';
import { useNotifications } from '../../../app/providers/NotificationProvider';
import { Bell, CheckCircle } from 'lucide-react';

export const NotificationsWidget: FC = () => {
  const { data: notifications, isLoading, error } = useNotificationsQuery();
  const { setCenterOpen } = useNotifications();
  const actionItems = (notifications || []).filter((n) => n.needsAction);

  return (
    <WidgetErrorBoundary widgetName="Notifications">
      <Card padding="var(--sd-space-4)">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sd-space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-2)' }}>
            <Bell size={18} style={{ color: 'var(--sd-status-info)' }} />
            <h4 style={{ margin: 0, fontSize: 'var(--sd-font-size-md)', fontWeight: 'var(--sd-font-weight-semibold)' }}>
              Notifications ({actionItems.length} Needs Action)
            </h4>
          </div>
          <button
            onClick={() => setCenterOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--sd-color-primary)',
              cursor: 'pointer',
              fontSize: 'var(--sd-font-size-xs)',
            }}
          >
            See All
          </button>
        </div>

        {isLoading ? (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text-muted)' }}>Loading notifications...</div>
        ) : error ? (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-status-danger)' }}>Error loading notifications</div>
        ) : actionItems.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-2)', fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-status-success)' }}>
            <CheckCircle size={16} />
            <span>You're all caught up! Zero items requiring action.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sd-space-2)' }}>
            {actionItems.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: 'var(--sd-space-3)',
                  borderRadius: 'var(--sd-radius-md)',
                  backgroundColor: 'var(--sd-status-warning-bg)',
                  border: '1px solid var(--sd-status-warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--sd-space-3)',
                }}
              >
                <div>
                  <div style={{ fontSize: 'var(--sd-font-size-sm)', fontWeight: 'var(--sd-font-weight-semibold)', color: 'var(--sd-color-text)' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 'var(--sd-font-size-xs)', color: 'var(--sd-color-text-muted)' }}>
                    {item.body}
                  </div>
                </div>
                {item.targetRoute && (
                  <Button variant="primary" size="sm" onClick={() => (window.location.hash = item.targetRoute!)}>
                    Review
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </WidgetErrorBoundary>
  );
};
