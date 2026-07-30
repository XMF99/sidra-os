import { FC } from 'react';
import { useAutonomousOrgStore } from '../../state/useAutonomousOrgStore';
import { Stack, Box, Heading, Text, Button, Alert, StatusBadge, Icon } from '@sidra/ui';

export const DailyBriefingEngineView: FC = () => {
  const { briefings, triggerDailyMorningBriefing } = useAutonomousOrgStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Heading level={3}>Daily Organization Engine & Morning Briefing ⭐</Heading>
          <Text color="secondary">
            Automatically conducts morning briefings, distributes tasks, detects risks, and compiles executive summaries.
          </Text>
        </div>
        <Button
          variant="primary"
          leftIcon={<Icon name="Sun" size={16} />}
          onClick={triggerDailyMorningBriefing}
        >
          Trigger Morning Briefing
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {briefings.map((brf) => (
          <Box
            key={brf.id}
            padding="24px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-accent, #6366f1)"
          >
            <Stack gap="14px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Heading level={4}>Morning Briefing — {brf.date}</Heading>
                <StatusBadge status="success">{brf.aiAutonomyPercent}% AI AUTONOMY</StatusBadge>
              </div>

              <Text size="xs" color="secondary">{brf.summary}</Text>

              <Alert type="warning" title="Detected Operational Risks & Bottlenecks:">
                <ul style={{ margin: '4px 0 0 16px', fontSize: 12 }}>
                  {brf.topRisks.map((risk, i) => (
                    <li key={i}>{risk}</li>
                  ))}
                </ul>
              </Alert>

              <Text size="xs" color="muted">
                Task Assignments Distributed: <strong>{brf.taskAssignmentsCount} Tasks</strong> across hybrid human-AI teams.
              </Text>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
