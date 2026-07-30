import { FC } from 'react';
import { useBusinessSolutionStore, SolutionLifecycleState } from '../../state/useBusinessSolutionStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Button } from '@sidra/ui';

export const BusinessSolutionRegistryView: FC = () => {
  const { solutions, updateSolutionLifecycle, generateBlueprint } = useBusinessSolutionStore();

  const states: SolutionLifecycleState[] = ['Draft', 'Review', 'Testing', 'Approved', 'Published', 'Deprecated', 'Archived'];

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Box
        padding="24px"
        bg="linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(16, 185, 129, 0.18) 100%)"
        borderRadius="8px"
        border="1px solid rgba(99, 102, 241, 0.4)"
      >
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Heading level={2}>Enterprise Business Solution Registry</Heading>
              <Text size="xs" color="muted">Governed End-to-End Business Solutions</Text>
            </div>
            <StatusBadge status="success">SOLUTION COMPOSER ACTIVE</StatusBadge>
          </div>
          <Text color="secondary">
            Business Solutions unite multiple reusable Capabilities into fully governed, executable enterprise domains.
          </Text>
        </Stack>
      </Box>

      <Heading level={3}>Registered Enterprise Solutions ({solutions.length})</Heading>

      <Grid columns={2} gap="16px">
        {solutions.map((sol) => (
          <Box
            key={sol.id}
            padding="22px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="12px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Heading level={4}>{sol.name} (v{sol.version})</Heading>
                  <Text size="xs" color="muted">Domain: {sol.domain} • Owner: {sol.owner}</Text>
                </div>
                <StatusBadge status={sol.lifecycleState === 'Published' ? 'success' : 'active'}>
                  {sol.lifecycleState.toUpperCase()}
                </StatusBadge>
              </div>

              <Text size="xs" color="secondary">{sol.description}</Text>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                <span>Automation: <strong>{sol.automationLevelPercent}%</strong></span>
                <span>ROI Estimate: <strong>{sol.roiEstimateRatio}x ROI</strong></span>
                <span>Time Saved: <strong>{sol.timeSavingsHoursPerWeek} hrs/wk</strong></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <Button variant="outline" size="sm" onClick={() => generateBlueprint(sol.id)}>
                  Generate Blueprint ⭐
                </Button>
                <div style={{ display: 'flex', gap: 4 }}>
                  {states.map((st) => (
                    <Button
                      key={st}
                      variant={st === sol.lifecycleState ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => updateSolutionLifecycle(sol.id, st)}
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
