import { FC } from 'react';
import { useOnboardingStore } from '../../state/useOnboardingStore';
import { FirstRunWelcome } from '../../components/onboarding/FirstRunWelcome';
import { AuthPlatformStep } from '../../components/onboarding/AuthPlatformStep';
import { WorkspaceWizardStep } from '../../components/onboarding/WorkspaceWizardStep';
import { IndustryCatalogStep } from '../../components/onboarding/IndustryCatalogStep';
import { AIDiscoveryInterviewStep } from '../../components/onboarding/AIDiscoveryInterviewStep';
import { RecommendationEngineStep } from '../../components/onboarding/RecommendationEngineStep';
import { WorkspaceInstallerStep } from '../../components/onboarding/WorkspaceInstallerStep';
import { PersonalizedDashboard } from '../../components/onboarding/PersonalizedDashboard';
import { StatusBadge } from '@sidra/ui';

export const SetupWizard: FC = () => {
  const { currentStep, completed } = useOnboardingStore();

  if (completed) {
    return <PersonalizedDashboard />;
  }

  const steps = [
    { num: 1, name: 'Welcome' },
    { num: 2, name: 'Auth & Access' },
    { num: 3, name: 'Workspace' },
    { num: 4, name: 'Industry' },
    { num: 5, name: 'AI Interview' },
    { num: 6, name: 'Recommendations' },
    { num: 7, name: 'Installer' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#090d16',
        backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15), transparent 70%)',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      {/* Onboarding Progress Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
          padding: '8px 16px',
          borderRadius: 9999,
          backgroundColor: 'rgba(18, 21, 30, 0.8)',
          border: '1px solid #242938',
        }}
      >
        <StatusBadge status="active">Step {currentStep} of 7</StatusBadge>
        <div style={{ display: 'flex', gap: 6 }}>
          {steps.map((s) => (
            <div
              key={s.num}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: s.num <= currentStep ? '#6366f1' : '#2e3548',
                transition: 'background-color 0.2s ease',
              }}
              title={s.name}
            />
          ))}
        </div>
      </div>

      {/* Active Step Content View */}
      {currentStep === 1 && <FirstRunWelcome />}
      {currentStep === 2 && <AuthPlatformStep />}
      {currentStep === 3 && <WorkspaceWizardStep />}
      {currentStep === 4 && <IndustryCatalogStep />}
      {currentStep === 5 && <AIDiscoveryInterviewStep />}
      {currentStep === 6 && <RecommendationEngineStep />}
      {currentStep >= 7 && <WorkspaceInstallerStep />}
    </div>
  );
};
