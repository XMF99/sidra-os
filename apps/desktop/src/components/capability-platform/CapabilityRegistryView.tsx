import { FC } from 'react';
import { useCapabilityIntelligenceStore, LifecycleState } from '../../state/useCapabilityIntelligenceStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Button, TextInput } from '@sidra/ui';

export const CapabilityRegistryView: FC = () => {
  const { capabilities, updateLifecycleState, searchQuery, setSearchQuery } = useCapabilityIntelligenceStore();

  const filtered = capabilities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const states: LifecycleState[] = ['Draft', 'Testing', 'Approved', 'Published', 'Deprecated', 'Archived'];

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Box
        padding="24px"
        bg="linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)"
        borderRadius="8px"
        border="1px solid rgba(16, 185, 129, 0.3)"
      >
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Heading level={2}>Business Capability Registry</Heading>
              <Text size="xs" color="muted">Operating System Level Business Functions</Text>
            </div>
            <StatusBadge status="success">CAPABILITY ENGINE ACTIVE</StatusBadge>
          </div>
          <Text color="secondary">
            THEKY orchestrates reusable Business Capabilities composed of AI Models + MCP Servers + Connectors + Security Policies.
          </Text>
        </Stack>
      </Box>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <TextInput
          placeholder="Search registered business capabilities by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Grid columns={2} gap="16px">
        {filtered.map((cap) => (
          <Box
            key={cap.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="12px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Heading level={4}>{cap.name} (v{cap.version})</Heading>
                  <Text size="xs" color="muted">Category: {cap.category} • Owner: {cap.owner}</Text>
                </div>
                <StatusBadge status={cap.lifecycleState === 'Published' ? 'success' : cap.lifecycleState === 'Testing' ? 'active' : 'neutral'}>
                  {cap.lifecycleState.toUpperCase()}
                </StatusBadge>
              </div>

              <Text size="xs" color="secondary">{cap.description}</Text>

              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                <div><strong>Composed AI Models:</strong> {cap.composedModels.join(', ')}</div>
                <div><strong>Composed Tools:</strong> {cap.composedTools.join(', ')}</div>
                <div><strong>Composed Connectors:</strong> {cap.composedConnectors.join(', ')}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <Text size="xs" color="muted">Executions: {cap.executionCount} • Success: {cap.successRate}%</Text>
                <div style={{ display: 'flex', gap: 6 }}>
                  {states.map((st) => (
                    <Button
                      key={st}
                      variant={st === cap.lifecycleState ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => updateLifecycleState(cap.id, st)}
                      style={{ padding: '2px 8px', fontSize: 10 }}
                    >
                      {st}
                    </Button>
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
