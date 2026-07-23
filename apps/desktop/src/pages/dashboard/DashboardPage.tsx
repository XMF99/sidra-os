import { FC } from 'react';
import { SystemHealthWidget } from './widgets/SystemHealthWidget';
import { DailySummaryWidget } from './widgets/DailySummaryWidget';
import { RunningMissionsWidget } from './widgets/RunningMissionsWidget';
import { RunningAgentsWidget } from './widgets/RunningAgentsWidget';
import { NotificationsWidget } from './widgets/NotificationsWidget';
import { MissionOverviewWidget } from './widgets/MissionOverviewWidget';
import { PerformanceWidget } from './widgets/PerformanceWidget';
import { QuickActionsWidget } from './widgets/QuickActionsWidget';
import { RecentActivityWidget } from './widgets/RecentActivityWidget';
import { PinnedProjectsWidget } from './widgets/PinnedProjectsWidget';
import { RecentDocumentsWidget } from './widgets/RecentDocumentsWidget';
import { MemoryOverviewWidget } from './widgets/MemoryOverviewWidget';

export const DashboardPage: FC = () => {
  return (
    <div
      style={{
        padding: 'var(--sd-space-6)',
        maxWidth: 'var(--sd-content-max)',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sd-space-6)',
        boxSizing: 'border-box',
      }}
    >
      <div>
        <h2 style={{ fontSize: 'var(--sd-font-size-2xl)', fontWeight: 'var(--sd-font-weight-bold)', margin: 0 }}>
          Operating Picture
        </h2>
        <p style={{ color: 'var(--sd-color-text-muted)', fontSize: 'var(--sd-font-size-sm)', margin: 'var(--sd-space-1) 0 0 0' }}>
          At-a-glance health, active execution, needs-action approvals, and platform event feed.
        </p>
      </div>

      {/* Row 1: System Health & Daily Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--sd-space-4)' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <SystemHealthWidget />
        </div>
        <div>
          <DailySummaryWidget />
        </div>
      </div>

      {/* Row 2: Live Status & Needs Action */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sd-space-4)' }}>
        <RunningMissionsWidget />
        <RunningAgentsWidget />
        <NotificationsWidget />
      </div>

      {/* Row 3: Portfolio & Performance & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sd-space-4)' }}>
        <MissionOverviewWidget />
        <PerformanceWidget />
        <QuickActionsWidget />
      </div>

      {/* Row 4: Recent Activity Feed */}
      <div>
        <RecentActivityWidget />
      </div>

      {/* Row 5: Projects & Memory */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sd-space-4)' }}>
        <PinnedProjectsWidget />
        <RecentDocumentsWidget />
        <MemoryOverviewWidget />
      </div>
    </div>
  );
};
