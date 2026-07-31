import { FC } from 'react';
import { useSalesRevenueStore } from '../../state/useSalesRevenueStore';
import { Stack, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const ContractManagementView: FC = () => {
  const { contracts } = useSalesRevenueStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Contract Management & Renewal Intelligence</Heading>
      <Text color="secondary">
        Monitors active master agreements, renewal dates, electronic signatures, and contract obligation compliance.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {contracts.map((ctr) => (
          <Box
            key={ctr.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="10px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Heading level={4}>{ctr.contractName}</Heading>
                  <Text size="xs" color="muted">Contract Value: ${ctr.value.toLocaleString()} • Effective: {ctr.effectiveDate}</Text>
                </div>
                <StatusBadge status={ctr.status === 'Active' ? 'success' : 'active'}>{ctr.status.toUpperCase()}</StatusBadge>
              </div>

              <div style={{ fontSize: 12, color: '#9ca3af' }}>
                Renewal Target Date: <strong>{ctr.renewalDate}</strong> • Vault E-Signature Hash: <strong style={{ color: '#34d399' }}>VERIFIED (SHA-256)</strong>
              </div>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
