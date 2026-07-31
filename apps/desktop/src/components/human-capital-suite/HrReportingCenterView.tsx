import { FC } from 'react';
import { useHumanCapitalStore } from '../../state/useHumanCapitalStore';
import { Stack, Box, Heading, Text, Grid, StatusBadge } from '@sidra/ui';

export const HrReportingCenterView: FC = () => {
  const { headcountHuman, headcountAi, retentionRatePercent, engagementScorePercent } = useHumanCapitalStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>HR Reporting & Analytics Center</Heading>
      <Text color="secondary">
        Generates real-time Headcount Reports, Recruitment Velocity Analytics, Performance Distribution, and Compensation Analytics.
      </Text>

      <Grid columns={2} gap="16px">
        <Box padding="22px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="14px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={4}>Headcount & Workforce Composition</Heading>
              <StatusBadge status="success">HYBRID ACTIVE</StatusBadge>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Human Staff Headcount:</span>
                <span><strong>{headcountHuman} Staff</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Autonomous AI Sub-Agents:</span>
                <span><strong>{headcountAi} AI Workers</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2e3548', paddingTop: 6 }}>
                <span>Total Workforce Capacity:</span>
                <span><strong style={{ color: '#a855f7' }}>{headcountHuman + headcountAi} Workers</strong></span>
              </div>
            </div>
          </Stack>
        </Box>

        <Box padding="22px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="14px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={4}>Talent Retention & Culture Index</Heading>
              <StatusBadge status="success">HIGH STABILITY</StatusBadge>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Retention Rate:</span>
                <span><strong>{retentionRatePercent}%</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Employee Engagement Index:</span>
                <span><strong>{engagementScorePercent}%</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2e3548', paddingTop: 6 }}>
                <span>Annual Turnover Rate:</span>
                <span><strong style={{ color: '#34d399' }}>4.0% (Industry Low)</strong></span>
              </div>
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
