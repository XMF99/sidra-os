import { FC, useState } from 'react';
import { useOrganizationSpacesStore, OrganizationSpace } from '../../state/useOrganizationSpacesStore';
import { Stack, Grid, Box, Heading, Text, TextInput, Button, StatusBadge, Icon } from '@sidra/ui';

export const SpaceTemplateSelector: FC = () => {
  const { createSpace } = useOrganizationSpacesStore();
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<OrganizationSpace['type']>('Engineering');
  const [description, setDescription] = useState('');

  const templates: { type: OrganizationSpace['type']; name: string; desc: string; icon: string }[] = [
    { type: 'Engineering', name: 'Engineering Space', desc: 'Software engineering, Rust crates, and code architecture', icon: 'Code' },
    { type: 'Marketing', name: 'Marketing Space', desc: 'Brand positioning, content campaigns, and product launches', icon: 'Target' },
    { type: 'Finance', name: 'Finance & Treasury Space', desc: 'Financial modeling, audit logs, and token cost ceilings', icon: 'DollarSign' },
    { type: 'HR', name: 'Human Resources Space', desc: 'Team onboarding, seat allocation, and organizational roles', icon: 'Users' },
    { type: 'Legal', name: 'Legal & Compliance Space', desc: 'Contract analysis, HIPAA/GDPR privilege, and compliance', icon: 'Scale' },
    { type: 'Operations', name: 'Operations & Logistics Space', desc: 'Operational task DAGs, SLA tracking, and site management', icon: 'Sliders' },
  ];

  const handleCreate = () => {
    if (!name.trim()) return;
    createSpace(name, selectedType, description || templates.find((t) => t.type === selectedType)?.desc || '');
    setName('');
    setDescription('');
  };

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Create New Organization Space</Heading>

      <TextInput
        label="Space Name"
        placeholder="e.g. Core Engineering Space"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div>
        <Text size="xs" weight="semibold" color="muted" style={{ marginBottom: 8, display: 'block' }}>
          Select Space Template:
        </Text>
        <Grid columns={3} gap="12px">
          {templates.map((tpl) => {
            const isSelected = tpl.type === selectedType;
            return (
              <Box
                key={tpl.type}
                padding="14px"
                bg="var(--sd-color-surface-sunken, #050608)"
                borderRadius="8px"
                border={isSelected ? '2px solid var(--sd-color-accent, #6366f1)' : '1px solid var(--sd-color-border-default, #2e3548)'}
                onClick={() => {
                  setSelectedType(tpl.type);
                  if (!name) setName(tpl.name);
                }}
                style={{ cursor: 'pointer' }}
              >
                <Stack gap="6px">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text weight="semibold" color="primary">{tpl.name}</Text>
                    {isSelected && <StatusBadge status="active">ACTIVE</StatusBadge>}
                  </div>
                  <Text size="xs" color="muted">{tpl.desc}</Text>
                </Stack>
              </Box>
            );
          })}
        </Grid>
      </div>

      <Button
        variant="primary"
        rightIcon={<Icon name="Plus" size={16} />}
        onClick={handleCreate}
      >
        Provision Space
      </Button>
    </Stack>
  );
};
