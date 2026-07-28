import { AgentModel, AgentState, AgentCapability, AgentRuntimeEvent, AgentMetrics } from './types';
import { AgentStateMachine } from './AgentStateMachine';
import { AgentRegistry } from './AgentRegistry';
import { AgentMailbox } from './AgentMailbox';
import { HeartbeatMonitor } from './HeartbeatMonitor';
import { SupervisionEngine } from './SupervisionEngine';
import { AgentMetricsEngine } from './AgentMetricsEngine';
import { ConnectorRuntime } from '../connector-framework/ConnectorRuntime';
import { ModelGateway } from '../model-gateway/ModelGateway';
import { KnowledgeRuntime } from '../knowledge-runtime/KnowledgeRuntime';

export type AgentEventListener = (event: AgentRuntimeEvent) => void;

export class AgentRuntime {
  private static instance: AgentRuntime;
  private registry = new AgentRegistry();
  private mailboxes = new Map<string, AgentMailbox>();
  private heartbeatMonitor = new HeartbeatMonitor();
  private supervisionEngine = SupervisionEngine.getInstance();
  private metricsEngine = AgentMetricsEngine.getInstance();
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
    if (this.eventLog.length > 300) {
      this.eventLog.pop();
    }
    this.listeners.forEach((fn) => fn(event));
  }

  public getEventLog(): AgentRuntimeEvent[] {
    return [...this.eventLog];
  }

  private registerDefaultAgents(): void {
    this.instantiateTemplate('tmpl_lead_architect', 'Auditor Agent Alpha');
    this.instantiateTemplate('tmpl_financial_auditor', 'Financial Auditor Agent');
    this.instantiateTemplate('tmpl_gamedev_artist', '3D Technical Artist');
  }

  public instantiateTemplate(templateId: string, nameOverride?: string): AgentModel {
    const tmpl = this.registry.getTemplate(templateId);
    if (!tmpl) throw new Error(`Agent Template '${templateId}' not found.`);

    const id = `AGT-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const agent: AgentModel = {
      id,
      name: nameOverride || tmpl.name,
      department: tmpl.department,
      role: tmpl.role,
      profile: { ...tmpl.profile },
      skills: tmpl.defaultSkills.map((s) => ({ ...s })),
      capabilities: [...tmpl.defaultCapabilities],
      permissions: [
        { id: `perm_${id}_1`, scope: 'connectors:read', grantedAt: now },
        { id: `perm_${id}_2`, scope: 'workflows:execute', grantedAt: now },
      ],
      memoryReferences: [
        { id: `mem_${id}_1`, type: 'context', summary: 'Platform Core Architectural Plan', referenceUri: 'file:///docs/01-architecture-overview.md' },
      ],
      priority: tmpl.priority,
      maxConcurrency: tmpl.maxConcurrency,
      state: 'ready',
      health: 'healthy',
      version: '1.0.0',
      metadata: {},
      lastHeartbeatAt: now,
      uptimeSeconds: 3600,
      assignedTasksCount: 0,
      completedTasksCount: 0,
    };

    this.registerAgent(agent);
    return agent;
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
    this.transitionState(agent, 'running');
    this.emitEvent('AgentStarted', agentId);
  }

  public pauseAgent(agentId: string): void {
    const agent = this.getAgentOrThrow(agentId);
    this.transitionState(agent, 'paused');
    this.emitEvent('AgentPaused', agentId);
  }

  public resumeAgent(agentId: string): void {
    const agent = this.getAgentOrThrow(agentId);
    this.transitionState(agent, 'running');
    this.emitEvent('AgentResumed', agentId);
  }

  public restartAgent(agentId: string): void {
    const agent = this.getAgentOrThrow(agentId);
    this.transitionState(agent, 'ready');
    this.startAgent(agentId);
  }

  public terminateAgent(agentId: string): void {
    const agent = this.getAgentOrThrow(agentId);
    this.transitionState(agent, 'offline');
    this.emitEvent('AgentStopped', agentId);
  }

  public recordHeartbeat(agentId: string): void {
    const agent = this.getAgentOrThrow(agentId);
    agent.lastHeartbeatAt = new Date().toISOString();
    this.heartbeatMonitor.recordHeartbeat(agent);
    this.supervisionEngine.auditAgentHealth(agent);
    this.emitEvent('HeartbeatReceived', agentId, { health: agent.health, uptimeSeconds: agent.uptimeSeconds });
  }

  // Capability Execution — STRICT RULE: All external calls route through Connector Runtime!
  public async requestCapability(
    agentId: string,
    connectorId: string,
    capability: string,
    payload: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const agent = this.getAgentOrThrow(agentId);
    this.emitEvent('CapabilityRequested', agentId, { connectorId, capability });

    const connectorRuntime = ConnectorRuntime.getInstance();
    const result = await connectorRuntime.executeCapability(connectorId, capability as any, payload);
    agent.completedTasksCount = (agent.completedTasksCount || 0) + 1;
    return result;
  }

  // Inter-Agent Delegation
  public delegateTask(senderAgentId: string, targetAgentId: string, taskPayload: unknown): void {
    const sender = this.getAgentOrThrow(senderAgentId);
    const target = this.getAgentOrThrow(targetAgentId);

    const mailbox = this.mailboxes.get(target.id);
    if (mailbox) {
      mailbox.enqueue({
        id: `MB-DEL-${Date.now()}`,
        agentId: target.id,
        senderAgentId: sender.id,
        type: 'agent.delegate',
        payload: taskPayload,
        status: 'queued',
        createdAt: new Date().toISOString(),
      });
    }

    this.metricsEngine.recordTaskDelegation();
    this.emitEvent('TaskDelegated', sender.id, { targetAgentId: target.id, payload: taskPayload });
  }

  // Inter-Agent Escalation
  public escalateTask(agentId: string, reason: string): void {
    const agent = this.getAgentOrThrow(agentId);
    this.transitionState(agent, 'blocked');
    this.emitEvent('TaskEscalated', agentId, { reason });
  }

  // Mission Assignment Matcher
  public assignMission(missionId: string, requiredCapability: AgentCapability): AgentModel | undefined {
    const candidates = this.registry.getAvailableForCapability(requiredCapability);
    if (candidates.length === 0) return undefined;

    candidates.sort((a, b) => b.priority - a.priority);
    const selected = candidates[0];

    this.transitionState(selected, 'assigned');
    this.transitionState(selected, 'running');
    selected.currentMissionId = missionId;
    selected.assignedTasksCount = (selected.assignedTasksCount || 0) + 1;

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
    agent.currentWorkflowId = undefined;
    agent.currentAutomationId = undefined;
    this.transitionState(agent, 'ready');
    this.emitEvent('AgentIdle', agentId);
  }

  private transitionState(agent: AgentModel, targetState: AgentState): void {
    AgentStateMachine.validateTransition(agent.state, targetState);
    agent.state = targetState;
  }

  public async executeModelTask(agentId: string, objective: string, categoryHint = 'analysis') {
    const agent = this.getAgentOrThrow(agentId);
    const knowledge = KnowledgeRuntime.getInstance();

    const retrieval = knowledge.retrieveContext(objective);
    const gateway = ModelGateway.getInstance();
    const startTime = Date.now();

    const response = await gateway.complete({
      agentId,
      missionId: agent.currentMissionId,
      categoryHint,
      messages: [
        { role: 'system', content: `Agent ${agent.name} (${agent.role})\n\nContext:\n${retrieval.compressedContext}` },
        { role: 'user', content: objective },
      ],
    });

    const duration = Date.now() - startTime;
    this.metricsEngine.recordTaskResponse(duration);
    return response;
  }

  public getRegistry(): AgentRegistry {
    return this.registry;
  }

  public getMailbox(agentId: string): AgentMailbox | undefined {
    return this.mailboxes.get(agentId);
  }

  public getMetrics(): AgentMetrics {
    return this.metricsEngine.getMetrics(this.registry.getAll());
  }

  private getAgentOrThrow(agentId: string): AgentModel {
    const agent = this.registry.getById(agentId);
    if (!agent) {
      throw new Error(`Agent '${agentId}' not registered in Agent Runtime.`);
    }
    return agent;
  }
}
