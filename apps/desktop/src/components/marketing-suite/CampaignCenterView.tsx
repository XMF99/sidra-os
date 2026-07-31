import { FC } from 'react';
import { useMarketingGrowthStore } from '../../state/useMarketingGrowthStore';
import { Stack, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const CampaignCenterView: FC = () => {
  const { campaigns } = useMarketingGrowthStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Omni-Channel Campaign & Automation Center</Heading>
      <Text color="secondary">
        Manages multi-channel marketing campaigns, ad spend tracking, lead generation velocity, and ROAS yield.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {campaigns.map((cmp) => (
          <Box
            key={cmp.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="10px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Heading level={4}>{cmp.title}</Heading>
                  <Text size="xs" color="muted">Channel: {cmp.channel} • Budget: ${cmp.budget.toLocaleString()} • Spent: ${cmp.spent.toLocaleString()}</Text>
                </div>
                <StatusBadge status="success">{cmp.status.toUpperCase()}</StatusBadge>
              </div>

              <div style={{ fontSize: 12, color: '#9ca3af' }}>
                Leads Generated: <strong>{cmp.leadsGenerated} Leads</strong> • ROAS Yield: <strong style={{ color: '#34d399' }}>{cmp.roasMultiplier}x ROAS</strong>
              </div>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
