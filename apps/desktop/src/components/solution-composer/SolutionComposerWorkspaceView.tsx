import { FC, useState } from 'react';
import { useBusinessSolutionStore } from '../../state/useBusinessSolutionStore';
import { Stack, Box, Heading, Text, TextInput, Button, Alert } from '@sidra/ui';

export const SolutionComposerWorkspaceView: FC = () => {
  const { registerSolution } = useBusinessSolutionStore();

  const [name, setName] = useState('');
  const [domain, setDomain] = useState<'Game Studio' | 'Enterprise ERP' | 'CRM & Sales' | 'HR & Workforce' | 'Finance & Accounting' | 'Software Company'>('Game Studio');
  const [description, setDescription] = useState('');

  const handleRegister = () => {
    if (!name.trim()) return;
    registerSolution({
      name,
      version: '1.0.0',
      domain,
      owner: 'Principal Architect',
      description: description || 'Custom composed business solution',
      lifecycleState: 'Draft',
      includedCapabilityIds: ['cap-gamedev', 'cap-invoice'],
      requiredConnectors: ['GitHub Enterprise', 'Stripe Workspace'],
      securityProfile: 'Standard Enterprise',
    });

    setName('');
    setDescription('');
  };

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Business Solution Composer Workspace</Heading>
      <Text color="secondary">
        Compose complete enterprise domain solutions by connecting multiple Business Capabilities and enforcing policy inheritance.
      </Text>

      <Box padding="24px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-accent, #6366f1)">
        <Stack gap="16px">
          <Heading level={4}>Compose Enterprise Solution</Heading>

          <div>
            <Text size="xs" color="muted">Solution Title:</Text>
            <TextInput
              placeholder="e.g. Next-Gen Game Studio Enterprise Solution..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Text size="xs" color="muted">Enterprise Domain:</Text>
            <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              {(['Game Studio', 'Enterprise ERP', 'CRM & Sales', 'HR & Workforce', 'Finance & Accounting', 'Software Company'] as const).map((dom) => (
                <button
                  key={dom}
                  onClick={() => setDomain(dom)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    backgroundColor: dom === domain ? 'var(--sd-color-accent, #6366f1)' : '#050608',
                    color: '#ffffff',
                    border: '1px solid #2e3548',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {dom}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Text size="xs" color="muted">Description:</Text>
            <TextInput
              placeholder="Describe business domain scope and capabilities included..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Alert type="info" title="Composed Capabilities & Policy Inheritance:">
            Includes: Game Studio Master Pipeline + Automated Invoice Processing • Inherits SHA-256 Event Vault Lock Policy
          </Alert>

          <Button variant="primary" onClick={handleRegister}>
            Save Enterprise Solution Draft
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
};
