import { FC, useState } from 'react';
import { useOnboardingStore } from '../../state/useOnboardingStore';
import { Stack, Grid, Box, Heading, Text, TextInput, Button, Icon, StatusBadge } from '@sidra/ui';

export const IndustryCatalogStep: FC = () => {
  const { selectedIndustryId, setIndustryDetails, nextStep, prevStep } = useOnboardingStore();
  const [search, setSearch] = useState('');

  const catalog = [
    { id: 'ind-software', name: 'Software & Technology', category: 'Technology', desc: 'Software engineering, DevOps, and cloud systems' },
    { id: 'ind-ai', name: 'Artificial Intelligence', category: 'Technology', desc: 'AI research, LLM orchestration, and model evaluation' },
    { id: 'ind-gamedev', name: 'Game Development', category: 'Creative', desc: 'Game engines, asset pipelines, and narrative AI' },
    { id: 'ind-finance', name: 'Finance & Banking', category: 'Enterprise', desc: 'Financial modeling, compliance, and risk analytics' },
    { id: 'ind-healthcare', name: 'Healthcare & Biotech', category: 'Science', desc: 'Clinical data, HIPAA compliance, and research vault' },
    { id: 'ind-construction', name: 'Construction & Engineering', category: 'Industrial', desc: 'BIM models, site safety, and contractor workflows' },
  ];

  const filtered = catalog.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) || item.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box
      padding="36px"
      bg="var(--sd-color-surface-raised, #12151e)"
      borderRadius="12px"
      border="1px solid var(--sd-color-border-subtle, #242938)"
      style={{ maxWidth: 720, width: '100%', margin: '0 auto' }}
    >
      <Stack gap="20px">
        <div>
          <Heading level={2}>Searchable Industry Catalog</Heading>
          <Text color="secondary">
            Select your primary sector to configure default workflow templates and sub-agent capabilities.
          </Text>
        </div>

        <TextInput
          placeholder="Search industry catalog (e.g. Software, Finance, Healthcare)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Icon name="Search" size={16} />}
        />

        <Grid columns={2} gap="12px">
          {filtered.map((ind) => {
            const isSelected = ind.id === selectedIndustryId;
            return (
              <Box
                key={ind.id}
                padding="16px"
                bg="var(--sd-color-surface-sunken, #050608)"
                borderRadius="8px"
                border={isSelected ? '2px solid var(--sd-color-accent, #6366f1)' : '1px solid var(--sd-color-border-default, #2e3548)'}
                style={{ cursor: 'pointer' }}
                onClick={() => setIndustryDetails(ind.id)}
              >
                <Stack gap="6px">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text weight="semibold" color="primary">{ind.name}</Text>
                    {isSelected && <StatusBadge status="active">SELECTED</StatusBadge>}
                  </div>
                  <Text size="xs" color="muted">{ind.desc}</Text>
                </Stack>
              </Box>
            );
          })}
        </Grid>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <Button variant="ghost" onClick={prevStep}>
            Back
          </Button>
          <Button
            variant="primary"
            rightIcon={<Icon name="ArrowRight" size={16} />}
            onClick={nextStep}
          >
            Continue to AI Discovery Interview
          </Button>
        </div>
      </Stack>
    </Box>
  );
};
