import { FC, useState } from 'react';
import { useOnboardingStore } from '../../state/useOnboardingStore';
import { Stack, Box, Heading, Text, TextInput, Button, ChatBubble, Icon } from '@sidra/ui';

export const AIDiscoveryInterviewStep: FC = () => {
  const { interviewMessages, addInterviewAnswer, nextStep, prevStep } = useOnboardingStore();
  const [answer, setAnswer] = useState('');

  const handleSendAnswer = () => {
    if (!answer.trim()) return;
    addInterviewAnswer(answer);
    setAnswer('');
  };

  return (
    <Box
      padding="36px"
      bg="var(--sd-color-surface-raised, #12151e)"
      borderRadius="12px"
      border="1px solid var(--sd-color-border-subtle, #242938)"
      style={{ maxWidth: 680, width: '100%', margin: '0 auto' }}
    >
      <Stack gap="20px">
        <div>
          <Heading level={2}>AI Discovery Interview</Heading>
          <Text color="secondary">
            Our AI onboarding assistant asks contextual questions to personalize your workspace navigation and agent workforce.
          </Text>
        </div>

        {/* Chat Scroll Area */}
        <div style={{ maxHeight: 240, overflowY: 'auto', paddingRight: 8 }}>
          {interviewMessages.map((msg) => (
            <ChatBubble
              key={msg.id}
              role={msg.sender === 'ai' ? 'assistant' : 'user'}
              content={msg.text}
              senderName={msg.sender === 'ai' ? 'AI Discovery Assistant' : 'You'}
            />
          ))}
        </div>

        {/* Answer Input Bar */}
        <div style={{ display: 'flex', gap: 8 }}>
          <TextInput
            placeholder="Type your answer (e.g. Build automated CI/CD pipelines and review security logs)..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendAnswer();
              }
            }}
          />
          <Button variant="secondary" onClick={handleSendAnswer}>
            Send
          </Button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <Button variant="ghost" onClick={prevStep}>
            Back
          </Button>
          <Button
            variant="primary"
            rightIcon={<Icon name="ArrowRight" size={16} />}
            onClick={nextStep}
          >
            Generate Personalization Recommendations
          </Button>
        </div>
      </Stack>
    </Box>
  );
};
