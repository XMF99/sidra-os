import { FC } from 'react';
import { useCustomerIntelligenceStore } from '../../state/useCustomerIntelligenceStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const SalesPipelineView: FC = () => {
  const { deals, accounts } = useCustomerIntelligenceStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Sales Pipeline & Deal Management</Heading>
      <Text color="secondary">
        Kanban deal management dashboard tracking pipeline stages, win probabilities %, forecasts, and sales velocity.
      </Text>

      <Grid columns={2} gap="16px">
        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Active Enterprise Deals</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {deals.map((deal) => (
                <div key={deal.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div>
                    <div><strong>{deal.title}</strong></div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Account: {deal.accountName} • Value: ${deal.value.toLocaleString()}</div>
                  </div>
                  <StatusBadge status="success">{deal.stage.toUpperCase()}</StatusBadge>
                </div>
              ))}
            </div>
          </Stack>
        </Box>

        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Key Account Directory</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {accounts.map((acc) => (
                <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div>
                    <div><strong>{acc.name}</strong> ({acc.segment})</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>ARR Value: ${acc.arrValue.toLocaleString()} • Health: {acc.healthScore}%</div>
                  </div>
                  <StatusBadge status="active">{acc.status.toUpperCase()}</StatusBadge>
                </div>
              ))}
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
