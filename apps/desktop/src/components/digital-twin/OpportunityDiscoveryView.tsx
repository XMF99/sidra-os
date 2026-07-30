import { FC } from 'react';
import { useDigitalTwinStore } from '../../state/useDigitalTwinStore';
import { Stack, Box, Heading, Text, StatusBadge, Button, Icon } from '@sidra/ui';

export const OpportunityDiscoveryView: FC = () => {
  const { opportunities } = useDigitalTwinStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Proactive Opportunity Discovery Engine ⭐</Heading>
      <Text color="secondary">
        Continuously analyzes capability usage, blueprints, and workflow patterns to surface hidden operational opportunities.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {opportunities.map((opp) => (
          <Box
            key={opp.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="10px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="Sparkles" size={18} color="var(--sd-color-accent, #6366f1)" />
                  <Heading level={4}>{opp.title}</Heading>
                </div>
                <StatusBadge status="success">IMPACT: {opp.estimatedImpact}</StatusBadge>
              </div>

              <Text size="xs" color="secondary">{opp.description}</Text>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <Text size="xs" color="muted">Category: <strong>{opp.type}</strong></Text>
                <Button variant="primary" size="sm">
                  Apply Opportunity Recommendation
                </Button>
              </div>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
