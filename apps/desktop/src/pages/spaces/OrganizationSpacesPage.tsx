import { FC, useState } from 'react';
import { useOrganizationSpacesStore } from '../../state/useOrganizationSpacesStore';
import { SpaceTemplateSelector } from '../../components/spaces/SpaceTemplateSelector';
import { TeamAISettingsView } from '../../components/spaces/TeamAISettingsView';
import { Heading, Text, Stack } from '@sidra/ui';

export const OrganizationSpacesPage: FC = () => {
  const { spaces, activeSpaceId, selectSpace } = useOrganizationSpacesStore();
  const [subView, setSubView] = useState<'spaces' | 'create' | 'team-ai'>('spaces');

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Sidebar for Spaces */}
      <div
        style={{
          width: 260,
          backgroundColor: 'var(--sd-color-surface-raised, #12151e)',
          borderRight: '1px solid var(--sd-color-border-subtle, #242938)',
          padding: 16,
          boxSizing: 'border-box',
        }}
      >
        <Stack gap="16px">
          <Heading level={4}>Organization Spaces</Heading>
          <Text size="xs" color="muted">Collaborative environments with Team AI context boundaries.</Text>

          <button
            onClick={() => setSubView('create')}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              backgroundColor: 'var(--sd-color-accent, #6366f1)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            + Create New Space
          </button>

          <div style={{ marginTop: 8 }}>
            {spaces.map((space) => {
              const isActive = space.id === activeSpaceId;
              return (
                <div
                  key={space.id}
                  onClick={() => {
                    selectSpace(space.id);
                    setSubView('team-ai');
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 6,
                    backgroundColor: isActive ? 'var(--sd-color-surface-overlay, #1a1e2b)' : 'transparent',
                    border: isActive ? '1px solid var(--sd-color-accent, #6366f1)' : '1px solid transparent',
                    cursor: 'pointer',
                    marginBottom: 6,
                  }}
                >
                  <Text weight={isActive ? 'semibold' : 'regular'} size="sm" color="primary">
                    {space.name}
                  </Text>
                  <Text size="xs" color="muted" style={{ display: 'block', marginTop: 2 }}>
                    {space.type} • {space.members.length} Members
                  </Text>
                </div>
              );
            })}
          </div>
        </Stack>
      </div>

      {/* Main Body */}
      <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        {subView === 'create' && <SpaceTemplateSelector />}
        {(subView === 'team-ai' || subView === 'spaces') && <TeamAISettingsView />}
      </div>
    </div>
  );
};
