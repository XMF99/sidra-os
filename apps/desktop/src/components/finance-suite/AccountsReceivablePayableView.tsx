import { FC } from 'react';
import { useFinanceIntelligenceStore } from '../../state/useFinanceIntelligenceStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const AccountsReceivablePayableView: FC = () => {
  const { invoices, bills } = useFinanceIntelligenceStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Accounts Receivable & Accounts Payable</Heading>
      <Text color="secondary">
        Monitors customer invoices, collections, outstanding balances, vendor bills, and payment scheduling.
      </Text>

      <Grid columns={2} gap="16px">
        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Accounts Receivable (Customer Invoices)</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {invoices.map((inv) => (
                <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div>
                    <div><strong>{inv.customerName}</strong></div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Due: {inv.dueDate} • Amount: ${inv.amount.toLocaleString()}</div>
                  </div>
                  <StatusBadge status={inv.status === 'Paid' ? 'success' : 'active'}>{inv.status.toUpperCase()}</StatusBadge>
                </div>
              ))}
            </div>
          </Stack>
        </Box>

        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Accounts Payable (Vendor Bills)</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {bills.map((bill) => (
                <div key={bill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div>
                    <div><strong>{bill.vendorName}</strong></div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Due: {bill.dueDate} • Amount: ${bill.amount.toLocaleString()}</div>
                  </div>
                  <StatusBadge status={bill.status === 'Paid' ? 'success' : 'active'}>{bill.status.toUpperCase()}</StatusBadge>
                </div>
              ))}
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
