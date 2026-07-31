import { FC } from 'react';
import { useGameStudioStore } from '../../state/useGameStudioStore';
import { Stack, Box, Heading, Text, Grid, StatusBadge } from '@sidra/ui';

export const GameReportingCenterView: FC = () => {
  const { studioHealthScore, sprintProgressPercent, dauCount, mauCount, playerRetentionPercent } = useGameStudioStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Game Studio Reporting & Production Analytics Center</Heading>
      <Text color="secondary">
        Generates real-time Release Readiness Reports, Player Retention Statements, LiveOps Revenue Analytics, and Executive Studio Dashboards.
      </Text>

      <Grid columns={2} gap="16px">
        <Box padding="22px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="14px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={4}>Production Velocity & Release Readiness</Heading>
              <StatusBadge status="success">GOLD MASTER PASS</StatusBadge>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Studio Health Score:</span>
                <span><strong>{studioHealthScore}% Health</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Sprint Milestone Completion:</span>
                <span><strong>{sprintProgressPercent}% Complete</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2e3548', paddingTop: 6 }}>
                <span>Automated QA Certification:</span>
                <span><strong style={{ color: '#eab308' }}>100% Certified</strong></span>
              </div>
            </div>
          </Stack>
        </Box>

        <Box padding="22px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="14px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={4}>Player Population & Retention</Heading>
              <StatusBadge status="success">LIVEOPS ACTIVE</StatusBadge>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Daily / Monthly Active Users:</span>
                <span><strong>{(dauCount / 1000000).toFixed(1)}M DAU / {(mauCount / 1000000).toFixed(1)}M MAU</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>D30 Player Retention Index:</span>
                <span><strong>{playerRetentionPercent}% Retention</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2e3548', paddingTop: 6 }}>
                <span>Average Revenue Per DAU (ARPDAU):</span>
                <span><strong style={{ color: '#34d399' }}>$0.48 ARPDAU</strong></span>
              </div>
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
