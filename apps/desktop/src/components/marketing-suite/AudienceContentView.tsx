import { FC } from 'react';
import { useMarketingGrowthStore } from '../../state/useMarketingGrowthStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const AudienceContentView: FC = () => {
  const { segments } = useMarketingGrowthStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Audience Intelligence & AI Content Engine</Heading>
      <Text color="secondary">
        Monitors persona segmentation, intent signals, AI content recommendations, and creative asset management.
      </Text>

      <Grid columns={2} gap="16px">
        {segments.map((seg) => (
          <Box
            key={seg.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="10px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Heading level={4}>{seg.name}</Heading>
                  <Text size="xs" color="muted">Target Persona: {seg.targetPersona}</Text>
                </div>
                <StatusBadge status="active">{seg.engagementScore}% ENGAGEMENT</StatusBadge>
              </div>

              <Text size="xs" color="secondary">
                Segment Reach: <strong>{seg.leadCount} Verified Profiles</strong>
              </Text>
            </Stack>
          </Box>
        ))}
      </Grid>
    </Stack>
  );
};
