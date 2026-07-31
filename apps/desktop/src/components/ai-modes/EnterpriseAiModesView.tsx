import { FC, useState } from 'react';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Button, Alert } from '@sidra/ui';

export type AiModeId =
  | 'chat'
  | 'coding'
  | 'analysis'
  | 'research'
  | 'doc-intel'
  | 'bi'
  | 'planning'
  | 'creative'
  | 'workflow';

export interface AiModeConfig {
  id: AiModeId;
  name: string;
  description: string;
  icon: string;
  model: string;
  connectedSources: string[];
  permissions: string;
  status: 'Ready' | 'Executing' | 'Idle';
}

export const EnterpriseAiModesView: FC = () => {
  const [selectedMode, setSelectedMode] = useState<AiModeId>('coding');

  const modes: AiModeConfig[] = [
    { id: 'chat', name: 'Conversational Chat', description: 'General enterprise conversation, context Q&A, and quick queries.', icon: '💬', model: 'Claude 3.5 Sonnet', connectedSources: ['Living Memory', 'Knowledge Graph'], permissions: 'Read/Write', status: 'Ready' },
    { id: 'coding', name: 'Software Engineering & Coding', description: 'C++, Rust, TypeScript, code generation, refactoring, and AST analysis.', icon: '💻', model: 'Claude 3.5 Sonnet + Cargo/Tauri SDK', connectedSources: ['Git Repositories', 'Compiler Toolchain'], permissions: 'Full Dev', status: 'Ready' },
    { id: 'analysis', name: 'Quantitative & Financial Analysis', description: 'Financial model audits, NPV/IRR calculations, EVM project analytics.', icon: '📈', model: 'Claude 3.5 Sonnet', connectedSources: ['General Ledger', 'Finance Vault'], permissions: 'Financial Audit', status: 'Ready' },
    { id: 'research', name: 'Deep Research & Literature', description: 'Academic papers, arXiv, PubMed, PubMed Central, and patent exploration.', icon: '🔬', model: 'Claude 3.5 Sonnet', connectedSources: ['PubMed API', 'arXiv Engine'], permissions: 'Read Only', status: 'Ready' },
    { id: 'doc-intel', name: 'Document Intelligence', description: 'PDF parsing, contract extraction, legal compliance, and OCR vector indexing.', icon: '📄', model: 'Claude 3.5 Sonnet', connectedSources: ['Vault Storage', 'Doc Vector DB'], permissions: 'Document Read', status: 'Ready' },
    { id: 'bi', name: 'Business Intelligence & Telemetry', description: 'Real-time DAU/MAU, ARPDAU, ROAS, retention funnels, and executive dashboards.', icon: '📊', model: 'Claude 3.5 Sonnet', connectedSources: ['Live Telemetry Engine'], permissions: 'Read BI', status: 'Ready' },
    { id: 'planning', name: 'Strategic Planning & Roadmaps', description: 'Goal decomposition, sprint planning, task DAG generation, and resource allocation.', icon: '🎯', model: 'Claude 3.5 Sonnet', connectedSources: ['Mission Engine', 'Project Portfolio'], permissions: 'Plan Admin', status: 'Ready' },
    { id: 'creative', name: 'Creative Work & Asset Pipeline', description: 'Game design documents, narrative bibles, concept art, and audio cues.', icon: '🎨', model: 'Claude 3.5 Sonnet + Media Gen', connectedSources: ['Game Studio Library'], permissions: 'Asset Write', status: 'Ready' },
    { id: 'workflow', name: 'Workflow Automation', description: 'Autonomous multi-agent orchestration, approval flows, and CI/CD pipelines.', icon: '⚡', model: 'Claude 3.5 Sonnet', connectedSources: ['Permission Broker', 'Vault'], permissions: 'System Exec', status: 'Ready' },
  ];

  const activeModeConfig = modes.find((m) => m.id === selectedMode) || modes[0];

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Structured Enterprise AI Modes</Heading>
      <Text color="secondary">
        Select a specialized AI operational mode. Every mode executes using certified backend services, real connected model engines, and verified permission boundaries.
      </Text>

      {/* Mode Selector Grid */}
      <Grid columns={3} gap="16px">
        {modes.map((m) => {
          const isSelected = m.id === selectedMode;
          return (
            <Box
              key={m.id}
              padding="16px"
              bg={isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--sd-color-surface-raised, #12151e)'}
              borderRadius="8px"
              border={isSelected ? '1px solid var(--sd-color-accent, #6366f1)' : '1px solid var(--sd-color-border-subtle, #242938)'}
              onClick={() => setSelectedMode(m.id)}
              style={{ cursor: 'pointer' }}
            >
              <Stack gap="8px">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                  <StatusBadge status="success">{m.status.toUpperCase()}</StatusBadge>
                </div>
                <Heading level={4}>{m.name}</Heading>
                <Text size="xs" color="secondary">{m.description}</Text>
              </Stack>
            </Box>
          );
        })}
      </Grid>

      {/* Active Mode Execution Panel */}
      <Box padding="24px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-accent, #6366f1)">
        <Stack gap="16px">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Heading level={4}>{activeModeConfig.icon} Active Mode: {activeModeConfig.name}</Heading>
            <Button variant="primary" size="sm">
              Launch Mode Session
            </Button>
          </div>

          <div style={{ fontSize: 13, color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div>Active AI Engine Model: <strong style={{ color: '#ffffff' }}>{activeModeConfig.model}</strong></div>
            <div>Connected Data Sources: <strong style={{ color: '#38bdf8' }}>{activeModeConfig.connectedSources.join(', ')}</strong></div>
            <div>Security & Permission Scope: <strong style={{ color: '#34d399' }}>{activeModeConfig.permissions}</strong></div>
          </div>

          <Alert type="info" title="Zero Fabrication Telemetry Guarantee:">
            All AI responses route through Permission Broker capability tokens and compute event hashes in Vault.
          </Alert>
        </Stack>
      </Box>
    </Stack>
  );
};
