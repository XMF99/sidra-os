import { create } from 'zustand';

export type WorkspaceType =
  | 'Individual'
  | 'Freelancer'
  | 'Startup'
  | 'Company'
  | 'Enterprise'
  | 'Government'
  | 'University'
  | 'Studio'
  | 'Non-Profit'
  | 'Custom';

export interface IndustryItem {
  id: string;
  name: string;
  category: string;
  description: string;
  recommendedApps: string[];
}

export interface AIRecommendation {
  id: string;
  type: 'app' | 'agent' | 'workflow' | 'dashboard';
  title: string;
  description: string;
  rationale: string;
  installed: boolean;
}

export interface InterviewMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface OnboardingState {
  // Step & Progress
  currentStep: number;
  completed: boolean;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeOnboarding: () => void;
  resumeOnboarding: () => void;

  // Auth Platform
  authMethod: 'guest' | 'google' | 'github' | 'microsoft' | 'apple' | 'sso' | 'email';
  userEmail?: string;
  setAuthMethod: (method: OnboardingState['authMethod'], email?: string) => void;

  // Workspace Creation
  workspaceName: string;
  workspaceType: WorkspaceType;
  workspaceDescription: string;
  language: string;
  timezone: string;
  region: string;
  setWorkspaceDetails: (details: Partial<Pick<OnboardingState, 'workspaceName' | 'workspaceType' | 'workspaceDescription' | 'language' | 'timezone' | 'region'>>) => void;

  // Industry Catalog
  selectedIndustryId: string;
  companySize: string;
  growthStage: string;
  setIndustryDetails: (industryId: string, size?: string, stage?: string) => void;

  // AI Discovery Interview
  interviewMessages: InterviewMessage[];
  addInterviewAnswer: (answer: string) => void;

  // Recommendations & Progressive Workspace Installer
  recommendations: AIRecommendation[];
  toggleRecommendationInstall: (id: string) => void;
  installAllRecommendations: () => void;

  // Personalization
  theme: 'night-atrium' | 'day-atrium' | 'dark' | 'light';
  accentColor: string;
  setPersonalization: (theme: OnboardingState['theme'], accent?: string) => void;
}

export const DEFAULT_INDUSTRIES: IndustryItem[] = [
  { id: 'ind-software', name: 'Software & Technology', category: 'Technology', description: 'Software engineering, DevOps, and cloud systems', recommendedApps: ['DevConsole', 'CodeGraph', 'CI/CD Pipelines'] },
  { id: 'ind-ai', name: 'Artificial Intelligence', category: 'Technology', description: 'AI research, LLM orchestration, and model evaluation', recommendedApps: ['AgentLab', 'PromptStudio', 'EvalVault'] },
  { id: 'ind-gamedev', name: 'Game Development', category: 'Creative', description: 'Game engines, asset pipelines, and narrative AI', recommendedApps: ['StudioManager', 'AssetGraph', 'RenderQueue'] },
  { id: 'ind-finance', name: 'Finance & Banking', category: 'Enterprise', description: 'Financial modeling, compliance, and risk analytics', recommendedApps: ['RiskBoard', 'AuditLog', 'TreasuryDesk'] },
  { id: 'ind-healthcare', name: 'Healthcare & Biotech', category: 'Science', description: 'Clinical data, HIPAA compliance, and research vault', recommendedApps: ['BioVault', 'ComplianceEngine', 'TrialTracker'] },
];

const DEFAULT_RECOMMENDATIONS: AIRecommendation[] = [
  { id: 'rec-agent-planner', type: 'agent', title: 'Executive Planner Agent', description: 'Decomposes complex enterprise goals into actionable task DAGs.', rationale: 'Essential for multi-agent mission delegation in your workspace.', installed: true },
  { id: 'rec-app-devconsole', type: 'app', title: 'Developer Console & Telemetry', description: 'Real-time event chain debugger and IPC command monitor.', rationale: 'Matches your selected Software & Technology profile.', installed: true },
  { id: 'rec-dash-executive', type: 'dashboard', title: 'Executive Overview Dashboard', description: 'Unified metrics for system health, pending decisions, and active missions.', rationale: 'Customized based on your startup growth stage goals.', installed: false },
  { id: 'rec-wf-security', type: 'workflow', title: 'Permission Security Audit', description: 'Automated policy evaluation for all background agent execution.', rationale: 'Ensures strict compliance with Permission Broker ceilings.', installed: false },
];

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 1,
  completed: typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('sidra_onboarding_completed') === 'true' : false,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(8, state.currentStep + 1) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),

  completeOnboarding: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('sidra_onboarding_completed', 'true');
      window.localStorage.setItem('sidra_setup_completed', 'true');
    }
    set({ completed: true });
  },

  resumeOnboarding: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('sidra_onboarding_completed');
      window.localStorage.removeItem('sidra_setup_completed');
    }
    set({ completed: false, currentStep: 1 });
  },

  authMethod: 'guest',
  setAuthMethod: (method, email) => set({ authMethod: method, userEmail: email }),

  workspaceName: 'Sovereign Primary Workspace',
  workspaceType: 'Startup',
  workspaceDescription: 'Enterprise AI & sovereign operations environment',
  language: 'en-US',
  timezone: 'UTC+3 (Riyadh)',
  region: 'Middle East & North Africa',

  setWorkspaceDetails: (details) => set((state) => ({ ...state, ...details })),

  selectedIndustryId: 'ind-software',
  companySize: '10-50 employees',
  growthStage: 'Series A / Scale-up',
  setIndustryDetails: (industryId, size, stage) =>
    set((state) => ({
      selectedIndustryId: industryId,
      companySize: size ?? state.companySize,
      growthStage: stage ?? state.growthStage,
    })),

  interviewMessages: [
    {
      id: 'int-1',
      sender: 'ai',
      text: 'Welcome to THEKY. I am your Executive Onboarding Assistant. What primary objective would you like our multi-agent platform to achieve for your workspace?',
      timestamp: new Date().toISOString(),
    },
  ],

  addInterviewAnswer: (answer) =>
    set((state) => ({
      interviewMessages: [
        ...state.interviewMessages,
        { id: `int-user-${Date.now()}`, sender: 'user', text: answer, timestamp: new Date().toISOString() },
        {
          id: `int-ai-${Date.now()}`,
          sender: 'ai',
          text: `Understood. Configuring multi-agent orchestration for "${answer}". Loading recommended application suite...`,
          timestamp: new Date().toISOString(),
        },
      ],
    })),

  recommendations: DEFAULT_RECOMMENDATIONS,
  toggleRecommendationInstall: (id) =>
    set((state) => ({
      recommendations: state.recommendations.map((r) => (r.id === id ? { ...r, installed: !r.installed } : r)),
    })),
  installAllRecommendations: () =>
    set((state) => ({
      recommendations: state.recommendations.map((r) => ({ ...r, installed: true })),
    })),

  theme: 'night-atrium',
  accentColor: '#6366f1',
  setPersonalization: (theme, accent) =>
    set((state) => ({
      theme,
      accentColor: accent ?? state.accentColor,
    })),
}));
