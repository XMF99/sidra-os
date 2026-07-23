import { FC } from 'react';
import { Card } from '../../../components/composite/Card';
import { Button } from '../../../components/primitives/Button';
import { PermissionGate } from '../../../components/domain/PermissionGate';
import { WidgetErrorBoundary } from '../../../app/boundaries/WidgetErrorBoundary';
import { navigate } from '../../../routes/navigate';
import { Plus, Search, BookOpen, Settings, Command, Zap } from 'lucide-react';

export const QuickActionsWidget: FC = () => {
  return (
    <WidgetErrorBoundary widgetName="Quick Actions">
      <Card padding="var(--sd-space-4)">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-2)', marginBottom: 'var(--sd-space-3)' }}>
          <Zap size={18} style={{ color: 'var(--sd-status-warning)' }} />
          <h4 style={{ margin: 0, fontSize: 'var(--sd-font-size-md)', fontWeight: 'var(--sd-font-weight-semibold)' }}>
            Quick Actions
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--sd-space-2)' }}>
          <PermissionGate capability="mission.create">
            {(perm) => (
              <Button
                variant="primary"
                size="sm"
                permission={perm}
                onClick={() => navigate.missionNew()}
                style={{ width: '100%' }}
              >
                <Plus size={14} /> New Mission
              </Button>
            )}
          </PermissionGate>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate.knowledge()}
            style={{ width: '100%' }}
          >
            <BookOpen size={14} /> Knowledge
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('sd:open-search'));
            }}
            style={{ width: '100%' }}
          >
            <Search size={14} /> Search
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('sd:open-palette'));
            }}
            style={{ width: '100%' }}
          >
            <Command size={14} /> Palette
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate.settings()}
            style={{ width: '100%' }}
          >
            <Settings size={14} /> Settings
          </Button>
        </div>
      </Card>
    </WidgetErrorBoundary>
  );
};
