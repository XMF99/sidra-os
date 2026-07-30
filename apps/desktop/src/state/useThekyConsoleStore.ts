import { create } from 'zustand';

export interface ConsoleMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  senderName: 'You' | 'THEKY';
  attachments?: { id: string; name: string; size: string; type: string }[];
  actionConverted?: { type: string; id: string; name: string };
  // Hidden Developer Mode Diagnostics (never exposed in standard UI)
  devDiagnostics?: {
    modelRouted: string; // e.g. 'Local Ollama Llama 3.1 8B (Internal Routing)'
    latencyMs: number;
    tokensTotal: number;
    executionGraph: string[];
  };
}

export interface ConversationThread {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  pinned: boolean;
  favorite: boolean;
  archived: boolean;
  messages: ConsoleMessage[];
}

export interface SmartSuggestion {
  id: string;
  label: string;
  prompt: string;
  icon: string;
}

interface ThekyConsoleState {
  // Active Thread State
  activeThreadId: string;
  threads: ConversationThread[];
  isGenerating: boolean;

  // Attached files for next prompt
  attachedFiles: { id: string; name: string; size: string; type: string }[];
  addAttachment: (file: { name: string; size: string; type: string }) => void;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;

  // Prompt Actions
  sendPrompt: (promptText: string) => void;
  stopGeneration: () => void;

  // Thread History Actions
  selectThread: (id: string) => void;
  createNewThread: () => void;
  togglePinThread: (id: string) => void;
  toggleFavoriteThread: (id: string) => void;
  archiveThread: (id: string) => void;
  deleteThread: (id: string) => void;
  renameThread: (id: string, newTitle: string) => void;

  // Conversation Action Conversion (e.g. Convert answer to Task / Project / Doc / Workspace)
  convertMessageToAction: (messageId: string, actionType: 'Task' | 'Project' | 'Document' | 'Knowledge' | 'Workflow' | 'Workspace') => void;

  // Hidden Developer Mode (Toggle with Ctrl+Shift+D or /devmode)
  isDeveloperModeEnabled: boolean;
  toggleDeveloperMode: () => void;

  // Smart Suggestions
  smartSuggestions: SmartSuggestion[];
}

const DEFAULT_SUGGESTIONS: SmartSuggestion[] = [
  { id: 'sug-1', label: 'Build an Application', prompt: 'Guide me step-by-step through designing and building a sovereign enterprise application.', icon: 'Layers' },
  { id: 'sug-2', label: 'Analyze My Business', prompt: 'Perform an executive analysis of my workspace objectives, risk posture, and telemetry.', icon: 'BarChart' },
  { id: 'sug-3', label: 'Create a Project', prompt: 'Initialize a new multi-phase project with task DAGs and security token requirements.', icon: 'FolderPlus' },
  { id: 'sug-4', label: 'Generate Marketing Strategy', prompt: 'Formulate a comprehensive enterprise product positioning and GTM strategy.', icon: 'Target' },
];

const DEFAULT_MESSAGES: ConsoleMessage[] = [
  {
    id: 'msg-init',
    role: 'assistant',
    content: 'Welcome to THEKY. I am your central Business Operating System intelligence. How can I assist your objectives today?',
    timestamp: new Date().toISOString(),
    senderName: 'THEKY',
    devDiagnostics: {
      modelRouted: 'Local Ollama Sidecar (Internal Fast Router)',
      latencyMs: 85,
      tokensTotal: 24,
      executionGraph: ['TokenBroker::eval', 'Vault::verify_hash', 'THEKY::synthesize'],
    },
  },
];

const INITIAL_THREAD: ConversationThread = {
  id: 'thread-main',
  title: 'Executive Strategic Planning',
  preview: 'Welcome to THEKY. I am your central Business Operating System intelligence...',
  updatedAt: new Date().toISOString(),
  pinned: true,
  favorite: true,
  archived: false,
  messages: DEFAULT_MESSAGES,
};

export const useThekyConsoleStore = create<ThekyConsoleState>((set) => ({
  activeThreadId: 'thread-main',
  threads: [INITIAL_THREAD],
  isGenerating: false,
  attachedFiles: [],

  addAttachment: (file) =>
    set((state) => ({
      attachedFiles: [
        ...state.attachedFiles,
        { id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`, ...file },
      ],
    })),

  removeAttachment: (id) =>
    set((state) => ({
      attachedFiles: state.attachedFiles.filter((f) => f.id !== id),
    })),

  clearAttachments: () => set({ attachedFiles: [] }),

  sendPrompt: (promptText) => {
    if (!promptText.trim()) return;

    set((state) => {
      const activeThread = state.threads.find((t) => t.id === state.activeThreadId) ?? state.threads[0];
      const userMsg: ConsoleMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: promptText,
        timestamp: new Date().toISOString(),
        senderName: 'You',
        attachments: [...state.attachedFiles],
      };

      const updatedMessages = [...activeThread.messages, userMsg];

      // Simulate streaming response from THEKY
      setTimeout(() => {
        set((s) => {
          const t = s.threads.find((th) => th.id === s.activeThreadId);
          if (!t) return s;

          const assistantMsg: ConsoleMessage = {
            id: `msg-${Date.now()}-reply`,
            role: 'assistant',
            content: `I have processed your command: "${promptText}". THEKY has executed task decomposition, verified security token compliance via Permission Broker, and updated workspace state in the Vault.`,
            timestamp: new Date().toISOString(),
            senderName: 'THEKY',
            devDiagnostics: {
              modelRouted: 'Local Ollama Llama 3.1 8B (Automatic Internal Router)',
              latencyMs: 142,
              tokensTotal: 128,
              executionGraph: ['InputParser::parse', 'PermissionBroker::authorize', 'THEKY::execute_stream'],
            },
          };

          const newThreadMessages = [...t.messages, assistantMsg];
          const newThreads = s.threads.map((th) =>
            th.id === s.activeThreadId
              ? { ...th, messages: newThreadMessages, preview: assistantMsg.content, updatedAt: new Date().toISOString() }
              : th
          );

          return { threads: newThreads, isGenerating: false };
        });
      }, 500);

      const updatedThreads = state.threads.map((t) =>
        t.id === state.activeThreadId
          ? { ...t, messages: updatedMessages, title: t.messages.length === 1 ? promptText.slice(0, 30) : t.title }
          : t
      );

      return {
        threads: updatedThreads,
        isGenerating: true,
        attachedFiles: [],
      };
    });
  },

  stopGeneration: () => set({ isGenerating: false }),

  selectThread: (id) => set({ activeThreadId: id }),

  createNewThread: () => {
    const newId = `thread-${Date.now()}`;
    const newThread: ConversationThread = {
      id: newId,
      title: 'New Conversation',
      preview: 'Start typing to interact with THEKY...',
      updatedAt: new Date().toISOString(),
      pinned: false,
      favorite: false,
      archived: false,
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: 'Hello. I am THEKY. How can I assist your workspace objectives today?',
          timestamp: new Date().toISOString(),
          senderName: 'THEKY',
          devDiagnostics: {
            modelRouted: 'Local Ollama Sidecar',
            latencyMs: 40,
            tokensTotal: 18,
            executionGraph: ['THEKY::init_thread'],
          },
        },
      ],
    };

    set((state) => ({
      threads: [newThread, ...state.threads],
      activeThreadId: newId,
    }));
  },

  togglePinThread: (id) =>
    set((state) => ({
      threads: state.threads.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)),
    })),

  toggleFavoriteThread: (id) =>
    set((state) => ({
      threads: state.threads.map((t) => (t.id === id ? { ...t, favorite: !t.favorite } : t)),
    })),

  archiveThread: (id) =>
    set((state) => ({
      threads: state.threads.map((t) => (t.id === id ? { ...t, archived: true } : t)),
    })),

  deleteThread: (id) =>
    set((state) => {
      const filtered = state.threads.filter((t) => t.id !== id);
      const nextActive = state.activeThreadId === id && filtered.length > 0 ? filtered[0].id : state.activeThreadId;
      return { threads: filtered, activeThreadId: nextActive };
    }),

  renameThread: (id, newTitle) =>
    set((state) => ({
      threads: state.threads.map((t) => (t.id === id ? { ...t, title: newTitle } : t)),
    })),

  convertMessageToAction: (messageId, actionType) =>
    set((state) => ({
      threads: state.threads.map((t) => {
        if (t.id !== state.activeThreadId) return t;
        return {
          ...t,
          messages: t.messages.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  actionConverted: {
                    type: actionType,
                    id: `act-${Date.now()}`,
                    name: `${actionType} from THEKY Response`,
                  },
                }
              : m
          ),
        };
      }),
    })),

  isDeveloperModeEnabled: false,
  toggleDeveloperMode: () => set((state) => ({ isDeveloperModeEnabled: !state.isDeveloperModeEnabled })),

  smartSuggestions: DEFAULT_SUGGESTIONS,
}));
