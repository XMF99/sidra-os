import { ConnectorEvent, ConnectorCapability, ConnectorLifecycleState, DiscoveredProject } from './types';
import { ConnectorRegistry } from './ConnectorRegistry';
import { AuthManager } from './AuthManager';
import { RateLimiter } from './RateLimiter';
import { RetryEngine } from './RetryEngine';
import { CircuitBreaker } from './CircuitBreaker';
import { TelemetryEngine } from './TelemetryEngine';
import { HealthMonitor } from './HealthMonitor';
import { LocalAppDetector } from './LocalAppDetector';
import { ProjectDiscoveryEngine } from './ProjectDiscoveryEngine';

export type ConnectorEventListener = (event: ConnectorEvent) => void;

export class ConnectorRuntime {
  private static instance: ConnectorRuntime;
  private registry = ConnectorRegistry.getInstance();
  private authManager = AuthManager.getInstance();
  private rateLimiter = RateLimiter.getInstance();
  private circuitBreaker = CircuitBreaker.getInstance();
  private telemetry = TelemetryEngine.getInstance();
  private healthMonitor = HealthMonitor.getInstance();
  private appDetector = LocalAppDetector.getInstance();
  private projectEngine = ProjectDiscoveryEngine.getInstance();

  private listeners = new Set<ConnectorEventListener>();
  private eventLog: ConnectorEvent[] = [];

  public static getInstance(): ConnectorRuntime {
    if (!ConnectorRuntime.instance) {
      ConnectorRuntime.instance = new ConnectorRuntime();
    }
    return ConnectorRuntime.instance;
  }

  public subscribe(listener: ConnectorEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emitEvent(
    type: ConnectorEvent['type'],
    connectorId: string,
    payload?: Record<string, unknown>
  ): void {
    const event: ConnectorEvent = {
      id: `EV-CN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      connectorId,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.eventLog.unshift(event);
    if (this.eventLog.length > 300) {
      this.eventLog.pop();
    }
    this.listeners.forEach((fn) => fn(event));
  }

  public getEventLog(): ConnectorEvent[] {
    return [...this.eventLog];
  }

  public async installConnector(connectorId: string): Promise<void> {
    const conn = this.registry.get(connectorId);
    if (!conn) throw new Error(`Connector '${connectorId}' not found in registry.`);

    conn.transitionState('downloading', 'healthy', 'Fetching connector binaries from marketplace');
    this.emitEvent('StateChanged', connectorId, { state: 'downloading' });
    await new Promise((r) => setTimeout(r, 200));

    conn.transitionState('installing', 'healthy', 'Unpacking and registering connector plugin');
    this.emitEvent('StateChanged', connectorId, { state: 'installing' });
    await new Promise((r) => setTimeout(r, 200));

    conn.transitionState('installed', 'healthy', 'Plugin installed successfully');
    this.emitEvent('StateChanged', connectorId, { state: 'installed' });

    // Automatic Local Application & Project Detection
    await this.detectLocalAppAndProjects(connectorId);
  }

  public async detectLocalAppAndProjects(connectorId: string): Promise<void> {
    const conn = this.registry.get(connectorId);
    if (!conn) return;

    conn.transitionState('detecting', 'healthy', 'Scanning local environment for installed applications');
    this.emitEvent('StateChanged', connectorId, { state: 'detecting' });

    const appInfo = this.appDetector.detectLocalApplication(connectorId);
    conn.detectedApp = appInfo;

    if (appInfo.installed) {
      conn.transitionState('detected', 'healthy', `Detected ${appInfo.name} v${appInfo.version || '1.0'}`);
      this.emitEvent('AppDetected', connectorId, { appInfo });

      const projects = this.projectEngine.discoverProjects(connectorId);
      if (projects.length > 0) {
        conn.selectedProject = projects[0];
        this.emitEvent('ProjectDiscovered', connectorId, { projects, selected: projects[0] });
      }
    } else {
      conn.transitionState('configured', 'healthy', 'No local app detected; using cloud endpoint');
    }
  }

  public async selectProject(connectorId: string, project: DiscoveredProject): Promise<void> {
    const conn = this.registry.get(connectorId);
    if (conn) {
      conn.selectedProject = project;
      this.emitEvent('ProjectDiscovered', connectorId, { selected: project });
      this.telemetry.log(connectorId, 'info', `Bound project: ${project.name} (${project.path})`);
    }
  }

  public async connectConnector(connectorId: string, credential?: string): Promise<boolean> {
    const conn = this.registry.get(connectorId);
    if (!conn) {
      throw new Error(`Connector '${connectorId}' not registered.`);
    }

    if (credential) {
      this.authManager.storeCredential(connectorId, credential);
    }

    conn.transitionState('authenticating', 'healthy', 'Validating auth tokens & scopes');
    this.emitEvent('StateChanged', connectorId, { state: 'authenticating' });

    const isValid = this.authManager.validateAuth(connectorId, conn.manifest.authType);
    if (!isValid) {
      conn.transitionState('unauthorized', 'failed', 'Credentials missing or invalid', 'Provide valid API Key or OAuth token');
      this.emitEvent('AuthFailed', connectorId, { authType: conn.manifest.authType });
      this.telemetry.log(connectorId, 'error', `Auth failed for ${conn.manifest.name}`);
      throw new Error(`Authentication failed for connector '${conn.manifest.name}'. Credentials missing.`);
    }

    conn.transitionState('authenticated', 'healthy', 'Token validated successfully');
    conn.transitionState('connecting', 'healthy', 'Establishing live socket / API session');
    this.emitEvent('StateChanged', connectorId, { state: 'connecting' });

    const success = await conn.connect();
    if (success) {
      conn.transitionState('ready', 'healthy', 'Connector ready and fully operational');
      this.emitEvent('ConnectorConnected', connectorId, { name: conn.manifest.name });
      this.telemetry.log(connectorId, 'info', `Connected successfully & ready: ${conn.manifest.name}`);
    }
    return success;
  }

  public async disconnectConnector(connectorId: string): Promise<void> {
    const conn = this.registry.get(connectorId);
    if (conn) {
      await conn.disconnect();
      conn.transitionState('disconnected', 'healthy', 'User disconnected connector');
      this.emitEvent('ConnectorDisconnected', connectorId);
      this.telemetry.log(connectorId, 'info', `Disconnected: ${conn.manifest.name}`);
    }
  }

  public async uninstallConnector(connectorId: string): Promise<void> {
    const conn = this.registry.get(connectorId);
    if (conn) {
      await conn.disconnect();
      conn.transitionState('uninstalled', 'healthy', 'Uninstalled from system');
      this.emitEvent('StateChanged', connectorId, { state: 'uninstalled' });
    }
  }

  public setConnectorState(connectorId: string, state: ConnectorLifecycleState): void {
    const conn = this.registry.get(connectorId);
    if (conn) {
      conn.transitionState(state, state === 'failed' ? 'failed' : 'healthy', `Manual state change to ${state}`);
      this.emitEvent('StateChanged', connectorId, { newState: state });
      this.telemetry.log(connectorId, 'info', `State changed to ${state}`);
    }
  }

  public async executeCapability(
    connectorId: string,
    capability: ConnectorCapability,
    payload: Record<string, unknown> = {}
  ): Promise<Record<string, unknown>> {
    const conn = this.registry.get(connectorId);
    if (!conn) {
      throw new Error(`Connector '${connectorId}' not found.`);
    }

    if (conn.state === 'disabled') {
      throw new Error(`Connector '${conn.manifest.name}' is currently disabled.`);
    }

    if (!this.rateLimiter.tryConsume(connectorId)) {
      conn.transitionState('rate_limited', 'degraded', 'Rate limit quota exceeded', 'Wait for token refill');
      this.telemetry.recordRateLimitHit(connectorId);
      this.emitEvent('RateLimitExceeded', connectorId, { capability });
      this.telemetry.log(connectorId, 'warn', `Rate limit exceeded for capability '${capability}'`);
      throw new Error(`Rate limit exceeded for connector '${conn.manifest.name}'.`);
    }

    if (!this.circuitBreaker.canExecute(connectorId)) {
      conn.transitionState('degraded', 'degraded', 'Circuit breaker open', 'Wait for cooldown period');
      this.emitEvent('CircuitBreakerOpened', connectorId, { capability });
      this.telemetry.log(connectorId, 'error', `Circuit breaker OPEN for connector '${conn.manifest.name}'`);
      throw new Error(`Circuit breaker open for connector '${conn.manifest.name}'. Request blocked.`);
    }

    if (conn.state !== 'ready' && conn.state !== 'connected') {
      await this.connectConnector(connectorId);
    }

    const startTime = Date.now();

    try {
      const result = await RetryEngine.executeWithRetry(async () => {
        return await conn.executeCapability(capability, payload);
      }, { maxRetries: 2, initialDelayMs: 150 });

      const latencyMs = Date.now() - startTime;
      conn.latencyMs = latencyMs;
      this.circuitBreaker.recordSuccess(connectorId);
      this.telemetry.recordExecution(connectorId, true, latencyMs);

      this.emitEvent('CapabilityExecuted', connectorId, { capability, latencyMs });
      this.telemetry.log(connectorId, 'info', `Capability '${capability}' executed in ${latencyMs}ms`);

      return result;
    } catch (err) {
      const latencyMs = Date.now() - startTime;
      conn.latencyMs = latencyMs;
      conn.errorCount += 1;
      this.circuitBreaker.recordFailure(connectorId);
      this.telemetry.recordExecution(connectorId, false, latencyMs);

      if (conn.errorCount >= 3) {
        conn.transitionState('failed', 'failed', (err as Error).message, 'Restart connector or check network');
      }

      this.telemetry.log(connectorId, 'error', `Execution failed: ${(err as Error).message}`);
      throw err;
    }
  }

  public async runHealthCheckAll(): Promise<Record<string, 'healthy' | 'degraded' | 'failed'>> {
    return await this.healthMonitor.runHealthCheckAll();
  }

  public getRegistry(): ConnectorRegistry {
    return this.registry;
  }

  public getAuthManager(): AuthManager {
    return this.authManager;
  }

  public getTelemetry(): TelemetryEngine {
    return this.telemetry;
  }

  public getRateLimiter(): RateLimiter {
    return this.rateLimiter;
  }

  public getCircuitBreaker(): CircuitBreaker {
    return this.circuitBreaker;
  }

  public getAppDetector(): LocalAppDetector {
    return this.appDetector;
  }

  public getProjectEngine(): ProjectDiscoveryEngine {
    return this.projectEngine;
  }
}
