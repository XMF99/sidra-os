import { describe, it, expect } from 'vitest';
import { useOnboardingStore } from '../useOnboardingStore';

describe('useOnboardingStore', () => {
  it('manages onboarding step navigation', () => {
    const store = useOnboardingStore.getState();
    store.setStep(1);
    store.nextStep();
    expect(useOnboardingStore.getState().currentStep).toBe(2);
    store.prevStep();
    expect(useOnboardingStore.getState().currentStep).toBe(1);
  });

  it('updates authentication method', () => {
    const store = useOnboardingStore.getState();
    store.setAuthMethod('guest');
    expect(useOnboardingStore.getState().authMethod).toBe('guest');
  });

  it('updates workspace configuration details', () => {
    const store = useOnboardingStore.getState();
    store.setWorkspaceDetails({ workspaceName: 'Test Sovereign Lab', workspaceType: 'Startup' });
    expect(useOnboardingStore.getState().workspaceName).toBe('Test Sovereign Lab');
    expect(useOnboardingStore.getState().workspaceType).toBe('Startup');
  });

  it('adds AI discovery interview answers', () => {
    const store = useOnboardingStore.getState();
    store.addInterviewAnswer('Automate cloud infrastructure security logs');
    const messages = useOnboardingStore.getState().interviewMessages;
    expect(messages.some((m) => m.text.includes('Automate cloud infrastructure'))).toBe(true);
  });

  it('toggles recommendation installation state', () => {
    const store = useOnboardingStore.getState();
    const recId = store.recommendations[0].id;
    const initialStatus = store.recommendations[0].installed;
    store.toggleRecommendationInstall(recId);
    const updatedStatus = useOnboardingStore.getState().recommendations[0].installed;
    expect(updatedStatus).toBe(!initialStatus);
  });
});
