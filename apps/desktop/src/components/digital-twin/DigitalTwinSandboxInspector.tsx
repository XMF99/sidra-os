import { FC } from 'react';
import { useDigitalTwinStore } from '../../state/useDigitalTwinStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Button, Alert } from '@sidra/ui';

export const DigitalTwinSandboxInspector: FC = () => {
  const { snapshots, activeSnapshotId, restoreSnapshot, createSnapshot } = useDigitalTwinStore();

  const activeSnap = snapshots.find((s) => s.id === activeSnapshotId) ?? snapshots[0];

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Box
        padding="24px"
        bg="linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)"
        borderRadius="8px"
        border="1px solid rgba(16, 185, 129, 0.3)"
      >
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Heading level={2}>Digital Twin Engine Sandbox</Heading>
              <Text size="xs" color="muted">Active Snapshot: <strong>{activeSnap.name}</strong></Text>
            </div>
            <StatusBadge status="success">ZERO PRODUCTION MUTATION SANDBOX ACTIVE</StatusBadge>
          </div>

          <Text color="secondary">
            All simulations, What-If queries, and scenario comparisons execute strictly inside the isolated Digital Twin Engine sandbox.
          </Text>

          <Alert type="info" title="Sandbox Guard Invariant:">
            Production workspace databases, event stores, and active Tokio tasks are guaranteed 100% immutable during simulation.
          </Alert>
        </Stack>
      </Box>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Heading level={3}>Digital Twin Snapshots ({snapshots.length})</Heading>
        <Button variant="outline" size="sm" onClick={() => createSnapshot(`Custom Snapshot ${Date.now()}`)}>
          Create Snapshot
        </Button>
      </div>

      <Grid columns={2} gap="16px">
        {snapshots.map((snap) => {
          const isActive = snap.id === activeSnapshotId;
          return (
            <Box
              key={snap.id}
              padding="18px"
              bg="var(--sd-color-surface-raised, #12151e)"
              borderRadius="8px"
              border={isActive ? '2px solid var(--sd-color-accent, #6366f1)' : '1px solid var(--sd-color-border-subtle, #242938)'}
            >
              <Stack gap="10px">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text weight="semibold" color="primary">{snap.name}</Text>
                  <StatusBadge status={isActive ? 'success' : 'neutral'}>
                    {isActive ? 'ACTIVE TWIN' : 'SNAPSHOT'}
                  </StatusBadge>
                </div>

                <Text size="xs" color="muted">
                  Entities: {snap.nodesCount} • Spaces: {snap.spacesCount} • Capabilities: {snap.capabilitiesCount}
                </Text>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text size="xs" color="muted">{new Date(snap.timestamp).toLocaleString()}</Text>
                  {!isActive && (
                    <Button variant="ghost" size="sm" onClick={() => restoreSnapshot(snap.id)}>
                      Restore Snapshot
                    </Button>
                  )}
                </div>
              </Stack>
            </Box>
          );
        })}
      </Grid>
    </Stack>
  );
};
