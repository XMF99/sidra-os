import { FC, useState } from 'react';
import { Stack, Box, Heading, Text, StatusBadge, Button, Alert } from '@sidra/ui';

export interface AgentTask {
  id: string;
  stepNumber: number;
  title: string;
  assignedAgent: string;
  department: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Requires Approval';
  evidenceOutput?: string;
}

export interface MultiStepGoal {
  id: string;
  title: string;
  owner: string;
  workspaceContext: string;
  status: 'Active' | 'Paused' | 'Completed';
  progressPercent: number;
  tasks: AgentTask[];
}

export const WorkAgentCenterView: FC = () => {
  const [goals, setGoals] = useState<MultiStepGoal[]>([
    {
      id: 'goal-1',
      title: 'Prepare AAA Game Gold Master Release Candidate Package',
      owner: 'AI Studio Director',
      workspaceContext: 'AAA Game Studio Workspace',
      status: 'Active',
      progressPercent: 75,
      tasks: [
        { id: 't-1', stepNumber: 1, title: 'Shader Pre-compilation & Vulkan Stutter Fix', assignedAgent: 'Engine Programmer', department: 'Engineering', status: 'Completed', evidenceOutput: '0 Stutter Frames in 100 Run Passes' },
        { id: 't-2', stepNumber: 2, title: 'Perform 1,200 Playtest Automated QA Regressions', assignedAgent: 'QA Director', department: 'QA', status: 'Completed', evidenceOutput: '100% Pass Rate (0 Blocker Bugs)' },
        { id: 't-3', stepNumber: 3, title: 'Approve Gold Master Release Store Package', assignedAgent: 'Release Manager', department: 'Publishing', status: 'Requires Approval', evidenceOutput: 'Steam & PS5 Package Cryptographically Signed' },
        { id: 't-4', stepNumber: 4, title: 'Deploy Season 4 Battle Pass LiveOps Addressables', assignedAgent: 'LiveOps Manager', department: 'LiveOps', status: 'Pending' },
      ],
    },
  ]);

  const activeGoal = goals[0];

  const handleApproveStep = (taskId: string) => {
    setGoals((prev) =>
      prev.map((g) => ({
        ...g,
        tasks: g.tasks.map((t) => (t.id === taskId ? { ...t, status: 'Completed' } : t)),
      }))
    );
  };

  const handleTogglePause = (goalId: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, status: g.status === 'Active' ? 'Paused' : 'Active' } : g))
    );
  };

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Heading level={3}>Work Agent Center — Multi-Step Autonomous Agent Work</Heading>
          <Text color="secondary">
            Orchestrates multi-step agent goals, task decomposition DAGs, execution queues, approval requests, and evidence collection via THEKY Mission Engine.
          </Text>
        </div>
        <Button variant="primary" size="md">
          Create Multi-Step Goal
        </Button>
      </div>

      {/* Goal Summary Card */}
      <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-accent, #6366f1)">
        <Stack gap="14px">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Heading level={4}>{activeGoal.title}</Heading>
              <Text size="xs" color="muted">Owner: {activeGoal.owner} • Context: {activeGoal.workspaceContext}</Text>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <StatusBadge status={activeGoal.status === 'Active' ? 'success' : 'pending'}>
                {activeGoal.status.toUpperCase()}
              </StatusBadge>
              <Button variant="secondary" size="sm" onClick={() => handleTogglePause(activeGoal.id)}>
                {activeGoal.status === 'Active' ? 'Pause Goal' : 'Resume Goal'}
              </Button>
            </div>
          </div>

          <div style={{ fontSize: 13 }}>
            Progress: <strong>{activeGoal.progressPercent}% Complete</strong>
          </div>

          {/* Task Decomposition Execution Queue */}
          <Heading level={4}>Task Decomposition & Execution Queue</Heading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeGoal.tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: '#1a1f2c',
                  borderRadius: 6,
                  borderLeft: task.status === 'Completed' ? '4px solid #34d399' : task.status === 'Requires Approval' ? '4px solid #eab308' : '4px solid #6366f1',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    Step {task.stepNumber}: {task.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                    Agent: {task.assignedAgent} ({task.department}) {task.evidenceOutput && `• Evidence: ${task.evidenceOutput}`}
                  </div>
                </div>

                <div>
                  {task.status === 'Requires Approval' ? (
                    <Button variant="primary" size="sm" onClick={() => handleApproveStep(task.id)}>
                      Approve & Execute Step
                    </Button>
                  ) : (
                    <StatusBadge status={task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'active' : 'pending'}>
                      {task.status.toUpperCase()}
                    </StatusBadge>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Alert type="info" title="Mission Engine Task Dispatch Traceability:">
            Every step execution writes cryptographic transaction hashes to Vault and updates Shared Memory context.
          </Alert>
        </Stack>
      </Box>
    </Stack>
  );
};
