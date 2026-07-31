import { FC } from 'react';
import { useGameStudioStore } from '../../state/useGameStudioStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Alert } from '@sidra/ui';

export const AiStudioDirectorView: FC = () => {
  const { directorRecommendations, agents } = useGameStudioStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Virtual AI Studio Director & 38-Agent Hierarchy ⭐</Heading>
      <Text color="secondary">
        Executive AI Studio Director orchestrating 38 specialized AI studio agent roles via THEKY Mission Engine, Knowledge Graph, and Decision Engine.
      </Text>

      <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
        <Stack gap="12px">
          <Heading level={4}>Active Studio Agents Hierarchy (38 Specialized Roles)</Heading>
          <Grid columns={3} gap="10px">
            {agents.map((ag) => (
              <div key={ag.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#1e2330', borderRadius: 6, fontSize: 12 }}>
                <div>
                  <div><strong>{ag.roleName}</strong></div>
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>Dept: {ag.department}</div>
                </div>
                <StatusBadge status="success">{ag.status.toUpperCase()}</StatusBadge>
              </div>
            ))}
          </Grid>
        </Stack>
      </Box>

      <Heading level={4}>Executive Director Recommendations</Heading>
      <Grid columns={2} gap="16px">
        {directorRecommendations.map((rec) => (
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
