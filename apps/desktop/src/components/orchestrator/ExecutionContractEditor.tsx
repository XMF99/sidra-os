import { FC } from 'react';
import { useExecutiveOrchestratorStore } from '../../state/useExecutiveOrchestratorStore';
import { Stack, Box, Heading, Text, StatusBadge, Button, Alert, Icon } from '@sidra/ui';

export const ExecutionContractEditor: FC = () => {
  const { contracts, signExecutionContract } = useExecutiveOrchestratorStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Immutable Execution Contracts ⭐</Heading>
      <Text color="secondary">
        Guarantees that complex plans cannot execute without a signed Execution Contract defining scope, rollback strategy, constraints, and success criteria.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {contracts.map((cntr) => (
          <Box
            key={cntr.id}
            padding="24px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-accent, #6366f1)"
          >
            <Stack gap="14px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Heading level={4}>{cntr.title}</Heading>
                  <Text size="xs" color="muted">Contract ID: {cntr.id} • Owner: {cntr.owner}</Text>
                </div>
                <StatusBadge status={cntr.signedByHuman ? 'success' : 'pending'}>
                  {cntr.signedByHuman ? 'CONTRACT SIGNED' : 'AWAITING DIGITAL SIGNATURE'}
                </StatusBadge>
              </div>

              <Text size="xs" color="secondary">Scope: <strong>{cntr.scope}</strong></Text>

              <Alert type="info" title="Rollback Strategy & Recovery Protocol:">
                {cntr.rollbackStrategy}
              </Alert>

              <div>
                <Text size="xs" weight="semibold" color="muted">Allocated System Resources:</Text>
                <ul style={{ margin: '4px 0 0 16px', fontSize: 12, color: '#94a3b8' }}>
                  {cntr.resourcesAllocated.map((res, i) => (
                    <li key={i}>{res}</li>
                  ))}
                </ul>
              </div>

              <div>
                <Text size="xs" weight="semibold" color="muted">Success Criteria Mandates:</Text>
                <ul style={{ margin: '4px 0 0 16px', fontSize: 12, color: '#34d399' }}>
                  {cntr.successCriteria.map((crit, i) => (
                    <li key={i}>✓ {crit}</li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <Text size="xs" color="muted">Timestamp: {new Date(cntr.timestamp).toLocaleString()}</Text>
                {!cntr.signedByHuman ? (
                  <Button
                    variant="primary"
                    size="sm"
                    rightIcon={<Icon name="Check" size={14} />}
                    onClick={() => signExecutionContract(cntr.id)}
                  >
                    Digital Signature: Authorize Contract
                  </Button>
                ) : (
                  <StatusBadge status="success">AUTHORIZED BY PRINCIPAL</StatusBadge>
                )}
              </div>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
