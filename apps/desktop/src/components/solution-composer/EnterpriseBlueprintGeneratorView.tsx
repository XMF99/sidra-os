import { FC } from 'react';
import { useBusinessSolutionStore } from '../../state/useBusinessSolutionStore';
import { Stack, Box, Heading, Text, StatusBadge, Alert } from '@sidra/ui';

export const EnterpriseBlueprintGeneratorView: FC = () => {
  const { blueprints } = useBusinessSolutionStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Enterprise Blueprint Generator ⭐</Heading>
      <Text color="secondary">
        Automatically compiles composed solutions into structural Enterprise Blueprints defining System Architecture, Processes, Departments, Roles, and Execution Flow DAGs.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {blueprints.map((blp) => (
          <Box
            key={blp.id}
            padding="24px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-accent, #6366f1)"
          >
            <Stack gap="14px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Heading level={4}>{blp.title}</Heading>
                <StatusBadge status="success">CERTIFIED BLUEPRINT</StatusBadge>
              </div>

              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                <div><strong>Target Departments:</strong> {blp.departments.join(', ')}</div>
                <div><strong>Assigned Roles:</strong> {blp.roles.join(', ')}</div>
              </div>

              <Alert type="info" title="Execution Flow DAG Sequence:">
                <ol style={{ margin: '4px 0 0 16px', fontSize: 12 }}>
                  {blp.executionFlowDag.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </Alert>

              <div>
                <Text size="xs" weight="semibold" color="muted">Compliance & Security Mandates:</Text>
                <ul style={{ margin: '4px 0 0 16px', fontSize: 12, color: '#34d399' }}>
                  {blp.complianceMandates.map((mand, i) => (
                    <li key={i}>✓ {mand}</li>
                  ))}
                </ul>
              </div>

              <Text size="xs" color="muted" style={{ fontSize: 10 }}>
                Generated: {new Date(blp.generatedAt).toLocaleString()}
              </Text>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
