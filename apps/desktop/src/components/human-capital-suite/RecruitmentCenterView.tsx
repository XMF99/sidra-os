import { FC } from 'react';
import { useHumanCapitalStore } from '../../state/useHumanCapitalStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const RecruitmentCenterView: FC = () => {
  const { jobRequisitions, candidates } = useHumanCapitalStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Recruitment & Candidate Pipeline Center</Heading>
      <Text color="secondary">
        Manages job requisitions, candidate evaluation pipelines, match scoring %, and offer workflows.
      </Text>

      <Grid columns={2} gap="16px">
        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Active Job Requisitions</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {jobRequisitions.map((req) => (
                <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div>
                    <div><strong>{req.title}</strong></div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Dept: {req.department} • Openings: {req.openingsCount}</div>
                  </div>
                  <StatusBadge status="success">{req.status.toUpperCase()}</StatusBadge>
                </div>
              ))}
            </div>
          </Stack>
        </Box>

        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Candidate Pipeline</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {candidates.map((cnd) => (
                <div key={cnd.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div>
                    <div><strong>{cnd.name}</strong> ({cnd.matchScorePercent}% Match)</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Role: {cnd.appliedRole}</div>
                  </div>
                  <StatusBadge status="active">{cnd.stage.toUpperCase()}</StatusBadge>
                </div>
              ))}
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
