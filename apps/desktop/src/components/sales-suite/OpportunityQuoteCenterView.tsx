import { FC } from 'react';
import { useSalesRevenueStore } from '../../state/useSalesRevenueStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const OpportunityQuoteCenterView: FC = () => {
  const { opportunities, quotes } = useSalesRevenueStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Opportunity & Quote Management Center</Heading>
      <Text color="secondary">
        Manages enterprise opportunities, quote builders, discount approval workflows, and proposal versioning.
      </Text>

      <Grid columns={2} gap="16px">
        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Active Enterprise Opportunities</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {opportunities.map((opp) => (
                <div key={opp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div>
                    <div><strong>{opp.title}</strong></div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Account: {opp.accountName} • Value: ${opp.expectedRevenue.toLocaleString()}</div>
                  </div>
                  <StatusBadge status="success">{opp.stage.toUpperCase()}</StatusBadge>
                </div>
              ))}
            </div>
          </Stack>
        </Box>

        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Quotes & Discount Approvals</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {quotes.map((qte) => (
                <div key={qte.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div>
                    <div><strong>{qte.quoteNumber}</strong> (${qte.totalAmount.toLocaleString()})</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Discount: {qte.discountPercent}%</div>
                  </div>
                  <StatusBadge status="active">{qte.approvalStatus.toUpperCase()}</StatusBadge>
                </div>
              ))}
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
