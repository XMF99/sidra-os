import { FC } from 'react';
import { useIntelligenceCoreStore } from '../../state/useIntelligenceCoreStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const KnowledgeGraphVisualizer: FC = () => {
  const { nodes, edges } = useIntelligenceCoreStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Organizational Knowledge Graph</Heading>
      <Text color="secondary">
        Semantic relationship graph connecting Spaces, Projects, AI Sub-Agents, Capabilities, Blueprints, and Decisions.
      </Text>

      <Grid columns={2} gap="16px">
        {/* Nodes Panel */}
        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Graph Entities ({nodes.length})</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {nodes.map((node) => (
                <div
                  key={node.id}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    backgroundColor: '#050608',
                    border: '1px solid #2e3548',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text size="sm" color="primary">{node.label}</Text>
                  <StatusBadge status="active">{node.type.toUpperCase()}</StatusBadge>
                </div>
              ))}
            </div>
          </Stack>
        </Box>

        {/* Edges Relationship Panel */}
        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Semantic Edges ({edges.length})</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {edges.map((edge, idx) => {
                const src = nodes.find((n) => n.id === edge.source)?.label || edge.source;
                const tgt = nodes.find((n) => n.id === edge.target)?.label || edge.target;
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      backgroundColor: '#050608',
                      border: '1px solid #2e3548',
                      fontSize: 12,
                    }}
                  >
                    <span style={{ color: '#818cf8', fontWeight: 600 }}>{src}</span>
                    <span style={{ color: '#6b7280', margin: '0 6px' }}>——[{edge.relation}]——&gt;</span>
                    <span style={{ color: '#34d399', fontWeight: 600 }}>{tgt}</span>
                  </div>
                );
              })}
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
