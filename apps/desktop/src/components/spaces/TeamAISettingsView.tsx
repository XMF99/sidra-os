import { FC } from 'react';
import { useOrganizationSpacesStore } from '../../state/useOrganizationSpacesStore';
import { Stack, Box, Heading, Text, Alert, StatusBadge, Button } from '@sidra/ui';

export const TeamAISettingsView: FC = () => {
  const { spaces, activeSpaceId, updateTeamAIContext } = useOrganizationSpacesStore();

  const activeSpace = spaces.find((s) => s.id === activeSpaceId) ?? spaces[0];

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Box
        padding="24px"
        bg="var(--sd-color-surface-raised, #12151e)"
        borderRadius="8px"
        border="1px solid var(--sd-color-border-subtle, #242938)"
      >
        <Stack gap="16px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Heading level={3}>{activeSpace.name} — Team AI Isolation</Heading>
              <Text size="xs" color="muted">Memory Scope: {activeSpace.aiContextRules.isolatedMemoryScope}</Text>
            </div>
            <StatusBadge status="success">TEAM AI ISOLATION ENFORCED</StatusBadge>
          </div>

          <Alert type="info" title="Context Isolation Boundary:">
            {activeSpace.aiContextRules.systemPromptBoundary}
          </Alert>

          <div>
            <Text size="xs" weight="semibold" color="muted">Space Members ({activeSpace.members.length}):</Text>
            <ul style={{ margin: '4px 0 0 16px', fontSize: 13, color: '#94a3b8' }}>
              {activeSpace.members.map((m) => (
                <li key={m.id}>
                  <strong>{m.name}</strong> ({m.role}) — {m.email}
                </li>
              ))}
            </ul>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateTeamAIContext(
                activeSpace.id,
                `${activeSpace.type} AI Context Updated: Enforcing strict memory boundary for ${activeSpace.name}.`
              )
            }
          >
            Update Team AI Memory Boundary
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
};
