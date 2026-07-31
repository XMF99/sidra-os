import { FC } from 'react';
import { useGameStudioStore } from '../../state/useGameStudioStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Button } from '@sidra/ui';

export const QaLiveOpsView: FC = () => {
  const { qaBugs, resolveQaBug } = useGameStudioStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Quality Assurance, LiveOps & Store Publishing</Heading>
      <Text color="secondary">
        Manages QA bug tracking, automated playtest feedback, LiveOps seasonal events, and digital store publishing (Steam, PlayStation, Xbox, Epic).
      </Text>

      <Grid columns={2} gap="16px">
        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>QA Bug Tracker & Regression Board</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {qaBugs.map((bug) => (
                <div key={bug.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div>
                    <div><strong>{bug.title}</strong></div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Severity: {bug.severity}</div>
                  </div>
                  {bug.status !== 'Resolved' ? (
                    <Button variant="primary" size="sm" onClick={() => resolveQaBug(bug.id)}>
                      Resolve Bug
                    </Button>
                  ) : (
                    <StatusBadge status="success">RESOLVED</StatusBadge>
                  )}
                </div>
              ))}
            </div>
          </Stack>
        </Box>

        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Digital Store Publishing Checklist</Heading>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Steamworks Store Package & Depot:</span>
                <StatusBadge status="success">CERTIFIED</StatusBadge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>PlayStation 5 Submission Package:</span>
                <StatusBadge status="success">APPROVED</StatusBadge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Xbox Series X Submission Package:</span>
                <StatusBadge status="success">APPROVED</StatusBadge>
              </div>
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
