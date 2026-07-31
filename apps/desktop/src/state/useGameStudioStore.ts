import { create } from 'zustand';

export type GameEngineType = 'Unreal Engine 5' | 'Unity' | 'Godot' | 'Custom Rust';
export type PipelineStage = 'Concept' | 'Prototype' | 'Production' | 'QA' | 'Certification' | 'Release' | 'LiveOps';
export type StudioAgentRole =
  | 'Studio Director' | 'Creative Director' | 'Technical Director' | 'Producer' | 'Project Manager'
  | 'Art Director' | 'Audio Director' | 'Narrative Director' | 'Lead Designer' | 'Gameplay Designer'
  | 'Systems Designer' | 'Economy Designer' | 'Technical Artist' | 'Concept Artist' | '3D Artist'
  | 'Animator' | 'VFX Artist' | 'UI Designer' | 'UX Designer' | 'Gameplay Programmer'
  | 'AI Programmer' | 'Engine Programmer' | 'Tools Programmer' | 'Graphics Programmer'
  | 'Backend Programmer' | 'Network Programmer' | 'Build Engineer' | 'DevOps Engineer'
  | 'QA Director' | 'QA Engineer' | 'Performance Engineer' | 'Accessibility Specialist'
  | 'Localization Lead' | 'Community Manager' | 'LiveOps Manager' | 'Publishing Manager' | 'Release Manager';

export interface StudioAgent {
  id: string;
  roleName: StudioAgentRole;
  department: 'Leadership' | 'Design' | 'Engineering' | 'Art' | 'Audio' | 'QA' | 'LiveOps' | 'Publishing';
  status: 'Active' | 'Executing' | 'Idle';
}

export interface GameProject {
  id: string;
  title: string;
  genre: string;
  targetPlatform: string;
  engine: GameEngineType;
  pipelineStage: PipelineStage;
  completionPercent: number;
}

export interface QaBugReport {
  id: string;
  title: string;
  severity: 'Blocker' | 'High' | 'Normal';
  status: 'Open' | 'Resolved' | 'Closed';
}

export interface DirectorRecommendation {
  id: string;
  title: string;
  recommendation: string;
  impactEstimate: string;
  confidenceScore: number; // 0..100
  explainabilityWhy: string;
}

export interface StudioSimulationScenario {
  id: string;
  type: 'Release' | 'Budget' | 'Hiring' | 'ContentPlanning' | 'PlayerGrowth';
  title: string;
  projectedRetentionGain: number; // %
  riskScore: number; // 0..100
  simulationPass: boolean;
}

export interface StudioAuditFinding {
  id: string;
  findingTitle: string;
  severity: 'High' | 'Medium' | 'Low';
  evidence: string;
  status: 'Open' | 'Mitigated' | 'Dismissed';
}

interface GameStudioState {
  studioHealthScore: number;
  activeGamesCount: number;
  sprintProgressPercent: number;
  releaseReadinessStatus: string;
  dauCount: number;
  mauCount: number;
  playerRetentionPercent: number;

  agents: StudioAgent[];
  games: GameProject[];
  qaBugs: QaBugReport[];
  directorRecommendations: DirectorRecommendation[];
  simulations: StudioSimulationScenario[];
  auditFindings: StudioAuditFinding[];

  // Actions
  resolveQaBug: (id: string) => void;
  runStudioSimulation: (type: StudioSimulationScenario['type'], title: string) => StudioSimulationScenario;
  resolveStudioAuditFinding: (id: string) => void;
}

const DEFAULT_AGENTS: StudioAgent[] = [
  { id: 'ag-1', roleName: 'Studio Director', department: 'Leadership', status: 'Active' },
  { id: 'ag-2', roleName: 'Creative Director', department: 'Design', status: 'Active' },
  { id: 'ag-3', roleName: 'Technical Director', department: 'Engineering', status: 'Executing' },
  { id: 'ag-4', roleName: 'Art Director', department: 'Art', status: 'Active' },
  { id: 'ag-5', roleName: 'QA Director', department: 'QA', status: 'Active' },
  { id: 'ag-6', roleName: 'LiveOps Manager', department: 'LiveOps', status: 'Active' },
];

const DEFAULT_GAMES: GameProject[] = [
  { id: 'g-1', title: 'Project CyberSidra AAA Action RPG', genre: 'Sci-Fi Action RPG', targetPlatform: 'PC / PlayStation 5 / Xbox Series X', engine: 'Unreal Engine 5', pipelineStage: 'Release', completionPercent: 98 },
  { id: 'g-2', title: 'Sidra Tactics AA Strategy', genre: 'Turn-Based Strategy', targetPlatform: 'PC / Switch', engine: 'Custom Rust', pipelineStage: 'QA', completionPercent: 92 },
  { id: 'g-3', title: 'Kingdoms of Sidra Mobile', genre: 'MMO Strategy', targetPlatform: 'iOS / Android', engine: 'Unity', pipelineStage: 'LiveOps', completionPercent: 100 },
];

const DEFAULT_BUGS: QaBugReport[] = [
  { id: 'bug-1', title: 'Fix Shader Pre-compilation Stutter on Vulkan Backend', severity: 'High', status: 'Open' },
  { id: 'bug-2', title: 'Verify Perforce LFS Asset Sync Pipeline Integrity', severity: 'Normal', status: 'Resolved' },
];

const DEFAULT_DIRECTOR_RECOMMENDATIONS: DirectorRecommendation[] = [
  {
    id: 'dir-rec-1',
    title: 'Approve Gold Master Release Candidate for CyberSidra AAA',
    recommendation: 'Authorise Steam & PlayStation store submission package following 100% QA certification pass.',
    impactEstimate: 'Ready for Global Launch',
    confidenceScore: 99,
    explainabilityWhy: 'Zero Blocker bugs remaining across 1,200 automated regression playtests.',
  },
  {
    id: 'dir-rec-2',
    title: 'Schedule Season 4 Battle Pass LiveOps Update for Mobile',
    recommendation: 'Deploy pre-built Season 4 content addressables package to boost D30 retention by 14%.',
    impactEstimate: '+14% D30 Retention',
    confidenceScore: 96,
    explainabilityWhy: 'A/B simulation models show 84% player engagement with new seasonal rewards.',
  },
];

const DEFAULT_SIMULATIONS: StudioSimulationScenario[] = [
  { id: 'sim-std-1', type: 'Release', title: 'Global Multi-Platform Simultaneous Launch Simulation', projectedRetentionGain: 22, riskScore: 6, simulationPass: true },
  { id: 'sim-std-2', type: 'PlayerGrowth', title: 'LiveOps Season 4 Content Drop & Revenue Simulation', projectedRetentionGain: 18, riskScore: 8, simulationPass: true },
];

const DEFAULT_AUDIT_FINDINGS: StudioAuditFinding[] = [
  { id: 'aud-std-1', findingTitle: 'Verified C++/Rust Build Artifact Hashes & Vault Audit History', severity: 'Low', evidence: '100% of game engine CI/CD build outputs pass cryptographic Vault verification.', status: 'Mitigated' },
];

export const useGameStudioStore = create<GameStudioState>((set) => ({
  studioHealthScore: 99,
  activeGamesCount: 3,
  sprintProgressPercent: 94,
  releaseReadinessStatus: 'Gold Master Candidate',
  dauCount: 2400000,
  mauCount: 8100000,
  playerRetentionPercent: 68,

  agents: DEFAULT_AGENTS,
  games: DEFAULT_GAMES,
  qaBugs: DEFAULT_BUGS,
  directorRecommendations: DEFAULT_DIRECTOR_RECOMMENDATIONS,
  simulations: DEFAULT_SIMULATIONS,
  auditFindings: DEFAULT_AUDIT_FINDINGS,

  resolveQaBug: (id) =>
    set((state) => ({
      qaBugs: state.qaBugs.map((b) => (b.id === id ? { ...b, status: 'Resolved' } : b)),
    })),

  runStudioSimulation: (type, title) => {
    const newSim: StudioSimulationScenario = {
      id: `sim-std-${Date.now()}`,
      type,
      title,
      projectedRetentionGain: 24,
      riskScore: 7,
      simulationPass: true,
    };

    set((state) => ({ simulations: [newSim, ...state.simulations] }));
    return newSim;
  },

  resolveStudioAuditFinding: (id) =>
    set((state) => ({
      auditFindings: state.auditFindings.map((f) => (f.id === id ? { ...f, status: 'Mitigated' } : f)),
    })),
}));
