import { FC } from 'react';
import { useExecutiveSuiteStore } from '../../state/useExecutiveSuiteStore';
import { Stack, Box, Heading, Text, StatusBadge, Button, Alert } from '@sidra/ui';

export const ExecutiveDecisionCenterView: FC = () => {
  const { pendingDecisions, approveExecutiveDecision } = useExecutiveSuiteStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Executive Decision Center & Approval Queue</Heading>
      <Text color="secondary">
        Manages pending approvals, strategic decisions, immutable Execution Contracts, decision explainability, and historical audit trails.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {pendingDecisions.map((dec) => (
          <Box
            key={dec.id}
            padding="24px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-accent, #6366f1)"
          >
            <Stack gap="14px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Heading level={4}>{dec.title}</Heading>
                  <Text size="xs" color="muted">Impact Scope: {dec.impactScope} • Contract: {dec.executionContractId}</Text>
                </div>
                <StatusBadge status={dec.approvalStatus === 'Approved' ? 'success' : 'active'}>
                  {dec.approvalStatus.toUpperCase()}
                </StatusBadge>
              </div>

              <Alert type="info" title={`Executive Explainability Trail (${dec.explainability.confidence}% Confidence):`}>
                <div style={{ fontSize: 12 }}>
                  <div><strong>Why:</strong> {dec.explainability.why}</div>
                  <div><strong>Evidence:</strong> {dec.explainability.evidence}</div>
                  <div><strong>Alternatives Considered:</strong> {dec.explainability.alternatives.join(', ')}</div>
                </div>
              </Alert>

              {dec.approvalStatus === 'Pending' && (
                <Button variant="primary" size="sm" onClick={() => approveExecutiveDecision(dec.id)}>
                  Approve Execution Contract
                </Button>
              )}
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
