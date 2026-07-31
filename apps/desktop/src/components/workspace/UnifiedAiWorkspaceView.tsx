import { FC, useState } from 'react';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Button, Icon, KPICard } from '@sidra/ui';

export interface WorkspaceItem {
  id: string;
  name: string;
  type: 'Organization' | 'Department' | 'Project';
  activeMissionsCount: number;
  recentActivity: string;
  isPinned: boolean;
}

export const UnifiedAiWorkspaceView: FC = () => {
  const [activeWorkspace, setActiveWorkspace] = useState<string>('org-main');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const workspaces: WorkspaceItem[] = [
    { id: 'org-main', name: 'THEKY Main Enterprise Org', type: 'Organization', activeMissionsCount: 14, recentActivity: 'Executive Board Approval', isPinned: true },
    { id: 'dept-game-studio', name: 'AAA Game Studio Workspace', type: 'Department', activeMissionsCount: 8, recentActivity: 'Gold Master Candidate Pass', isPinned: true },
    { id: 'dept-finance', name: 'Finance & Treasury Workspace', type: 'Department', activeMissionsCount: 5, recentActivity: 'Q3 Financial Ledger Audit', isPinned: false },
    { id: 'proj-cyber-sidra', name: 'Project CyberSidra RPG', type: 'Project', activeMissionsCount: 3, recentActivity: 'Vulkan Shader Pre-compilation', isPinned: true },
  ];

  const currentWs = workspaces.find((w) => w.id === activeWorkspace) || workspaces[0];

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      {/* Header Banner */}
      <Box
        padding="24px"
        bg="linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)"
        borderRadius="8px"
        border="1px solid rgba(99, 102, 241, 0.4)"
      >
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Heading level={2}>THEKY Unified AI Workspace</Heading>
              <Text size="xs" color="muted">Cross-Device Platform Architecture (Desktop • Web • Mobile Ready)</Text>
            </div>
            <StatusBadge status="success">ACTIVE WORKSPACE</StatusBadge>
          </div>
          <Text color="secondary">
            Centralized hub for cross-organization context, multi-workspace switching, global search, activity timelines, and unified AI conversations.
          </Text>
        </Stack>
      </Box>

      {/* Global Search & Command Palette Trigger */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="Search workspaces, missions, files, projects, or knowledge graph (Press Ctrl+K for Command Palette)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 6,
              background: 'var(--sd-color-surface-raised, #12151e)',
              border: '1px solid var(--sd-color-border-subtle, #242938)',
              color: '#ffffff',
              fontSize: 13,
            }}
          />
        </div>
        <Button variant="secondary" size="md">
          Command Palette (Ctrl+K)
        </Button>
      </div>

      {/* Workspace Switcher & Cards */}
      <Heading level={3}>Workspaces & Organizations</Heading>
      <Grid columns={4} gap="16px">
        {workspaces.map((ws) => {
          const isSelected = ws.id === activeWorkspace;
          return (
            <Box
              key={ws.id}
              padding="16px"
              bg={isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--sd-color-surface-raised, #12151e)'}
              borderRadius="8px"
              border={isSelected ? '1px solid var(--sd-color-accent, #6366f1)' : '1px solid var(--sd-color-border-subtle, #242938)'}
              onClick={() => setActiveWorkspace(ws.id)}
              style={{ cursor: 'pointer' }}
            >
              <Stack gap="8px">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text size="xs" color="muted">{ws.type}</Text>
                  {ws.isPinned && <StatusBadge status="active">PINNED</StatusBadge>}
                </div>
                <Heading level={4}>{ws.name}</Heading>
                <Text size="xs" color="secondary">
                  Active Missions: <strong>{ws.activeMissionsCount}</strong>
                </Text>
                <Text size="xs" color="muted">
                  Recent: {ws.recentActivity}
                </Text>
              </Stack>
            </Box>
          );
        })}
      </Grid>

      {/* Active Workspace Focus Telemetry */}
      <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
        <Stack gap="12px">
          <Heading level={4}>Current Active Focus: {currentWs.name}</Heading>
          <Grid columns={3} gap="12px">
            <KPICard title="Active Missions Queue" value={`${currentWs.activeMissionsCount} Missions`} change="Executing via Mission Engine" changeType="positive" icon={<Icon name="Zap" />} />
            <KPICard title="Connected Team Members" value="28 AI Agents + 12 Humans" change="Hybrid Workforce Active" changeType="positive" icon={<Icon name="Users" />} />
            <KPICard title="Security Context" value="Tenant Isolated" change="Vault SHA-256 Verified" changeType="positive" icon={<Icon name="Shield" />} />
          </Grid>
        </Stack>
      </Box>
    </Stack>
  );
};
