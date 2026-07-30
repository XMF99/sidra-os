import { FC } from 'react';
import { useCapabilityPlatformStore } from '../../state/useCapabilityPlatformStore';
import { Stack, Box, Heading, Text, StatusBadge, Button, Alert, Icon } from '@sidra/ui';

export const WorkspaceBlueprintEditor: FC = () => {
  const { blueprints, activeBlueprintId, duplicateBlueprint, forkBlueprint, publishBlueprint, generateWorkspaceFromBlueprint } = useCapabilityPlatformStore();

  const blueprint = blueprints.find((b) => b.id === activeBlueprintId) ?? blueprints[0];

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
              <Heading level={2}>{blueprint.name}</Heading>
              <Text size="xs" color="muted">Version {blueprint.version} • Variant: {blueprint.variantType}</Text>
            </div>
            <StatusBadge status={blueprint.published ? 'success' : 'pending'}>
              {blueprint.published ? 'PUBLISHED TO ORG' : 'DRAFT ASSET'}
            </StatusBadge>
          </div>

          <Text color="secondary">{blueprint.description}</Text>

          <Alert type="info" title={`THEKY Confidence Score: ${blueprint.thekyConfidenceScore}%`}>
            {blueprint.confidenceExplanation}
          </Alert>

          <div>
            <Text size="xs" weight="semibold" color="muted">Business Goals:</Text>
            <ul style={{ margin: '4px 0 0 16px', fontSize: 13, color: '#94a3b8' }}>
              {blueprint.businessGoals.map((goal, idx) => (
                <li key={idx}>{goal}</li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Button
              variant="primary"
              rightIcon={<Icon name="Check" size={16} />}
              onClick={() => generateWorkspaceFromBlueprint(blueprint.id)}
            >
              Generate Workspace
            </Button>
            <Button
              variant="secondary"
              leftIcon={<Icon name="Copy" size={16} />}
              onClick={() => duplicateBlueprint(blueprint.id)}
            >
              Duplicate Asset
            </Button>
            <Button
              variant="secondary"
              leftIcon={<Icon name="GitFork" size={16} />}
              onClick={() => forkBlueprint(blueprint.id)}
            >
              Fork Blueprint
            </Button>
            <Button
              variant="outline"
              leftIcon={<Icon name="Share2" size={16} />}
              onClick={() => publishBlueprint(blueprint.id)}
            >
              Publish to Org Library
            </Button>
          </div>
        </Stack>
      </Box>
    </Stack>
  );
};
