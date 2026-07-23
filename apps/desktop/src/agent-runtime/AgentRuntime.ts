import { AgentModel, AgentState, AgentCapability, AgentRuntimeEvent } from './types';
import { AgentStateMachine } from './AgentStateMachine';
import { AgentRegistry } from './AgentRegistry';
import { AgentMailbox } from './AgentMailbox';
import { HeartbeatMonitor } from './HeartbeatMonitor';

export type AgentEventListener = (event: AgentRuntimeEvent) => void;

export class AgentRuntime {
  private static instance: AgentRuntime;
  private registry = new AgentRegistry();
  private mailboxes = new Map<string, AgentMailbox>();
  private heartbeatMonitor = new HeartbeatMonitor();
  private listeners = new Set<AgentEventListener>();
  private eventLog: AgentRuntimeEvent[] = [];

  private constructor() {
    this.registerDefaultAgents();
  }

  public static getInstance(): AgentRuntime {
    if (!AgentRuntime.instance) {
      AgentRuntime.instance = new AgentRuntime();
    }
    return AgentRuntime.instance;
  }

  public subscribe(listener: AgentEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emitEvent(type: AgentRuntimeEvent['type'], agentId: string, payload?: Record<string, unknown>): void {
    const event: AgentRuntimeEvent = {
      id: `EV-AGT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      agentId,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.eventLog.unshift(event);
    this.listeners.forEach((fn) => fn(event));
  }

  public getEventLog(): AgentRuntimeEvent[] {
    return [...this.eventLog];
  }

  private registerDefaultAgents(): void {
    const defaultAgents: AgentModel[] = [
      {
        id: 'A-01',
        name: 'Auditor Agent Alpha',
        department: 'Self-Review',
        role: 'Compliance Reviewer',
        capabilities: ['analysis', 'planning', 'coding'],
        priority: 10,
        maxConcurrency: 2,
        state: 'idle',
        health: 'healthy',
        version: '1.0.0',
        metadata: {},
        lastHeartbeatAt: new Date().toISOString(),
        uptimeSeconds: 3600,
      },
      {
        id: 'A-02',
        name: 'Security Officer',
        department: 'Security',
        role: 'Fence Guard',
        capabilities: ['analysis', 'research'],
        priority: 9,
        maxConcurrency: 1,
        state: 'idle',
        health: 'healthy',
        version: '1.0.0',
        metadata: {},
        lastHeartbeatAt: new Date().toISOString(),
        uptimeSeconds: 3600,
      },
      {
        id: 'A-03',
        name: 'Ingest Worker',
        department: 'Knowledge',
        role: 'Chunker',
        capabilities: ['documentation', 'search'],
        priority: 5,
        maxConcurrency: 4,
        state: 'idle',
        health: 'healthy',
        version: '1.0.0',
        metadata: {},
        lastHeartbeatAt: new Date().toISOString(),
        uptimeSeconds: 3600,
      },
    ];

    defaultAgents.forEach((a) => this.registerAgent(a));
  }

  public registerAgent(agent: AgentModel): void {
    this.registry.register(agent);
    this.mailboxes.set(agent.id, new AgentMailbox());
    this.heartbeatMonitor.recordHeartbeat(agent);
    this.emitEvent('AgentRegistered', agent.id, { name: agent.name, role: agent.role });
  }

  public unregisterAgent(agentId: string): boolean {
    const res = this.registry.unregister(agentId);
    this.mailboxes.delete(agentId);
    return res;
  }

  public startAgent(agentId: string): void {
    const agent = this.getAgentOrThrow(agentId);
    this.transitionState(agent, 'starting');
    this.emitEvent('AgentStarted', agentId);
    this.transitionState(agent, 'idle');
    this.emitEvent('AgentIdle', agentId);
  }

  public stopAgent(agentId: string): void {
    const agent = this.getAgentOrThrow(agentId);
    this.transitionState(agent, 'stopping');
    this.transitionState(agent, 'offline');
    this.emitEvent('AgentStopped', agentId);
  }

  public suspendAgent(agentId: string): void {
    const agent = this.getAgentOrThrow(agentId);
    this.transitionState(agent, 'suspended');
  }

  public resumeAgent(agentId: string): void {
    const agent = this.getAgentOrThrow(agentId);
    this.transitionState(agent, 'idle');
    this.emitEvent('AgentIdle', agentId);
  }

  public recordHeartbeat(agentId: string): void {
    const agent = this.getAgentOrThrow(agentId);
    this.heartbeatMonitor.recordHeartbeat(agent);
    this.emitEvent('HeartbeatReceived', agentId, { health: agent.health, uptimeSeconds: agent.uptimeSeconds });
  }

  // Mission Assignment Matcher
  public assignMission(missionId: string, requiredCapability: AgentCapability): AgentModel | undefined {
    const candidates = this.registry.getAvailableForCapability(requiredCapability);
    if (candidates.length === 0) return undefined;

    // Sort by priority descending
    candidates.sort((a, b) => b.priority - a.priority);
    const selected = candidates[0];

    this.transitionState(selected, 'busy');
    selected.currentMissionId = missionId;

    const mailbox = this.mailboxes.get(selected.id);
    if (mailbox) {
      mailbox.enqueue({
        id: `MB-${Date.now()}`,
        agentId: selected.id,
        missionId,
        type: 'mission.execute',
        payload: { requiredCapability },
        status: 'queued',
        createdAt: new Date().toISOString(),
      });
    }

    this.emitEvent('AgentBusy', selected.id, { missionId });
    this.emitEvent('MissionAssigned', selected.id, { missionId, capability: requiredCapability });

    return selected;
  }

  public releaseAgent(agentId: string): void {
    const agent = this.getAgentOrThrow(agentId);
    agent.currentMissionId = undefined;
    this.transitionState(agent, 'idle');
    this.emitEvent('AgentIdle', agentId);
  }

  private transitionState(agent: AgentModel, targetState: AgentState): void {
    AgentStateMachine.validateTransition(agent.state, targetState);
    agent.state = targetState;
  }

  public getRegistry(): AgentRegistry {
    return this.registry;
  }

  public getMailbox(agentId: string): AgentMailbox | undefined {
    return this.mailboxes.get(agentId);
  }

  private getAgentOrThrow(agentId: string): AgentModel {
    const agent = this.registry.getById(agentId);
    if (!agent) {
      throw new Error(`Agent '${agentId}' not registered in Agent Runtime.`);
    }
    return agent;
  }
}
