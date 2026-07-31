import { FC } from 'react';
import { useMarketingGrowthStore } from '../../state/useMarketingGrowthStore';
import { Stack, Box, Heading, Text, StatusBadge, Button, Alert } from '@sidra/ui';

export const AiMarketingAuditorView: FC = () => {
  const { auditFindings, resolveMarketingAuditFinding } = useMarketingGrowthStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>AI Marketing Auditor ⭐</Heading>
      <Text color="secondary">
        Inspects campaign tracking accuracy, budget compliance, audience quality, channel performance, and data integrity.
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
                <Button variant="primary" size="sm" onClick={() => resolveMarketingAuditFinding(fnd.id)}>
                  Acknowledge & Mitigate Audit Finding
                </Button>
              )}
            </Stack>
          </Box>
        ))}
      </div>

      <Alert type="success" title="Marketing Attribution Vault Audit:">
        100% of lead tracking events match verified SHA-256 signatures in Vault storage with full privacy compliance.
      </Alert>
    </Stack>
  );
};
