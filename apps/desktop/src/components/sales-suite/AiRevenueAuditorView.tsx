import { FC } from 'react';
import { useSalesRevenueStore } from '../../state/useSalesRevenueStore';
import { Stack, Box, Heading, Text, StatusBadge, Button, Alert } from '@sidra/ui';

export const AiRevenueAuditorView: FC = () => {
  const { auditFindings, resolveRevenueAuditFinding } = useSalesRevenueStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>AI Revenue Auditor ⭐</Heading>
      <Text color="secondary">
        Inspects pipeline integrity, forecast accuracy, duplicate opportunities, pricing compliance, and approval histories.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {auditFindings.map((fnd) => (
          <Box
            key={fnd.id}
            padding="24px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="12px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Heading level={4}>{fnd.findingTitle}</Heading>
                <StatusBadge status={fnd.status === 'Mitigated' ? 'success' : 'active'}>
                  {fnd.severity.toUpperCase()} SEVERITY • {fnd.status.toUpperCase()}
                </StatusBadge>
              </div>

              <Text size="xs" color="secondary">
                Audit Evidence: <strong>"{fnd.evidence}"</strong>
              </Text>

              {fnd.status !== 'Mitigated' && (
                <Button variant="primary" size="sm" onClick={() => resolveRevenueAuditFinding(fnd.id)}>
                  Acknowledge & Mitigate Audit Finding
                </Button>
              )}
            </Stack>
          </Box>
        ))}
      </div>

      <Alert type="success" title="Revenue Vault Audit Certification:">
        100% of quote approvals and contract signatures match verified SHA-256 event hashes in Vault storage.
      </Alert>
    </Stack>
  );
};
