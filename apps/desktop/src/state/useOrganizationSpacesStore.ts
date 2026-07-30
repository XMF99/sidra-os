import { create } from 'zustand';

export interface SpaceMember {
  id: string;
  name: string;
  role: 'Owner' | 'Admin' | 'Member' | 'Viewer';
  email: string;
}

export interface OrganizationSpace {
  id: string;
  name: string;
  description: string;
  type: 'Engineering' | 'Marketing' | 'Finance' | 'HR' | 'Legal' | 'Operations' | 'Custom';
  members: SpaceMember[];
  aiContextRules: {
    systemPromptBoundary: string;
    isolatedMemoryScope: string;
    allowedCapabilities: string[];
  };
  blueprintCount: number;
}

interface OrganizationSpacesState {
  spaces: OrganizationSpace[];
  activeSpaceId: string;

  selectSpace: (id: string) => void;
  createSpace: (name: string, type: OrganizationSpace['type'], description: string) => void;
  addSpaceMember: (spaceId: string, member: Omit<SpaceMember, 'id'>) => void;
  removeSpaceMember: (spaceId: string, memberId: string) => void;
  updateTeamAIContext: (spaceId: string, boundary: string) => void;
}

const DEFAULT_SPACES: OrganizationSpace[] = [
  {
    id: 'space-eng',
    name: 'Engineering & DevOps Space',
    description: 'Rust backend, Tokio architecture, and Tauri desktop engineering.',
    type: 'Engineering',
    members: [
      { id: 'm-1', name: 'Chief Architect', role: 'Owner', email: 'architect@sidra.os' },
      { id: 'm-2', name: 'Principal Rust Dev', role: 'Admin', email: 'rust@sidra.os' },
    ],
    aiContextRules: {
      systemPromptBoundary: 'Engineering AI Context: Restricted to software architecture, Rust crates, and IPC SDK.',
      isolatedMemoryScope: 'scope_engineering_vault',
      allowedCapabilities: ['cap-agent-planner', 'cap-app-devconsole'],
    },
    blueprintCount: 3,
  },
  {
    id: 'space-mkt',
    name: 'Executive Marketing Space',
    description: 'Product positioning, brand strategy, and launch telemetry.',
    type: 'Marketing',
    members: [
      { id: 'm-3', name: 'VP Marketing', role: 'Owner', email: 'marketing@sidra.os' },
    ],
    aiContextRules: {
      systemPromptBoundary: 'Marketing AI Context: Restricted to brand assets, market segmentation, and GTM strategy. No access to financial ledger.',
      isolatedMemoryScope: 'scope_marketing_vault',
      allowedCapabilities: ['cap-agent-planner'],
    },
    blueprintCount: 2,
  },
  {
    id: 'space-fin',
    name: 'Treasury & Finance Space',
    description: 'Financial ledger, audit vault, and token expenditure limits.',
    type: 'Finance',
    members: [
      { id: 'm-4', name: 'Chief Financial Officer', role: 'Owner', email: 'cfo@sidra.os' },
    ],
    aiContextRules: {
      systemPromptBoundary: 'Finance AI Context: Restricted to audit trails, SHA-256 hash chains, and budget ceilings. Full isolation from public assets.',
      isolatedMemoryScope: 'scope_finance_vault',
      allowedCapabilities: ['cap-agent-planner'],
    },
    blueprintCount: 1,
  },
];

export const useOrganizationSpacesStore = create<OrganizationSpacesState>((set) => ({
  spaces: DEFAULT_SPACES,
  activeSpaceId: 'space-eng',

  selectSpace: (id) => set({ activeSpaceId: id }),

  createSpace: (name, type, description) =>
    set((state) => {
      const newSpace: OrganizationSpace = {
        id: `space-${Date.now()}`,
        name,
        type,
        description,
        members: [{ id: `m-${Date.now()}`, name: 'You (Owner)', role: 'Owner', email: 'owner@sidra.os' }],
        aiContextRules: {
          systemPromptBoundary: `${type} AI Context: Isolated memory scope for ${name}.`,
          isolatedMemoryScope: `scope_${type.toLowerCase()}_vault`,
          allowedCapabilities: ['cap-agent-planner'],
        },
        blueprintCount: 0,
      };
      return { spaces: [...state.spaces, newSpace], activeSpaceId: newSpace.id };
    }),

  addSpaceMember: (spaceId, memberData) =>
    set((state) => ({
      spaces: state.spaces.map((s) =>
        s.id === spaceId
          ? {
              ...s,
              members: [...s.members, { id: `m-${Date.now()}`, ...memberData }],
            }
          : s
      ),
    })),

  removeSpaceMember: (spaceId, memberId) =>
    set((state) => ({
      spaces: state.spaces.map((s) =>
        s.id === spaceId ? { ...s, members: s.members.filter((m) => m.id !== memberId) } : s
      ),
    })),

  updateTeamAIContext: (spaceId, boundary) =>
    set((state) => ({
      spaces: state.spaces.map((s) =>
        s.id === spaceId
          ? { ...s, aiContextRules: { ...s.aiContextRules, systemPromptBoundary: boundary } }
          : s
      ),
    })),
}));
