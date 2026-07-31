import { FC } from 'react';
import { useExecutiveSuiteStore } from '../../state/useExecutiveSuiteStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const EnterpriseRadarView: FC = () => {
  const { riskRadar } = useExecutiveSuiteStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Enterprise Radar & Risk Intelligence</Heading>
      <Text color="secondary">
        Monitors emerging risks (Strategic, Operational, Financial, Security, Compliance, AI) with likelihood ratings and mitigation plans.
      </Text>

      <Grid columns={2} gap="16px">
        {riskRadar.map((rsk) => (
          <Box
            key={rsk.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="10px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Heading level={4}>{rsk.title}</Heading>
                  <Text size="xs" color="muted">Category: {rsk.category} • Likelihood: {rsk.likelihoodPercent}%</Text>
                </div>
                <StatusBadge status={rsk.severity === 'High' ? 'pending' : 'success'}>
                  {rsk.severity.toUpperCase()} SEVERITY
                </StatusBadge>
              </div>

              <Text size="xs" color="secondary">
                Mitigation Plan: <strong>{rsk.mitigationPlan}</strong>
              </Text>
            </Stack>
          </Box>
        ))}
      </Grid>
    </Stack>
  );
};
