import { FC } from 'react';
import { Stack, Box, Heading, Text, Grid, StatusBadge } from '@sidra/ui';

export const EngineeringAudioView: FC = () => {
  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Engineering Pipeline & Audio Production</Heading>
      <Text color="secondary">
        Monitors C++/Rust engine build pipelines, Perforce/Git branch health, spatial audio mixing, dynamic music cues, and SFX asset tracking.
      </Text>

      <Grid columns={2} gap="16px">
        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={4}>Game Engine Build Pipelines & CI/CD</Heading>
              <StatusBadge status="success">BUILD PASS</StatusBadge>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Unreal Engine 5 C++ Client Build:</span>
                <span><strong>Passed (6.2 min)</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Custom Rust Multiplayer Dedicated Server:</span>
                <span><strong>Passed (42 sec)</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2e3548', paddingTop: 6 }}>
                <span>Perforce LFS Main Stream Sync:</span>
                <span><strong style={{ color: '#34d399' }}>100% Synced</strong></span>
              </div>
            </div>
          </Stack>
        </Box>

        <Box padding="22px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={4}>Audio Engineering & Mixing</Heading>
              <StatusBadge status="success">SPATIAL MIXED</StatusBadge>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Spatial Audio & SFX Cues:</span>
                <span><strong>1,840 Assets Active</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Interactive Music Stems & Mixing:</span>
                <span><strong>Dolby Atmos Certified</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2e3548', paddingTop: 6 }}>
                <span>Voice Localization (12 Languages):</span>
                <span><strong style={{ color: '#38bdf8' }}>100% Recorded</strong></span>
              </div>
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
