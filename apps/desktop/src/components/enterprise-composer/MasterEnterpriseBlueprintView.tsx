import { FC } from 'react';
import { useEnterpriseComposerStore } from '../../state/useEnterpriseComposerStore';
import { Stack, Box, Heading, Text, StatusBadge, Alert } from '@sidra/ui';

export const MasterEnterpriseBlueprintView: FC = () => {
  const { masterBlueprints } = useEnterpriseComposerStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Master Enterprise Architecture Blueprint ⭐</Heading>
      <Text color="secondary">
        Master architectural blueprint specifying complete organizational topology, operating models, role permissions, and governance rules.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {masterBlueprints.map((mblp) => (
          <Box
            key={mblp.id}
            padding="24px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-accent, #6366f1)"
          >
            <Stack gap="14px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Heading level={4}>{mblp.title}</Heading>
                <StatusBadge status="success">MASTER BLUEPRINT CERTIFIED</StatusBadge>
              </div>

              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                <div>Operating Model: <strong>{mblp.operatingModel}</strong></div>
                <div>Active Departments: <strong>{mblp.departmentsCount}</strong></div>
                <div>Assigned Enterprise Solutions: <strong>{mblp.solutionsCount}</strong></div>
                <div>Deployed AI Sub-Agents: <strong>{mblp.aiWorkersCount} Workers</strong></div>
              </div>

              <Alert type="info" title="Governance & Security Policies Mandated:">
                <ul style={{ margin: '4px 0 0 16px', fontSize: 12 }}>
                  {mblp.governanceRules.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
              </Alert>

              <Text size="xs" color="muted" style={{ fontSize: 10 }}>
                Generated: {new Date(mblp.generatedAt).toLocaleString()}
              </Text>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
