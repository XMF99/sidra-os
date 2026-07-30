import { FC } from 'react';
import { useAIWorkspaceStore } from '../../state/useAIWorkspaceStore';
import { Stack, Box, Heading, Text, Button, StatusBadge, Alert, Icon } from '@sidra/ui';

export const ExecutiveDecisionCenter: FC = () => {
  const { decisions, approveDecision, rejectDecision } = useAIWorkspaceStore();

  return (
    <Stack gap="24px" style={{ padding: 24 }}>
      <Heading level={2}>Executive Decision Center</Heading>
      <Text color="secondary">
        High-assurance AI decision proposals requiring binding human executive sign-off.
      </Text>

      {decisions.map((dec) => (
        <Box
          key={dec.id}
          padding="24px"
          bg="var(--sd-color-surface-raised, #12151e)"
          borderRadius="8px"
          border="1px solid var(--sd-color-border-subtle, #242938)"
        >
          <Stack gap="16px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={3}>{dec.title}</Heading>
              <StatusBadge
                status={
                  dec.status === 'approved'
                    ? 'success'
                    : dec.status === 'rejected'
                    ? 'danger'
                    : 'pending'
                }
              >
                {dec.status.toUpperCase()}
              </StatusBadge>
            </div>

            <Alert type="info" title="AI Recommendation">
              {dec.recommendation}
            </Alert>

            <div style={{ display: 'flex', gap: 24 }}>
              <div>
                <Text size="xs" color="muted">
                  Confidence Score
                </Text>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>
                  {dec.confidenceScore}%
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <Text size="xs" color="muted">
                  Risk Evaluation Summary
                </Text>
                <Text size="sm" color="primary">
                  {dec.riskSummary}
                </Text>
              </div>
            </div>

            <div>
              <Text size="xs" weight="semibold" color="muted">
                Evidence Citations (Vault Log & Telemetry):
              </Text>
              <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: 13, color: '#94a3b8' }}>
                {dec.evidence.map((e, idx) => (
                  <li key={idx}>{e}</li>
                ))}
              </ul>
            </div>

            {dec.status === 'pending' && (
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <Button
                  variant="destructive"
                  size="sm"
                  leftIcon={<Icon name="X" size={14} />}
                  onClick={() => rejectDecision(dec.id)}
                >
                  Reject
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  leftIcon={<Icon name="Check" size={14} />}
                  onClick={() => approveDecision(dec.id)}
                >
                  Approve & Execute
                </Button>
              </div>
            )}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};
