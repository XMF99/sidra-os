import { FC, useState } from 'react';
import { useCapabilityIntelligenceStore } from '../../state/useCapabilityIntelligenceStore';
import { Stack, Box, Heading, Text, TextInput, Button, Alert } from '@sidra/ui';

export const CapabilityComposerView: FC = () => {
  const { registerCapability } = useCapabilityIntelligenceStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Engineering' | 'Marketing' | 'Operations' | 'Finance' | 'Customer Support' | 'Legal'>('Engineering');
  const [description, setDescription] = useState('');

  const handleRegister = () => {
    if (!name.trim()) return;
    registerCapability({
      name,
      version: '1.0.0',
      category,
      owner: 'Principal Architect',
      description: description || 'Custom composed business capability',
      lifecycleState: 'Draft',
      composedModels: ['claude-3-5-sonnet'],
      composedTools: ['mcp-fs', 'mcp-git'],
      composedConnectors: ['GitHub Enterprise'],
      dependencies: [],
      permissionsRequired: ['basic_access'],
    });

    setName('');
    setDescription('');
  };

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Capability Composition Workspace</Heading>
      <Text color="secondary">
        Compose new Business Capabilities by combining AI Models, MCP Servers, Connectors, Prompts, and Security Policies.
      </Text>

      <Box padding="24px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-accent, #6366f1)">
        <Stack gap="16px">
          <Heading level={4}>Compose New Capability</Heading>

          <div>
            <Text size="xs" color="muted">Capability Name:</Text>
            <TextInput
              placeholder="e.g. Automated Code Certification Pipeline..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Text size="xs" color="muted">Business Category:</Text>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {(['Engineering', 'Marketing', 'Operations', 'Finance', 'Customer Support', 'Legal'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    backgroundColor: cat === category ? 'var(--sd-color-accent, #6366f1)' : '#050608',
                    color: '#ffffff',
                    border: '1px solid #2e3548',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Text size="xs" color="muted">Description:</Text>
            <TextInput
              placeholder="Describe business function and expected outcomes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Alert type="info" title="Default Composed Components Attached:">
            Model: Claude 3.5 Sonnet • Tools: Filesystem MCP, Git MCP • Connector: GitHub Enterprise
          </Alert>

          <Button variant="primary" onClick={handleRegister}>
            Save Composed Capability Draft
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
};
