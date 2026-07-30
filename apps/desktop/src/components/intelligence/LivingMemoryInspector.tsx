import { FC, useState } from 'react';
import { useIntelligenceCoreStore } from '../../state/useIntelligenceCoreStore';
import { Stack, Box, Heading, Text, TextInput, StatusBadge, Icon } from '@sidra/ui';

export const LivingMemoryInspector: FC = () => {
  const { memories } = useIntelligenceCoreStore();
  const [search, setSearch] = useState('');

  const filtered = memories.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.summary.toLowerCase().includes(search.toLowerCase()) ||
    m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Living Organization Memory Index</Heading>
      <Text color="secondary">
        Persistent, queryable institutional memory storing past projects, decisions, approvals, rejected alternatives, and lessons learned.
      </Text>

      <TextInput
        placeholder="Query institutional memory (e.g. 'Tokio', 'Vault', 'Analytics')..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Icon name="Search" size={14} />}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((mem) => (
          <Box
            key={mem.id}
            padding="16px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="8px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StatusBadge status={mem.impactLevel === 'High' ? 'active' : 'neutral'}>
                    {mem.category.toUpperCase()}
                  </StatusBadge>
                  <Text weight="semibold" color="primary">{mem.title}</Text>
                </div>
                <Text size="xs" color="muted">{new Date(mem.timestamp).toLocaleDateString()}</Text>
              </div>

              <Text size="xs" color="secondary">{mem.summary}</Text>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {mem.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: 10,
                      padding: '2px 8px',
                      borderRadius: 4,
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      color: '#818cf8',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
