import { FC, useState } from 'react';
import { useDigitalTwinStore } from '../../state/useDigitalTwinStore';
import { Stack, Box, Heading, Text, TextInput, Button, Alert, Icon } from '@sidra/ui';

export const WhatIfAnalysisView: FC = () => {
  const { whatIfQueries, runWhatIfQuery } = useDigitalTwinStore();
  const [question, setQuestion] = useState('');

  const handleRun = () => {
    if (!question.trim()) return;
    runWhatIfQuery(question);
    setQuestion('');
  };

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>What-If Hypothetical Analysis Engine</Heading>
      <Text color="secondary">
        Executes hypothetical foresights ("What if budget decreases?", "What if team doubles?") strictly inside the Digital Twin Sandbox.
      </Text>

      <div style={{ display: 'flex', gap: 12 }}>
        <TextInput
          placeholder="Ask a What-If question (e.g. 'What if budget drops by 30%?', 'What if deadline changes?')..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleRun();
            }
          }}
        />
        <Button
          variant="primary"
          rightIcon={<Icon name="Sparkles" size={16} />}
          onClick={handleRun}
        >
          Simulate What-If
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {whatIfQueries.map((wif) => (
          <Box
            key={wif.id}
            padding="18px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="10px">
              <Heading level={4}>Query: "{wif.question}"</Heading>

              <Alert type="info" title="Projected Foresight Outcome:">
                {wif.projectedOutcome}
              </Alert>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8' }}>
                <span>Risk Delta: <strong>{wif.riskDelta}</strong></span>
                <span>{wif.recommendation}</span>
              </div>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
