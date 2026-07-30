import { FC } from 'react';
import { useIntelligenceCoreStore } from '../../state/useIntelligenceCoreStore';
import { Stack, Box, Heading, Text, StatusBadge, Button, Alert } from '@sidra/ui';

export const ExplainabilityDrawerModal: FC = () => {
  const { activeExplanation, closeExplainability } = useIntelligenceCoreStore();

  if (!activeExplanation) return null;

  return (
    <div
      role="dialog"
      aria-label="Explainability Drawer Modal"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={closeExplainability}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, width: '100%', height: '100%' }}>
        <Box
          padding="24px"
          bg="var(--sd-color-surface-raised, #12151e)"
          style={{ borderLeft: '1px solid var(--sd-color-accent, #6366f1)', height: '100%', borderRadius: 0, overflowY: 'auto', boxSizing: 'border-box' }}
        >
          <Stack gap="20px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={3}>Explainability Engine</Heading>
              <Button variant="ghost" size="sm" onClick={closeExplainability}>
                Close
              </Button>
            </div>

            <StatusBadge status="active">
              CONFIDENCE: {activeExplanation.confidenceScore}%
            </StatusBadge>

            <Heading level={4}>{activeExplanation.title}</Heading>

            <Alert type="info" title="Why Was This Decision Chosen?">
              {activeExplanation.whyChosen}
            </Alert>

            <Alert type="warning" title="Why Were Alternatives Rejected?">
              <ul style={{ margin: '4px 0 0 16px', fontSize: 12, color: '#94a3b8' }}>
                {activeExplanation.whyNotAlternatives.map((alt, idx) => (
                  <li key={idx}>{alt}</li>
                ))}
              </ul>
            </Alert>

            <Box padding="14px" bg="#050608" borderRadius="6px" border="1px solid #2e3548">
              <Text size="xs" weight="semibold" color="muted">How Was It Executed?</Text>
              <Text size="xs" color="secondary" style={{ marginTop: 4 }}>{activeExplanation.howExecuted}</Text>
            </Box>

            <Box padding="14px" bg="#050608" borderRadius="6px" border="1px solid #2e3548">
              <Text size="xs" weight="semibold" color="muted">Expected Business Benefits:</Text>
              <ul style={{ margin: '4px 0 0 16px', fontSize: 12, color: '#34d399' }}>
                {activeExplanation.expectedBenefits.map((b, idx) => (
                  <li key={idx}>{b}</li>
                ))}
              </ul>
            </Box>

            <Box padding="14px" bg="#050608" borderRadius="6px" border="1px solid #2e3548">
              <Text size="xs" weight="semibold" color="muted">Potential Risks Evaluated:</Text>
              <ul style={{ margin: '4px 0 0 16px', fontSize: 12, color: '#f87171' }}>
                {activeExplanation.potentialRisks.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </Box>
          </Stack>
        </Box>
      </div>
    </div>
  );
};
