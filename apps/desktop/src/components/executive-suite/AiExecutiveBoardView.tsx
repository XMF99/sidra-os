import { FC } from 'react';
import { useExecutiveSuiteStore } from '../../state/useExecutiveSuiteStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Alert } from '@sidra/ui';

export const AiExecutiveBoardView: FC = () => {
  const { boardAdvisors } = useExecutiveSuiteStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Virtual AI Executive Board ⭐</Heading>
      <Text color="secondary">
        Multi-perspective virtual executive board. Independent advisors (CEO, COO, CFO, CTO, CMO, CHRO, General Counsel) analyze decisions and synthesize consensus via the Multi-Perspective Reasoning Engine.
      </Text>

      <Alert type="success" title="Multi-Perspective Synthesis Consensus:">
        All 7 Virtual Board Advisors unanimously approve expanding the Game Studio Enterprise Solution with zero security or budget policy violations.
      </Alert>

      <Grid columns={2} gap="16px">
        {boardAdvisors.map((adv) => (
          <Box
            key={adv.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-accent, #6366f1)"
          >
            <Stack gap="12px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Heading level={4}>{adv.role} Advisor — {adv.name}</Heading>
                  <Text size="xs" color="muted">Focus Area: {adv.focusArea}</Text>
                </div>
                <StatusBadge status="success">{adv.confidenceScore}% CONFIDENCE</StatusBadge>
              </div>

              <Text size="xs" color="secondary">
                Strategic Recommendation: <strong>"{adv.currentRecommendation}"</strong>
              </Text>
            </Stack>
          </Box>
        ))}
      </Grid>
    </Stack>
  );
};
