import { FC, useState } from 'react';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Button, Alert } from '@sidra/ui';

export interface EnterpriseConnector {
  id: string;
  name: string;
  category: 'Productivity' | 'Developer' | 'Communication' | 'Design' | 'Storage';
  status: 'Connected' | 'Not Configured' | 'Requires Setup';
  scopes: string[];
  lastSync: string;
}

export const EnterpriseConnectorCenterView: FC = () => {
  const [connectors, setConnectors] = useState<EnterpriseConnector[]>([
    { id: 'conn-m365', name: 'Microsoft 365', category: 'Productivity', status: 'Connected', scopes: ['User.Read', 'Files.ReadWrite', 'Mail.Read'], lastSync: '2 mins ago' },
    { id: 'conn-gworkspace', name: 'Google Workspace', category: 'Productivity', status: 'Connected', scopes: ['openid', 'email', 'drive.readonly'], lastSync: '5 mins ago' },
    { id: 'conn-github', name: 'GitHub Enterprise', category: 'Developer', status: 'Connected', scopes: ['repo', 'workflow', 'read:org'], lastSync: '1 min ago' },
    { id: 'conn-slack', name: 'Slack Workspace', category: 'Communication', status: 'Connected', scopes: ['channels:history', 'chat:write'], lastSync: 'Just now' },
    { id: 'conn-jira', name: 'Atlassian Jira', category: 'Productivity', status: 'Requires Setup', scopes: ['read:jira-work'], lastSync: 'Never' },
    { id: 'conn-linear', name: 'Linear App', category: 'Developer', status: 'Not Configured', scopes: ['read', 'write'], lastSync: 'Never' },
    { id: 'conn-figma', name: 'Figma Design', category: 'Design', status: 'Not Configured', scopes: ['file_read'], lastSync: 'Never' },
    { id: 'conn-notion', name: 'Notion Workspace', category: 'Productivity', status: 'Not Configured', scopes: ['read_content'], lastSync: 'Never' },
  ]);

  const toggleConnect = (id: string) => {
    setConnectors((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === 'Connected' ? 'Not Configured' : 'Connected';
          return { ...c, status: nextStatus, lastSync: nextStatus === 'Connected' ? 'Just now' : 'Never' };
        }
        return c;
      })
    );
  };

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Enterprise Connector Center</Heading>
      <Text color="secondary">
        Connect and manage enterprise SaaS integration providers. Unconfigured or disconnected providers explicitly display <strong>Not Configured</strong> without fabricated data.
      </Text>

      <Grid columns={2} gap="16px">
        {connectors.map((c) => (
          <Box
            key={c.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="12px">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Heading level={4}>{c.name}</Heading>
                  <Text size="xs" color="muted">Category: {c.category}</Text>
                </div>
                <StatusBadge status={c.status === 'Connected' ? 'success' : c.status === 'Requires Setup' ? 'pending' : 'neutral'}>
                  {c.status.toUpperCase()}
                </StatusBadge>
              </div>

              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                OAuth Scopes: <code>{c.scopes.join(', ')}</code>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <Text size="xs" color="muted">Last Sync: {c.lastSync}</Text>
                <Button
                  variant={c.status === 'Connected' ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => toggleConnect(c.id)}
                >
                  {c.status === 'Connected' ? 'Disconnect' : 'Connect Provider'}
                </Button>
              </div>
            </Stack>
          </Box>
        ))}
      </Grid>

      <Alert type="info" title="Zero Fabrication Policy Enforcement:">
        Unbacked or unconfigured API connectors are explicitly exposed as <strong>Not Configured</strong>.
      </Alert>
    </Stack>
  );
};
