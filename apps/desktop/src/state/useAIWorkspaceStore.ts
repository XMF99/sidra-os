import { create } from 'zustand';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  senderName?: string;
  reasoningSteps?: string[];
  toolCalls?: { tool: string; args: string; result?: string }[];
  evidenceCitations?: { id: string; title: string; score: number }[];
}

export interface AgentItem {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'thinking' | 'executing' | 'completed' | 'failed';
  progress: number;
  currentTask?: string;
  logs: string[];
}

export interface MissionItem {
  id: string;
  title: string;
  status: 'planning' | 'in_progress' | 'verifying' | 'completed';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  progress: number;
  tasks: { id: string; name: string; done: boolean }[];
}

export interface ExecutiveDecision {
  id: string;
  title: string;
  recommendation: string;
  confidenceScore: number; // 0..100
  riskSummary: string;
  evidence: string[];
  status: 'pending' | 'approved' | 'rejected' | 'revised';
  timestamp: string;
}

export interface AIModelConfig {
  id: string;
  name: string;
  provider: 'OpenAI' | 'Anthropic' | 'Google' | 'OpenRouter' | 'Local Ollama';
  latencyMs: number;
  costPer1k: number;
  contextWindow: number;
  health: 'healthy' | 'degraded' | 'offline';
}

interface AIWorkspaceState {
  // Navigation & Active Tab
  activeSubTab: 'home' | 'conversations' | 'agents' | 'missions' | 'decisions' | 'knowledge' | 'memory' | 'models' | 'settings';
  setActiveSubTab: (tab: AIWorkspaceState['activeSubTab']) => void;

  // Conversations
  messages: AIMessage[];
  isGenerating: boolean;
  addMessage: (msg: Omit<AIMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  stopGeneration: () => void;

  // Multi-Agent Workspace
  agents: AgentItem[];
  updateAgentStatus: (id: string, status: AgentItem['status'], progress?: number, task?: string) => void;

  // Mission Center
  missions: MissionItem[];
  createMission: (title: string, priority: MissionItem['priority']) => void;
  toggleMissionTask: (missionId: string, taskId: string) => void;

  // Executive Decision Center
  decisions: ExecutiveDecision[];
  approveDecision: (id: string) => void;
  rejectDecision: (id: string) => void;

  // Models & Composer Configuration
  models: AIModelConfig[];
  selectedModelId: string;
  setSelectedModel: (id: string) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  reasoningMode: 'fast' | 'balanced' | 'deep';
  setReasoningMode: (mode: 'fast' | 'balanced' | 'deep') => void;
}

const DEFAULT_AGENTS: AgentItem[] = [
  { id: 'agt-planner', name: 'Chief Planner Agent', role: 'Mission Decomposition', status: 'idle', progress: 100, logs: ['Initialized planner DAG engine'] },
  { id: 'agt-retriever', name: 'Vault Retriever Agent', role: 'Vector Search & Citation', status: 'idle', progress: 100, logs: ['Connected to sqlite-vec store'] },
  { id: 'agt-reviewer', name: 'Security Reviewer Agent', role: 'Permission & Compliance', status: 'idle', progress: 100, logs: ['Permission Broker policy loaded'] },
];

const DEFAULT_MISSIONS: MissionItem[] = [
  {
    id: 'msn-01',
    title: 'Audit System Event Log Integrity & Forward Projections',
    status: 'in_progress',
    priority: 'CRITICAL',
    progress: 75,
    tasks: [
      { id: 't-1', name: 'Verify SHA-256 state hash sequence 1..N', done: true },
      { id: 't-2', name: 'Verify zero-knowledge secret vault encryption', done: true },
      { id: 't-3', name: 'Rehearse forward-only projection rebuild', done: false },
    ],
  },
];

const DEFAULT_DECISIONS: ExecutiveDecision[] = [
  {
    id: 'dec-01',
    title: 'Approve Department Sub-Budget Allocation Increase',
    recommendation: 'Grant temporary +15% token allocation ceiling for R&D Department',
    confidenceScore: 94,
    riskSummary: 'Low financial risk. Remains strictly within overall 400MB RAM & CPU sub-budget.',
    evidence: ['ADR-0013 Department Ceilings Rule', 'Historical 30-day token telemetry log'],
    status: 'pending',
    timestamp: '2026-07-30T06:30:00Z',
  },
];

const DEFAULT_MODELS: AIModelConfig[] = [
  { id: 'local-llama-3', name: 'Llama 3.1 8B (Local Sidecar)', provider: 'Local Ollama', latencyMs: 120, costPer1k: 0.00, contextWindow: 128000, health: 'healthy' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', latencyMs: 450, costPer1k: 0.003, contextWindow: 200000, health: 'healthy' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', latencyMs: 380, costPer1k: 0.005, contextWindow: 128000, health: 'healthy' },
  { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', latencyMs: 310, costPer1k: 0.0025, contextWindow: 1000000, health: 'healthy' },
];

export const useAIWorkspaceStore = create<AIWorkspaceState>((set) => ({
  activeSubTab: 'home',
  setActiveSubTab: (tab) => set({ activeSubTab: tab }),

  messages: [
    {
      id: 'msg-genesis',
      role: 'assistant',
      content: 'Welcome to THEKY Executive Intelligence Platform. System operational under certified E01 architecture. How may I assist your mission today?',
      timestamp: new Date().toISOString(),
      senderName: 'THEKY Executive Core',
    },
  ],
  isGenerating: false,

  addMessage: (msgData) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          ...msgData,
        },
      ],
    })),

  clearMessages: () => set({ messages: [] }),
  stopGeneration: () => set({ isGenerating: false }),

  agents: DEFAULT_AGENTS,
  updateAgentStatus: (id, status, progress, task) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              progress: progress ?? a.progress,
              currentTask: task ?? a.currentTask,
              logs: task ? [...a.logs, `[${new Date().toLocaleTimeString()}] ${task}`] : a.logs,
            }
          : a
      ),
    })),

  missions: DEFAULT_MISSIONS,
  createMission: (title, priority) =>
    set((state) => ({
      missions: [
        ...state.missions,
        {
          id: `msn-${Date.now()}`,
          title,
          status: 'planning',
          priority,
          progress: 0,
          tasks: [{ id: `t-${Date.now()}-1`, name: 'Initial mission scoping & agent delegation', done: false }],
        },
      ],
    })),

  toggleMissionTask: (missionId, taskId) =>
    set((state) => ({
      missions: state.missions.map((m) => {
        if (m.id !== missionId) return m;
        const newTasks = m.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t));
        const doneCount = newTasks.filter((t) => t.done).length;
        const progress = Math.round((doneCount / newTasks.length) * 100);
        return { ...m, tasks: newTasks, progress };
      }),
    })),

  decisions: DEFAULT_DECISIONS,
  approveDecision: (id) =>
    set((state) => ({
      decisions: state.decisions.map((d) => (d.id === id ? { ...d, status: 'approved' } : d)),
    })),
  rejectDecision: (id) =>
    set((state) => ({
      decisions: state.decisions.map((d) => (d.id === id ? { ...d, status: 'rejected' } : d)),
    })),

  models: DEFAULT_MODELS,
  selectedModelId: 'local-llama-3',
  setSelectedModel: (id) => set({ selectedModelId: id }),
  temperature: 0.7,
  setTemperature: (temp) => set({ temperature: temp }),
  reasoningMode: 'balanced',
  setReasoningMode: (mode) => set({ reasoningMode: mode }),
}));
