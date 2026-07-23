import { FC } from 'react';
import { Button } from '../../components/primitives/Button';
import { IconButton } from '../../components/primitives/IconButton';
import { Input } from '../../components/primitives/Input';
import { Badge } from '../../components/primitives/Badge';
import { Chip } from '../../components/primitives/Chip';
import { Avatar } from '../../components/primitives/Avatar';
import { Skeleton } from '../../components/primitives/Skeleton';
import { Spinner } from '../../components/primitives/Spinner';
import { Kbd } from '../../components/primitives/Kbd';
import { Card } from '../../components/composite/Card';
import { MetricWidget } from '../../components/composite/MetricWidget';
import { StatusBadge } from '../../components/composite/StatusBadge';
import { Tabs } from '../../components/composite/Tabs';
import { EmptyState } from '../../components/composite/EmptyState';
import { ErrorState } from '../../components/composite/ErrorState';
import { MissionCard } from '../../components/domain/MissionCard';
import { AgentCard } from '../../components/domain/AgentCard';
import { EventRow } from '../../components/domain/EventRow';
import { Search } from 'lucide-react';

export const ComponentGallery: FC = () => {
  return (
    <div style={{ padding: 'var(--sd-space-6)', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--sd-space-6)' }}>
      <div>
        <h2 style={{ fontSize: 'var(--sd-font-size-2xl)', fontWeight: 'var(--sd-font-weight-bold)', margin: 0 }}>
          Component Gallery (Dev-Only)
        </h2>
        <p style={{ color: 'var(--sd-color-text-muted)', fontSize: 'var(--sd-font-size-sm)', margin: 'var(--sd-space-1) 0 0 0' }}>
          Interactive presentational catalog verifying all primitives, composite, domain cards, and theme tokens (`07-component-library.md`).
        </p>
      </div>

      {/* 1. Primitives Section */}
      <Card title="Primitives" padding="var(--sd-space-6)">
        <h3 style={{ margin: '0 0 var(--sd-space-4) 0', fontSize: 'var(--sd-font-size-lg)' }}>1. Primitives</h3>
        
        {/* Buttons */}
        <div style={{ marginBottom: 'var(--sd-space-4)' }}>
          <h4 style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text-muted)' }}>Button Variants & States</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sd-space-3)', marginTop: 'var(--sd-space-2)' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="link">Link</Button>
            <Button variant="primary" loading>Loading</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="primary" permission="disabled">Disabled (SoD)</Button>
          </div>
        </div>

        {/* IconButtons & Kbd */}
        <div style={{ marginBottom: 'var(--sd-space-4)' }}>
          <h4 style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text-muted)' }}>IconButtons & Keyboard Hints</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-3)', marginTop: 'var(--sd-space-2)' }}>
            <IconButton icon={<Search size={16} />} aria-label="Search" variant="secondary" />
            <IconButton icon={<Search size={16} />} aria-label="Search" variant="ghost" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Kbd>⌘</Kbd><Kbd>K</Kbd>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Kbd>⌘</Kbd><Kbd>/</Kbd>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div style={{ marginBottom: 'var(--sd-space-4)', maxWidth: '320px' }}>
          <h4 style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text-muted)' }}>Input Fields</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sd-space-3)', marginTop: 'var(--sd-space-2)' }}>
            <Input label="Standard Input" placeholder="Type mission intent..." hint="Enter objective" />
            <Input label="Invalid Input" placeholder="Error field" invalid hint="This field is required" />
          </div>
        </div>

        {/* Badges & Chips */}
        <div style={{ marginBottom: 'var(--sd-space-4)' }}>
          <h4 style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text-muted)' }}>Badges & Chips</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sd-space-2)', marginTop: 'var(--sd-space-2)' }}>
            <Badge tone="success">Success</Badge>
            <Badge tone="warning">Warning</Badge>
            <Badge tone="danger">Danger</Badge>
            <Badge tone="info">Info</Badge>
            <Badge tone="neutral">Neutral</Badge>
            <Chip label="Filter: Running" selected onRemove={() => {}} />
            <Chip label="Dept: Security" />
          </div>
        </div>

        {/* Avatars, Skeletons, Spinners */}
        <div>
          <h4 style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text-muted)' }}>Avatars & Loaders</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-4)', marginTop: 'var(--sd-space-2)' }}>
            <Avatar name="Principal Seat" status="active" size="lg" />
            <Avatar name="Security Officer" status="idle" size="md" />
            <Avatar name="Audit Bot" status="offline" size="sm" />
            <Spinner size="md" />
            <div style={{ width: '120px' }}>
              <Skeleton width="100%" height="16px" />
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Composite Section */}
      <Card padding="var(--sd-space-6)">
        <h3 style={{ margin: '0 0 var(--sd-space-4) 0', fontSize: 'var(--sd-font-size-lg)' }}>2. Composite Components</h3>
        
        {/* Metric Widgets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sd-space-4)', marginBottom: 'var(--sd-space-6)' }}>
          <MetricWidget label="Running Missions" value={4} delta="+2 today" trend="up" />
          <MetricWidget label="Active Agents" value={12} delta="100% capacity" trend="neutral" />
          <MetricWidget label="Daily Spend" value="$42.50" delta="Under budget" trend="up" />
          <MetricWidget label="Memory Browse" state="degraded" />
        </div>

        {/* Tabs & StatusBadges */}
        <div style={{ marginBottom: 'var(--sd-space-6)' }}>
          <h4 style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text-muted)', marginBottom: 'var(--sd-space-2)' }}>
            Tab Bar & Status Badges
          </h4>
          <Tabs
            tabs={[
              { id: 'overview', label: 'Overview' },
              { id: 'timeline', label: 'Timeline', badge: 14 },
              { id: 'progress', label: 'Progress' },
              { id: 'replay', label: 'Replay' },
            ]}
            activeTab="overview"
            onChange={() => {}}
          />
          <div style={{ display: 'flex', gap: 'var(--sd-space-2)' }}>
            <StatusBadge status="running" />
            <StatusBadge status="awaiting_approval" />
            <StatusBadge status="blocked" />
            <StatusBadge status="completed" />
            <StatusBadge status="failed" />
          </div>
        </div>

        {/* 5-State Contract: Empty & Error */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sd-space-4)' }}>
          <EmptyState title="No Missions Found" hint="Create your first mission using the wizard or Quick Actions." />
          <ErrorState error="Broker refused permission for self-approval (ADR-0060)." correlationId="corr_98f12a3e7b" />
        </div>
      </Card>

      {/* 3. Domain Cards Section */}
      <Card padding="var(--sd-space-6)">
        <h3 style={{ margin: '0 0 var(--sd-space-4) 0', fontSize: 'var(--sd-font-size-lg)' }}>3. Domain Entities</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sd-space-4)' }}>
          <MissionCard
            mission={{
              id: 'M-101',
              title: 'Harden Egress Connectors',
              department: 'Security',
              status: 'running',
              progressPercent: 75,
            }}
          />
          <AgentCard
            agent={{
              id: 'A-01',
              name: 'Auditor Agent Alpha',
              role: 'Compliance Reviewer',
              department: 'Self-Review',
              status: 'active',
            }}
          />
        </div>
        <div style={{ marginTop: 'var(--sd-space-4)' }}>
          <EventRow
            event={{
              id: 'EV-99',
              kind: 'mission.created',
              correlationId: 'c8812f9b00214a119',
              timestamp: '2026-07-23T12:00:00Z',
              summary: 'Mission M-101 created by Principal seat',
            }}
          />
        </div>
      </Card>
    </div>
  );
};
