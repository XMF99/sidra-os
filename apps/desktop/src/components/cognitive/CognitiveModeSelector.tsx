import { FC } from 'react';
import { useCognitiveEngineStore, CognitiveMode } from '../../state/useCognitiveEngineStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Icon } from '@sidra/ui';

export const CognitiveModeSelector: FC = () => {
  const { activeMode, setActiveMode, strategyWeights, manualOverride } = useCognitiveEngineStore();

  const modes: { mode: CognitiveMode; label: string; desc: string; icon: string }[] = [
    { mode: 'Strategic', label: 'Strategic Mode', desc: 'Long-term goal alignment, market positioning, and roadmap planning', icon: 'Target' },
    { mode: 'Analytical', label: 'Analytical Mode', desc: 'Data decomposition, mathematical verification, and throughput metrics', icon: 'BarChart' },
    { mode: 'Creative', label: 'Creative Mode', desc: 'Generative exploration, novel UI layout proposals, and narrative scripting', icon: 'Sparkles' },
    { mode: 'Operational', label: 'Operational Mode', desc: 'Immediate execution, task DAG scheduling, and resource allocation', icon: 'Sliders' },
    { mode: 'Review', label: 'Review Mode', desc: 'Security token audit, compliance evaluation, and code quality inspection', icon: 'ShieldCheck' },
    { mode: 'Research', label: 'Research Mode', desc: 'Knowledge graph traversal, historical precedent query, and literature synthesis', icon: 'BookOpen' },
  ];

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Box
        padding="24px"
        bg="linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)"
        borderRadius="8px"
        border="1px solid rgba(168, 85, 247, 0.3)"
      >
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Heading level={2}>Adaptive Cognitive Modes & Strategy Composer</Heading>
              <Text size="xs" color="muted">Active Mode: <strong>{activeMode}</strong> {manualOverride ? '(Manual Override)' : '(Auto Adapted)'}</Text>
            </div>
            <StatusBadge status="active">DYNAMIC REASONING ACTIVE</StatusBadge>
          </div>

          <Text color="secondary">
            THEKY dynamically composes thinking strategies based on task intent and complexity.
          </Text>

          {/* Strategy Weights Visualizer */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            {strategyWeights.map((sw, idx) => (
              <div
                key={idx}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  backgroundColor: '#050608',
                  border: '1px solid #2e3548',
                  fontSize: 12,
                  color: '#c084fc',
                }}
              >
                <strong>{sw.weight}%</strong> {sw.mode}
              </div>
            ))}
          </div>
        </Stack>
      </Box>

      <Grid columns={3} gap="14px">
        {modes.map((m) => {
          const isSelected = m.mode === activeMode;
          return (
            <Box
              key={m.mode}
              padding="16px"
              bg="var(--sd-color-surface-raised, #12151e)"
              borderRadius="8px"
              border={isSelected ? '2px solid var(--sd-color-accent, #6366f1)' : '1px solid var(--sd-color-border-subtle, #242938)'}
              onClick={() => setActiveMode(m.mode, true)}
              style={{ cursor: 'pointer' }}
            >
              <Stack gap="8px">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name={m.icon} size={18} color="var(--sd-color-accent, #6366f1)" />
                    <Text weight="semibold" color="primary">{m.label}</Text>
                  </div>
                  {isSelected && <StatusBadge status="success">SELECTED</StatusBadge>}
                </div>
                <Text size="xs" color="muted">{m.desc}</Text>
              </Stack>
            </Box>
          );
        })}
      </Grid>
    </Stack>
  );
};
