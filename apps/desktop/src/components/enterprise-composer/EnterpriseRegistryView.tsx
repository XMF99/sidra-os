import { FC } from 'react';
import { useEnterpriseComposerStore, EnterpriseLifecycle } from '../../state/useEnterpriseComposerStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Button } from '@sidra/ui';

export const EnterpriseRegistryView: FC = () => {
  const { enterprises, updateEnterpriseLifecycle, generateMasterBlueprint } = useEnterpriseComposerStore();

  const states: EnterpriseLifecycle[] = ['Draft', 'Simulation', 'Testing', 'Approved', 'Operational', 'Archived'];

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Box
        padding="24px"
        bg="linear-gradient(135deg, rgba(168, 85, 247, 0.18) 0%, rgba(99, 102, 241, 0.18) 100%)"
        borderRadius="8px"
        border="1px solid rgba(168, 85, 247, 0.4)"
      >
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Heading level={2}>Enterprise Organization Registry</Heading>
              <Text size="xs" color="muted">Top-Level Business Operating System Hierarchy</Text>
            </div>
            <StatusBadge status="success">ENTERPRISE COMPOSER ACTIVE</StatusBadge>
          </div>
          <Text color="secondary">
            THEKY composes entire Enterprise Organizations uniting Departments, Business Solutions, Capabilities, AI Workers, and Operating Models.
          </Text>
        </Stack>
      </Box>

      <Heading level={3}>Registered Enterprises ({enterprises.length})</Heading>

      <Grid columns={2} gap="16px">
        {enterprises.map((ent) => (
          <Box
            key={ent.id}
            padding="22px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="12px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Heading level={4}>{ent.name}</Heading>
                  <Text size="xs" color="muted">Industry: {ent.industry} • Model: {ent.operatingModel}</Text>
                </div>
                <StatusBadge status={ent.lifecycleState === 'Operational' ? 'success' : 'active'}>
                  {ent.lifecycleState.toUpperCase()}
                </StatusBadge>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                <span>Departments: <strong>{ent.departments.length}</strong></span>
                <span>AI Utilization: <strong>{ent.aiUtilizationPercent}%</strong></span>
                <span>Health Score: <strong>{ent.operationalHealthScore}%</strong></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <Button variant="outline" size="sm" onClick={() => generateMasterBlueprint(ent.id)}>
                  Generate Master Blueprint ⭐
                </Button>
                <div style={{ display: 'flex', gap: 4 }}>
                  {states.map((st) => (
                    <Button
                      key={st}
                      variant={st === ent.lifecycleState ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => updateEnterpriseLifecycle(ent.id, st)}
                      style={{ padding: '2px 6px', fontSize: 10 }}
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
