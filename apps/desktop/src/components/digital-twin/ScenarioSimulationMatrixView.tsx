import { FC } from 'react';
import { useDigitalTwinStore } from '../../state/useDigitalTwinStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Button, Icon } from '@sidra/ui';

export const ScenarioSimulationMatrixView: FC = () => {
  const { scenarios, stageExecutionPreview } = useDigitalTwinStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Scenario Simulation & Decision Comparison Matrix</Heading>
      <Text color="secondary">
        Side-by-side scenario evaluations (Optimistic, Balanced, Conservative, Worst Case, Best Case) with weighted scoring rankings.
      </Text>

      <Grid columns={3} gap="16px">
        {scenarios.map((scen) => (
          <Box
            key={scen.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border={scen.variant === 'Balanced' ? '2px solid var(--sd-color-accent, #6366f1)' : '1px solid var(--sd-color-border-subtle, #242938)'}
          >
            <Stack gap="12px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Heading level={4}>{scen.variant}</Heading>
                <StatusBadge status={scen.variant === 'Balanced' ? 'success' : 'neutral'}>
                  SCORE: {scen.weightedScore}%
                </StatusBadge>
              </div>

              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                <div>Probability: <strong>{scen.completionProbability}%</strong></div>
                <div>Time: <strong>{scen.estimatedTimeDays} Days</strong></div>
                <div>Est. Cost: <strong>{scen.estimatedCost}</strong></div>
                <div>Risk Rating: <strong>{scen.riskRating}</strong></div>
                <div>Confidence: <strong>{scen.confidenceScore}%</strong></div>
              </div>

              <Button
                variant={scen.variant === 'Balanced' ? 'primary' : 'outline'}
                size="sm"
                rightIcon={<Icon name="ArrowRight" size={14} />}
                onClick={() =>
                  stageExecutionPreview({
                    planId: scen.id,
                    planTitle: `${scen.variant} Execution Plan`,
                    createdObjects: ['Workspace Space Node', 'Sub-Agent Worker'],
                    updatedObjects: ['Vault State Hash'],
                    deletedObjects: [],
                    rollbackStrategy: 'Revert to Live Digital Twin Snapshot',
                    humanApprovalRequired: true,
                    isApproved: false,
                  })
                }
                style={{ marginTop: 8 }}
              >
                Preview Execution
              </Button>
            </Stack>
          </Box>
        ))}
      </Grid>
    </Stack>
  );
};
