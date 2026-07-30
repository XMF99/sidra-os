import { FC } from 'react';
import { useIntelligenceCoreStore } from '../../state/useIntelligenceCoreStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Alert, Icon } from '@sidra/ui';

export const OrganizationDnaView: FC = () => {
  const { dna } = useIntelligenceCoreStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Box
        padding="24px"
        bg="linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)"
        borderRadius="8px"
        border="1px solid rgba(99, 102, 241, 0.3)"
      >
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Heading level={2}>{dna.orgName} — Organization DNA</Heading>
              <Text size="xs" color="muted">Industry: {dna.industry} • Stage: {dna.growthStage}</Text>
            </div>
            <StatusBadge status="active">ORGANIZATION DNA LEARNING: ACTIVE</StatusBadge>
          </div>
          <Text color="secondary">
            Continuously learns organizational structure, approval preferences, risk posture, and capability patterns without overwriting configured security policies.
          </Text>
        </Stack>
      </Box>

      <Grid columns={3} gap="16px">
        <Box padding="18px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="8px">
            <Text size="xs" weight="semibold" color="muted">Risk Tolerance Posture:</Text>
            <Heading level={4} style={{ color: '#60a5fa' }}>{dna.riskTolerance}</Heading>
            <Text size="xs" color="muted">Requires 100% Permission Broker token validation before API egress.</Text>
          </Stack>
        </Box>

        <Box padding="18px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="8px">
            <Text size="xs" weight="semibold" color="muted">Approval Protocol Style:</Text>
            <Heading level={4} style={{ color: '#34d399' }}>{dna.approvalStyle}</Heading>
            <Text size="xs" color="muted">Formal security verification before workspace state mutations.</Text>
          </Stack>
        </Box>

        <Box padding="18px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="8px">
            <Text size="xs" weight="semibold" color="muted">Communication Synthesis:</Text>
            <Heading level={4} style={{ color: '#c084fc' }}>{dna.communicationStyle}</Heading>
            <Text size="xs" color="muted">Delivers concise executive telemetry and structured decision plans.</Text>
          </Stack>
        </Box>
      </Grid>

      <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="BookOpen" size={18} color="var(--sd-color-accent, #6366f1)" />
            <Heading level={4}>Learned Organizational Patterns & Preferences</Heading>
          </div>
          <Alert type="info" title="Verified Institutional Policies:">
            <ul style={{ margin: '4px 0 0 16px', fontSize: 13, color: '#94a3b8' }}>
              {dna.learnedPreferences.map((pref, idx) => (
                <li key={idx} style={{ marginBottom: 4 }}>{pref}</li>
              ))}
            </ul>
          </Alert>
        </Stack>
      </Box>
    </Stack>
  );
};
