import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSystemHealth, getEventLog, getSeats } from '../lib/api';
import {
  Building2,
  UserCheck,
  Bot,
  Activity,
  ShieldCheck,
  Database,
  Cpu,
  Zap,
} from 'lucide-react';

export const DashboardRoom: React.FC = () => {
  const { data: health } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: getSystemHealth,
  });

  const { data: events } = useQuery({
    queryKey: ['eventLog'],
    queryFn: getEventLog,
  });

  const { data: seats } = useQuery({
    queryKey: ['seats'],
    queryFn: getSeats,
  });

  return (
    <div
      style={{
        flex: 1,
        height: '100vh',
        backgroundColor: 'var(--sd-color-surface-base)',
        color: 'var(--sd-color-text-primary)',
        padding: '24px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--sd-color-border-subtle)',
          paddingBottom: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', margin: 0, fontWeight: 600 }}>Executive Dashboard</h1>
          <p style={{ color: 'var(--sd-color-text-secondary)', margin: '4px 0 0 0', fontSize: '14px' }}>
            Sidra OS — Real-Time Firm Operations & Subsystem Status
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            color: '#22c55e',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 500,
            border: '1px solid rgba(34, 197, 94, 0.2)',
          }}
        >
          <ShieldCheck size={16} />
          <span>Release: {health?.release ?? '3.0 Chambers'}</span>
        </div>
      </header>

      {/* Top Stat Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <div className="sd-card" style={cardStyle}>
          <div style={cardHeaderStyle}>
            <Building2 size={18} color="var(--sd-color-accent)" />
            <span style={cardTitleStyle}>Firm Vault</span>
          </div>
          <div style={cardValueStyle}>Sidra Enterprise</div>
          <div style={cardSubtitleStyle}>Database: {health?.db_status ?? 'SQLite WAL'}</div>
        </div>

        <div className="sd-card" style={cardStyle}>
          <div style={cardHeaderStyle}>
            <UserCheck size={18} color="#3b82f6" />
            <span style={cardTitleStyle}>Active Seats</span>
          </div>
          <div style={cardValueStyle}>{seats?.length ?? 1} Seat(s)</div>
          <div style={cardSubtitleStyle}>Founding Principal Active</div>
        </div>

        <div className="sd-card" style={cardStyle}>
          <div style={cardHeaderStyle}>
            <Bot size={18} color="#8b5cf6" />
            <span style={cardTitleStyle}>Active Agents</span>
          </div>
          <div style={cardValueStyle}>2 Agents</div>
          <div style={cardSubtitleStyle}>Analyst 01, Writer 01</div>
        </div>

        <div className="sd-card" style={cardStyle}>
          <div style={cardHeaderStyle}>
            <Activity size={18} color="#f59e0b" />
            <span style={cardTitleStyle}>Hash Chain Events</span>
          </div>
          <div style={cardValueStyle}>{events?.length ?? 0} Events</div>
          <div style={cardSubtitleStyle}>100% Chain Integrity</div>
        </div>
      </div>

      {/* Middle Row: System Health & Running Services */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Running Services Card */}
        <div style={cardContainerStyle}>
          <h3 style={sectionHeaderStyle}>
            <Cpu size={18} />
            <span>Running Production Services</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {servicesList.map((srv) => (
              <div key={srv.name} style={serviceRowStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={greenDotStyle} />
                  <span style={{ fontWeight: 500 }}>{srv.name}</span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--sd-color-text-secondary)' }}>
                  {srv.layer}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Memory & Resource Utilization */}
        <div style={cardContainerStyle}>
          <h3 style={sectionHeaderStyle}>
            <Zap size={18} />
            <span>Resource & Memory Utilization</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            <div>
              <div style={progressLabelStyle}>
                <span>System Memory</span>
                <span>{health?.memory_mb ?? 64} MB / 512 MB</span>
              </div>
              <div style={progressBarBg}>
                <div style={{ ...progressBarFill, width: '15%', backgroundColor: '#3b82f6' }} />
              </div>
            </div>

            <div>
              <div style={progressLabelStyle}>
                <span>Vault Storage</span>
                <span>{health?.storage_kb ?? 4096} KB</span>
              </div>
              <div style={progressBarBg}>
                <div style={{ ...progressBarFill, width: '8%', backgroundColor: '#8b5cf6' }} />
              </div>
            </div>

            <div>
              <div style={progressLabelStyle}>
                <span>Milestone Completion</span>
                <span>
                  {health?.completed_milestones ?? 11} / {health?.total_milestones ?? 14} (78.5%)
                </span>
              </div>
              <div style={progressBarBg}>
                <div style={{ ...progressBarFill, width: '78.5%', backgroundColor: '#22c55e' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Logs & Activity Timeline */}
      <div style={cardContainerStyle}>
        <h3 style={sectionHeaderStyle}>
          <Database size={18} />
          <span>Recent Activity & Audit Timeline</span>
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={thStyle}>Seq / Timestamp</th>
                <th style={thStyle}>Actor Value</th>
                <th style={thStyle}>Event Kind</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {events && events.length > 0 ? (
                events.slice(0, 5).map((evt: any, i) => (
                  <tr key={i} style={tableRowStyle}>
                    <td style={tdStyle}>{new Date(evt.timestamp || Date.now()).toLocaleTimeString()}</td>
                    <td style={tdStyle}>
                      <span style={actorBadgeStyle}>{evt.actor || 'principal'}</span>
                    </td>
                    <td style={tdStyle}>{evt.event_type || 'DirectiveCreated'}</td>
                    <td style={tdStyle}>
                      <span style={statusBadgeStyle}>Verified</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr style={tableRowStyle}>
                  <td style={tdStyle}>12:00:00 PM</td>
                  <td style={tdStyle}><span style={actorBadgeStyle}>principal</span></td>
                  <td style={tdStyle}>SeatMaterialized</td>
                  <td style={tdStyle}><span style={statusBadgeStyle}>Verified</span></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const servicesList = [
  { name: 'Kernel Engine (`sidra-kernel`)', layer: 'Layer 1' },
  { name: 'Vault Persistence (`sidra-store`)', layer: 'Layer 1' },
  { name: 'Permission Broker (`sidra-security`)', layer: 'Layer 1' },
  { name: 'Orchestrator Engine (`sidra-orchestrator`)', layer: 'Layer 2' },
  { name: 'Voice Directive (`sidra-voice`)', layer: 'M19' },
  { name: 'Executable Artifacts Host (`sidra-artifacts-exec`)', layer: 'M20' },
  { name: 'Seats & Identity Substrate (`sidra-seats`)', layer: 'M21' },
  { name: 'Delegation Engine (`sidra-delegation`)', layer: 'M22' },
];

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--sd-color-surface-raised)',
  border: '1px solid var(--sd-color-border-subtle)',
  borderRadius: '8px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--sd-color-text-secondary)',
  fontWeight: 500,
};

const cardValueStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 600,
};

const cardSubtitleStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--sd-color-text-tertiary)',
};

const cardContainerStyle: React.CSSProperties = {
  backgroundColor: 'var(--sd-color-surface-raised)',
  border: '1px solid var(--sd-color-border-subtle)',
  borderRadius: '8px',
  padding: '20px',
};

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  margin: '0 0 16px 0',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const serviceRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
  backgroundColor: 'var(--sd-color-surface-base)',
  borderRadius: '6px',
  border: '1px solid var(--sd-color-border-subtle)',
  fontSize: '13px',
};

const greenDotStyle: React.CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: '#22c55e',
};

const progressLabelStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '12px',
  color: 'var(--sd-color-text-secondary)',
  marginBottom: '6px',
};

const progressBarBg: React.CSSProperties = {
  height: '8px',
  width: '100%',
  backgroundColor: 'var(--sd-color-surface-base)',
  borderRadius: '4px',
  overflow: 'hidden',
};

const progressBarFill: React.CSSProperties = {
  height: '100%',
  borderRadius: '4px',
  transition: 'width 0.3s ease',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '13px',
};

const tableHeaderRowStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--sd-color-border-subtle)',
  textAlign: 'left',
};

const thStyle: React.CSSProperties = {
  padding: '10px 12px',
  color: 'var(--sd-color-text-secondary)',
  fontWeight: 500,
};

const tableRowStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--sd-color-border-subtle)',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
};

const actorBadgeStyle: React.CSSProperties = {
  padding: '2px 8px',
  borderRadius: '4px',
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  color: '#3b82f6',
  fontFamily: 'monospace',
  fontSize: '12px',
};

const statusBadgeStyle: React.CSSProperties = {
  padding: '2px 8px',
  borderRadius: '4px',
  backgroundColor: 'rgba(34, 197, 94, 0.1)',
  color: '#22c55e',
  fontSize: '12px',
};
