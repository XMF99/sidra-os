import { FC } from 'react';
import { useExecutiveSuiteStore } from '../../state/useExecutiveSuiteStore';
import { Stack, Box, Heading, Text, StatusBadge, Button, Alert } from '@sidra/ui';

export const ExecutiveWarRoomView: FC = () => {
  const { warRoomIncidents, resolveWarRoomIncident } = useExecutiveSuiteStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Executive War Room & Crisis Management ⭐</Heading>
      <Text color="secondary">
        Dedicated crisis management workspace rendering live incident streams, Digital Twin sandbox recovery simulations, and risk timelines.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {warRoomIncidents.map((inc) => (
          <Box
            key={inc.id}
            padding="24px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid rgba(239, 68, 68, 0.4)"
          >
            <Stack gap="14px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Heading level={4}>{inc.incidentTitle}</Heading>
                  <Text size="xs" color="muted">Affected Department: {inc.affectedDepartment} • Scenario ID: {inc.digitalTwinScenarioId}</Text>
                </div>
                <StatusBadge status={inc.status === 'Resolved' ? 'success' : 'active'}>
                  {inc.severity.toUpperCase()} • {inc.status.toUpperCase()}
                </StatusBadge>
              </div>

              <Alert type="warning" title="Recommended Digital Twin Recovery Simulation:">
                <Text size="xs" color="secondary">{inc.recommendedAction}</Text>
              </Alert>

              {inc.status !== 'Resolved' && (
                <Button variant="primary" size="sm" onClick={() => resolveWarRoomIncident(inc.id)}>
                  Execute Recovery Action
                </Button>
              )}
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
