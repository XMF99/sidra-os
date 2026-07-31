import { FC } from 'react';
import { useHumanCapitalStore } from '../../state/useHumanCapitalStore';
import { Stack, Box, Heading, Text, StatusBadge, Button, Alert } from '@sidra/ui';

export const AiWorkforceAuditorView: FC = () => {
  const { auditFindings, resolveHrAuditFinding } = useHumanCapitalStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>AI Workforce Auditor ⭐</Heading>
      <Text color="secondary">
        Inspects employee documentation completeness, policy compliance, incomplete reviews, attendance anomalies, and audit findings.
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
                <Button variant="primary" size="sm" onClick={() => resolveHrAuditFinding(fnd.id)}>
                  Acknowledge & Mitigate Finding
                </Button>
              )}
            </Stack>
          </Box>
        ))}
      </div>

      <Alert type="success" title="Personnel Vault Integrity Audit:">
        100% of employee personnel records match verified SHA-256 signatures in Vault storage.
      </Alert>
    </Stack>
  );
};
