import { FC } from 'react';
import { useFinanceIntelligenceStore } from '../../state/useFinanceIntelligenceStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const GeneralLedgerView: FC = () => {
  const { accounts, journalEntries } = useFinanceIntelligenceStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>General Ledger & Chart of Accounts</Heading>
      <Text color="secondary">
        Interactive Chart of Accounts, journal entry poster, trial balance inspector, and immutable Vault audit trail.
      </Text>

      <Grid columns={2} gap="16px">
        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Chart of Accounts</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {accounts.map((acc) => (
                <div key={acc.code} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderBottom: '1px solid #1e2330', paddingBottom: 4 }}>
                  <span><code>{acc.code}</code> — {acc.name} ({acc.type})</span>
                  <span><strong>${acc.balance.toLocaleString()}</strong></span>
                </div>
              ))}
            </div>
          </Stack>
        </Box>

        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Journal Entries Audit Trail</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {journalEntries.map((ent) => (
                <div key={ent.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div>
                    <div><strong>{ent.description}</strong></div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Code: {ent.accountCode} • {ent.date}</div>
                  </div>
                  <StatusBadge status="success">{ent.status.toUpperCase()}</StatusBadge>
                </div>
              ))}
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
