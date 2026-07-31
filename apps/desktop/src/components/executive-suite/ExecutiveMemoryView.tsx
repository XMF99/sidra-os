import { FC, useState } from 'react';
import { useExecutiveSuiteStore } from '../../state/useExecutiveSuiteStore';
import { Stack, Box, Heading, Text, TextInput, Button, StatusBadge } from '@sidra/ui';

export const ExecutiveMemoryView: FC = () => {
  const { executiveMemory, addExecutiveMemoryNote, searchQuery, setSearchQuery } = useExecutiveSuiteStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const filtered = executiveMemory.filter(
    (mem) =>
      mem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNote = () => {
    if (!title.trim() || !content.trim()) return;
    addExecutiveMemoryNote(title, 'Executive Notes' as any, content);
    setTitle('');
    setContent('');
  };

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Searchable Executive Memory & Knowledge Index</Heading>
      <Text color="secondary">
        Search historical decisions, meeting summaries, strategic milestones, and executive lessons learned.
      </Text>

      <TextInput
        placeholder="Search executive memory by title or content keywords..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-accent, #6366f1)">
        <Stack gap="12px">
          <Heading level={4}>Log Executive Memory Note</Heading>
          <TextInput placeholder="Title (e.g. Q3 Board Meeting Consensus)..." value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextInput placeholder="Executive note content..." value={content} onChange={(e) => setContent(e.target.value)} />
          <Button variant="primary" size="sm" onClick={handleAddNote}>
            Save Executive Note
          </Button>
        </Stack>
      </Box>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map((mem) => (
          <Box
            key={mem.id}
            padding="18px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="8px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text weight="semibold" color="primary">{mem.title}</Text>
                <StatusBadge status="active">{mem.category.toUpperCase()}</StatusBadge>
              </div>

              <Text size="xs" color="secondary">{mem.content}</Text>

              <Text size="xs" color="muted" style={{ fontSize: 10 }}>
                Logged: {new Date(mem.timestamp).toLocaleString()}
              </Text>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
