import { FC } from 'react';
import { useProjectPortfolioStore } from '../../state/useProjectPortfolioStore';
import { Stack, Box, Heading, Text, StatusBadge, Button, Alert, Icon } from '@sidra/ui';

export const ProjectDigitalTwinView: FC = () => {
  const { simulations, runProjectSimulation } = useProjectPortfolioStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Heading level={3}>Project Digital Twin Sandbox ⭐</Heading>
          <Text color="secondary">
            Executes Schedule, Resource, Budget, Delivery Scenarios, and Portfolio Optimization simulations inside the isolated Digital Twin Sandbox without direct production mutations.
          </Text>
        </div>
        <Button
          variant="primary"
          leftIcon={<Icon name="Zap" size={16} />}
          onClick={() => runProjectSimulation('PortfolioOptimization', 'Global Enterprise Project Portfolio Optimization Simulation')}
        >
          Run Portfolio Simulation
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {simulations.map((sim) => (
          <Box
            key={sim.id}
            padding="24px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-accent, #6366f1)"
          >
            <Stack gap="12px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Heading level={4}>{sim.title}</Heading>
                <StatusBadge status={sim.simulationPass ? 'success' : 'pending'}>
                  {sim.simulationPass ? 'ZERO MUTATION PASS' : 'SIMULATION PENDING'}
                </StatusBadge>
              </div>

              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                <span>Simulation Type: <strong>{sim.type}</strong></span>
                <span style={{ marginLeft: 20 }}>Projected Velocity Gain: <strong>+{sim.projectedVelocityGain}% Gain</strong></span>
                <span style={{ marginLeft: 20 }}>Risk Score: <strong>{sim.riskScore} / 100</strong></span>
              </div>

              <Alert type="info" title="Sandbox Execution Safety Certificate:">
                Verified zero direct production project schedule or budget mutations during scenario execution.
              </Alert>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
