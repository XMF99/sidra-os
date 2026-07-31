import { FC } from 'react';
import { useProjectPortfolioStore } from '../../state/useProjectPortfolioStore';
import { Stack, Box, Heading, Text, Grid, StatusBadge } from '@sidra/ui';

export const ProjectReportingCenterView: FC = () => {
  const { portfolioHealthScore, strategicAlignmentPercent, budgetUtilizationPercent, scheduleHealthPercent } = useProjectPortfolioStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Project Reporting & Delivery Analytics Center</Heading>
      <Text color="secondary">
        Generates real-time Portfolio Health Reports, Delivery Velocity Statements, Earned Value Financials, and Executive Delivery Dashboards.
      </Text>

      <Grid columns={2} gap="16px">
        <Box padding="22px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="14px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={4}>Portfolio Health & Delivery Velocity</Heading>
              <StatusBadge status="success">Q3 AUDITED</StatusBadge>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Portfolio Health Score:</span>
                <span><strong>{portfolioHealthScore}% Health</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Schedule Health Index:</span>
                <span><strong>{scheduleHealthPercent}% On Schedule</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2e3548', paddingTop: 6 }}>
                <span>Delivery Acceleration Rate:</span>
                <span><strong style={{ color: '#a855f7' }}>+28% Sprint Velocity</strong></span>
              </div>
            </div>
          </Stack>
        </Box>

        <Box padding="22px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="14px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={4}>Earned Value & Strategic Alignment</Heading>
              <StatusBadge status="success">STRATEGIC PASS</StatusBadge>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Strategic Alignment Score:</span>
                <span><strong>{strategicAlignmentPercent}% Aligned</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Budget Utilization Rate:</span>
                <span><strong>{budgetUtilizationPercent}% Utilized</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2e3548', paddingTop: 6 }}>
                <span>Earned Value Management (EVM):</span>
                <span><strong style={{ color: '#34d399' }}>1.04 EVM (Favorable)</strong></span>
              </div>
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
