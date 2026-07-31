import { FC } from 'react';
import { useGameStudioStore } from '../../state/useGameStudioStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const DesignArtProductionView: FC = () => {
  const { games } = useGameStudioStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Game Design & Art Production Pipeline</Heading>
      <Text color="secondary">
        Monitors Game Design Documents (GDD), core loops, mechanics balancing, 2D/3D art assets, concept art, and animation libraries.
      </Text>

      <Grid columns={2} gap="16px">
        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Active Game Titles & Engine Targets</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {games.map((g) => (
                <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div>
                    <div><strong>{g.title}</strong></div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Engine: {g.engine} • Platforms: {g.targetPlatform}</div>
                  </div>
                  <StatusBadge status="success">{g.pipelineStage.toUpperCase()}</StatusBadge>
                </div>
              ))}
            </div>
          </Stack>
        </Box>

        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Art Asset Pipeline Status</Heading>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>3D Character Models & Rigs:</span>
                <span><strong style={{ color: '#34d399' }}>100% Complete</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Environment Meshes & Textures:</span>
                <span><strong style={{ color: '#34d399' }}>98% Complete</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>VFX & Particle Shaders:</span>
                <span><strong style={{ color: '#34d399' }}>96% Complete</strong></span>
              </div>
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
