import { FC } from 'react';
import { Stack, Box, Heading, Text, Alert } from '@sidra/ui';

export const ExecutiveBriefingCenterView: FC = () => {
  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Executive Briefing Center</Heading>
      <Text color="secondary">
        Delivers morning briefings, evening summaries, weekly executive reports, monthly reviews, and quarterly strategic reviews.
      </Text>

      <Box padding="24px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
        <Stack gap="14px">
          <Heading level={4}>Quarterly Strategic Executive Review (Q3 2026)</Heading>
          <Text size="xs" color="secondary">
            Enterprise operating at 98% health score. ARR at $12.4M with 28 months cash runway. Zero critical security incidents.
          </Text>

          <Alert type="success" title="Executive Key Takeaways:">
            <ul style={{ margin: '4px 0 0 16px', fontSize: 12 }}>
              <li>Game Studio Enterprise Solution fully operational across 3 departments.</li>
              <li>Platform Architecture Frozen and certified with 100/100 readiness score.</li>
            </ul>
          </Alert>
        </Stack>
      </Box>
    </Stack>
  );
};
