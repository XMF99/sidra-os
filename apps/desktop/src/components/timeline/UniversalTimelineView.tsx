import { FC } from 'react';
import { useContextEngineStore } from '../../state/useContextEngineStore';
import { Stack, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const UniversalTimelineView: FC = () => {
  const { timelineEvents } = useContextEngineStore();

  return (
    <Stack gap="16px" style={{ width: '100%' }}>
      <Heading level={3}>Live Universal Organizational Timeline</Heading>
      <Text size="xs" color="muted">Real-time audit log of mission completions, blueprint updates, and security events.</Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {timelineEvents.map((evt) => (
          <Box
            key={evt.id}
            padding="14px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="6px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text weight="semibold" color="primary">{evt.title}</Text>
                <StatusBadge status="neutral">{evt.actor.toUpperCase()}</StatusBadge>
              </div>
              <Text size="xs" color="muted">{evt.description}</Text>
              <Text size="xs" color="muted" style={{ fontSize: 10, color: '#6b7280' }}>
                {new Date(evt.timestamp).toLocaleString()}
              </Text>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
