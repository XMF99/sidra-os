import { FC } from 'react';
import { useProjectPortfolioStore } from '../../state/useProjectPortfolioStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Alert } from '@sidra/ui';

export const AiPmoAdvisorView: FC = () => {
  const { pmoRecommendations } = useProjectPortfolioStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Virtual AI PMO Advisor ⭐</Heading>
      <Text color="secondary">
        Intelligent virtual PMO delivering real-time portfolio prioritization, project recommendations, resource planning, risk mitigation, and executive delivery guidance.
      </Text>

      <Grid columns={2} gap="16px">
        {pmoRecommendations.map((rec) => (
          <Box
            key={rec.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-accent, #6366f1)"
          >
            <Stack gap="12px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Heading level={4}>{rec.title}</Heading>
                <StatusBadge status="success">{rec.confidenceScore}% CONFIDENCE</StatusBadge>
              </div>

              <Text size="xs" color="secondary">
                Recommendation: <strong>"{rec.recommendation}"</strong>
              </Text>

              <Alert type="info" title={`Explainability & Impact Estimate (${rec.impactEstimate}):`}>
                <Text size="xs" color="secondary">{rec.explainabilityWhy}</Text>
              </Alert>
            </Stack>
          </Box>
        ))}
      </Grid>
    </Stack>
  );
};
