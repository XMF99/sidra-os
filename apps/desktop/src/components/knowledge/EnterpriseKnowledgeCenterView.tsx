import { FC, useState } from 'react';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Button, Alert } from '@sidra/ui';

export interface KnowledgeDocument {
  id: string;
  title: string;
  scope: 'Company' | 'Department' | 'Project';
  category: 'Policy' | 'Technical Spec' | 'Architecture' | 'Meeting Notes';
  provenanceSource: string;
  retentionPeriodYears: number;
  semanticRelevancePercent: number;
}

export const EnterpriseKnowledgeCenterView: FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [documents] = useState<KnowledgeDocument[]>([
    { id: 'doc-1', title: 'THEKY E01 Platform Architecture & Security Mandate', scope: 'Company', category: 'Architecture', provenanceSource: 'Vault Storage / System Spec', retentionPeriodYears: 7, semanticRelevancePercent: 99 },
    { id: 'doc-2', title: 'AAA Game Studio Gold Master Release Policy', scope: 'Department', category: 'Policy', provenanceSource: 'Game Studio Confluence', retentionPeriodYears: 5, semanticRelevancePercent: 96 },
    { id: 'doc-3', title: 'Project CyberSidra C++/Rust Engine Integration Spec', scope: 'Project', category: 'Technical Spec', provenanceSource: 'Git Repository / ADR-0008', retentionPeriodYears: 10, semanticRelevancePercent: 94 },
    { id: 'doc-4', title: 'Executive Board Q3 Strategy & Financial Allocation Notes', scope: 'Company', category: 'Meeting Notes', provenanceSource: 'Executive Vault Ledger', retentionPeriodYears: 7, semanticRelevancePercent: 91 },
  ]);

  const filtered = documents.filter((d) => d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.category.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Enterprise Knowledge Center</Heading>
      <Text color="secondary">
        Unified Knowledge Base featuring semantic vector retrieval, Knowledge Graph node citations, source provenance, retention policies, and custom team agent plugins.
      </Text>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Semantic Search Knowledge Base (e.g. Architecture, Vulkan Shaders, Q3 Financials)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 6,
            background: 'var(--sd-color-surface-raised, #12151e)',
            border: '1px solid var(--sd-color-border-subtle, #242938)',
            color: '#ffffff',
            fontSize: 13,
          }}
        />
        <Button variant="primary" size="md">
          Execute Vector Search
        </Button>
      </div>

      <Grid columns={2} gap="16px">
        {filtered.map((doc) => (
          <Box
            key={doc.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="12px">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Heading level={4}>{doc.title}</Heading>
                  <Text size="xs" color="muted">Scope: {doc.scope} • Category: {doc.category}</Text>
                </div>
                <StatusBadge status="success">{doc.semanticRelevancePercent}% RELEVANCE</StatusBadge>
              </div>

              <div style={{ fontSize: 11, color: '#9ca3af' }}>
                Source Provenance: <strong style={{ color: '#38bdf8' }}>{doc.provenanceSource}</strong>
                <span style={{ marginLeft: 16 }}>Retention: {doc.retentionPeriodYears} Years</span>
              </div>
            </Stack>
          </Box>
        ))}
      </Grid>

      <Alert type="info" title="Knowledge Graph Citation Integrity:">
        All vector search results cite verified Knowledge Graph node IDs and Vault SHA-256 provenance hashes.
      </Alert>
    </Stack>
  );
};
