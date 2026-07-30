import { FC } from 'react';
import { useEnterpriseComposerStore } from '../../state/useEnterpriseComposerStore';
import { Stack, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const InteractiveOrgChartView: FC = () => {
  const { enterprises } = useEnterpriseComposerStore();
  const currentEnt = enterprises[0];

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Interactive Organization Chart Engine ⭐</Heading>
      <Text color="secondary">
        Visualizes organizational reporting structure, hybrid human-AI teams, and reporting lines across all enterprise departments.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {currentEnt.orgChart.map((node) => {
          const isAi = node.roleType === 'AI Sub-Agent';
          return (
            <Box
              key={node.id}
              padding="18px"
              bg="var(--sd-color-surface-raised, #12151e)"
              borderRadius="8px"
              border={isAi ? '1px solid var(--sd-color-accent, #6366f1)' : '1px solid var(--sd-color-border-subtle, #242938)'}
              style={{ marginLeft: node.reportsToId ? 32 : 0 }}
            >
              <Stack gap="8px">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Text weight="semibold" color="primary">{node.label}</Text>
                  </div>
                  <StatusBadge status={isAi ? 'active' : 'success'}>
                    {node.roleType.toUpperCase()}
                  </StatusBadge>
                </div>

                <div style={{ fontSize: 11, color: '#9ca3af' }}>
                  <span>Department ID: <strong>{node.departmentId}</strong></span>
                  {node.reportsToId && <span style={{ marginLeft: 16 }}>Reports To: <strong>{node.reportsToId}</strong></span>}
                </div>
              </Stack>
            </Box>
          );
        })}
      </div>
    </Stack>
  );
};
