import { FC, useState } from 'react';
import { OrganizationDnaView } from '../../components/intelligence/OrganizationDnaView';
import { LivingMemoryInspector } from '../../components/intelligence/LivingMemoryInspector';
import { KnowledgeGraphVisualizer } from '../../components/intelligence/KnowledgeGraphVisualizer';
import { DecisionJournalView } from '../../components/intelligence/DecisionJournalView';
import { ReasoningGraphTraceView } from '../../components/intelligence/ReasoningGraphTraceView';
import { ExplainabilityDrawerModal } from '../../components/intelligence/ExplainabilityDrawerModal';
import { Heading, Text, Box } from '@sidra/ui';

export const IntelligenceCorePage: FC = () => {
  const [activeTab, setActiveTab] = useState<'dna' | 'memory' | 'graph' | 'journal' | 'trace' | 'governance'>('dna');

  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: 'dna', label: 'Organization DNA', icon: '🧬' },
    { id: 'memory', label: 'Living Memory', icon: '🧠' },
    { id: 'graph', label: 'Knowledge Graph', icon: '🕸️' },
    { id: 'journal', label: 'Decision Journal', icon: '📓' },
    { id: 'trace', label: 'Reasoning Trace', icon: '🔍' },
    { id: 'governance', label: 'Governance Controls', icon: '🛡️' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative' }}>
      {/* Sub-Tab Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 44,
          padding: '0 16px',
          backgroundColor: 'var(--sd-color-surface-raised, #12151e)',
          borderBottom: '1px solid var(--sd-color-border-subtle, #242938)',
          gap: 8,
        }}
      >
        {tabs.map((t) => {
          const isActive = t.id === activeTab;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                backgroundColor: isActive ? 'var(--sd-color-accent, #6366f1)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--sd-color-text-secondary, #9ca3af)',
                border: 'none',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Body */}
      <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        {activeTab === 'dna' && <OrganizationDnaView />}
        {activeTab === 'memory' && <LivingMemoryInspector />}
        {activeTab === 'graph' && <KnowledgeGraphVisualizer />}
        {activeTab === 'journal' && <DecisionJournalView />}
        {activeTab === 'trace' && <ReasoningGraphTraceView />}
        {activeTab === 'governance' && (
          <Box padding="24px">
            <Heading level={3}>Intelligence Core Governance Controls</Heading>
            <Text color="secondary" style={{ marginTop: 8 }}>
              Administrators control learning sensitivity, memory retention policies, decision logging levels, and reasoning visibility.
            </Text>
          </Box>
        )}
      </div>

      {/* Explainability Drawer Modal */}
      <ExplainabilityDrawerModal />
    </div>
  );
};
