import { FC } from 'react';
import { useAiEcosystemStore } from '../../state/useAiEcosystemStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Button, Icon } from '@sidra/ui';

export const McpPlatformHubView: FC = () => {
  const { mcpServers, registerMcpServer } = useAiEcosystemStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Heading level={3}>Model Context Protocol (MCP) Platform Hub</Heading>
          <Text color="secondary">
            Native MCP server discovery, tool registration, capability schemas, and security sandboxing.
          </Text>
        </div>
        <Button
          variant="outline"
          size="sm"
          rightIcon={<Icon name="Plus" size={14} />}
          onClick={() =>
            registerMcpServer({
              name: `Custom MCP Server ${Date.now()}`,
              version: '1.0.0',
              capabilities: ['custom_action', 'query_data'],
              permissionScope: 'Restricted',
              status: 'Connected',
              toolsCount: 3,
            })
          }
        >
          Register MCP Server
        </Button>
      </div>

      <Grid columns={2} gap="16px">
        {mcpServers.map((mcp) => (
          <Box
            key={mcp.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="12px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text weight="semibold" color="primary">{mcp.name} (v{mcp.version})</Text>
                <StatusBadge status="success">STATUS: {mcp.status.toUpperCase()}</StatusBadge>
              </div>

              <Text size="xs" color="muted">
                Permission Isolation: <strong>{mcp.permissionScope} Scope</strong> • Registered Tools: <strong>{mcp.toolsCount}</strong>
              </Text>

              <div>
                <Text size="xs" weight="semibold" color="muted">Exposed Capabilities:</Text>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {mcp.capabilities.map((cap, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        backgroundColor: '#050608',
                        color: '#34d399',
                        fontSize: 11,
                        border: '1px solid #2e3548',
                      }}
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </Stack>
          </Box>
        ))}
      </Grid>
    </Stack>
  );
};
