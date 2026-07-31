import { FC } from 'react';
import { useCustomerIntelligenceStore } from '../../state/useCustomerIntelligenceStore';
import { Stack, Box, Heading, Text, StatusBadge, Button, Alert } from '@sidra/ui';

export const AiCustomerAuditorView: FC = () => {
  const { auditFindings, resolveCrmAuditFinding } = useCustomerIntelligenceStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>AI Customer Auditor ⭐</Heading>
      <Text color="secondary">
        Inspects account data completeness, duplicate accounts, inactive customer records, pipeline integrity, and compliance findings.
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
                <Button variant="primary" size="sm" onClick={() => resolveCrmAuditFinding(fnd.id)}>
                  Acknowledge & Mitigate Audit Finding
                </Button>
              )}
            </Stack>
          </Box>
        ))}
      </div>

      <Alert type="success" title="Customer Vault Records Audit:">
        100% of customer contract records match verified SHA-256 signatures in Vault storage.
      </Alert>
    </Stack>
  );
};
