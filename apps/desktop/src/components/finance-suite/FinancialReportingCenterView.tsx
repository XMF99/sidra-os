import { FC } from 'react';
import { useFinanceIntelligenceStore } from '../../state/useFinanceIntelligenceStore';
import { Stack, Box, Heading, Text, Grid, StatusBadge } from '@sidra/ui';

export const FinancialReportingCenterView: FC = () => {
  const { cashPositionArr, expensesArr } = useFinanceIntelligenceStore();

  const netIncome = (cashPositionArr - expensesArr).toFixed(1);

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Financial Reporting Center</Heading>
      <Text color="secondary">
        Real-time financial statement generator (Balance Sheet, Income Statement P&L, Cash Flow Statement, Equity Statement).
      </Text>

      <Grid columns={2} gap="16px">
        <Box padding="22px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="14px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={4}>Income Statement (Profit & Loss)</Heading>
              <StatusBadge status="success">Q3 2026 AUDITED</StatusBadge>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Revenue (ARR):</span>
                <span><strong>${cashPositionArr}M</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Operating Expenses:</span>
                <span><strong>${expensesArr}M</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2e3548', paddingTop: 6 }}>
                <span>Net Operating Income:</span>
                <span><strong style={{ color: '#34d399' }}>+${netIncome}M</strong></span>
              </div>
            </div>
          </Stack>
        </Box>

        <Box padding="22px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="14px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={4}>Balance Sheet Summary</Heading>
              <StatusBadge status="success">BALANCED</StatusBadge>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Assets:</span>
                <span><strong>$14.25M</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Liabilities:</span>
                <span><strong>$0.42M</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2e3548', paddingTop: 6 }}>
                <span>Total Equity:</span>
                <span><strong>$13.83M</strong></span>
              </div>
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
