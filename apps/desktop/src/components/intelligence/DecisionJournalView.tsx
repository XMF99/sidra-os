import { FC } from 'react';
import { useIntelligenceCoreStore } from '../../state/useIntelligenceCoreStore';
import { Stack, Box, Heading, Text, StatusBadge, Button, Alert, Icon } from '@sidra/ui';

export const DecisionJournalView: FC = () => {
  const { decisions, openExplainability } = useIntelligenceCoreStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Auditable Decision Journal</Heading>
      <Text color="secondary">
        Immutable institutional decision ledger stashing every decision rationale, confidence score, alternatives evaluated, and risk matrix.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {decisions.map((dec) => (
          <Box
            key={dec.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="12px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Heading level={4}>{dec.title}</Heading>
                <StatusBadge status={dec.result === 'Success' ? 'success' : 'active'}>
                  CONFIDENCE: {dec.confidenceScore}%
                </StatusBadge>
              </div>

              <Text size="xs" color="secondary">{dec.reason}</Text>

              <Alert type="info" title="Alternatives Evaluated & Rejected:">
                <ul style={{ margin: '4px 0 0 16px', fontSize: 12, color: '#94a3b8' }}>
                  {dec.alternativesEvaluated.map((alt, idx) => (
                    <li key={idx}>Rejected alternative: {alt}</li>
                  ))}
                </ul>
              </Alert>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <Text size="xs" color="muted">Logged: {new Date(dec.timestamp).toLocaleString()}</Text>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Icon name="HelpCircle" size={14} />}
                  onClick={() =>
                    openExplainability({
                      itemId: dec.id,
                      title: dec.title,
                      whyChosen: dec.reason,
                      whyNotAlternatives: dec.alternativesEvaluated,
                      howExecuted: `Executed by Decision Engine with ${dec.confidenceScore}% confidence rating.`,
                      expectedBenefits: ['Zero data leakage', 'Sovereign security token compliance'],
                      potentialRisks: dec.riskMatrix.map((r) => r.risk),
                      dependencies: ['Permission Broker', 'Vault SHA-256 Hash Chain'],
                      confidenceScore: dec.confidenceScore,
                    })
                  }
                >
                  Explain Why? / Why Not?
                </Button>
              </div>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
