import { BaseConnector } from './ConnectorSDK';
import { ConnectorManifest, ConnectorCapability } from './types';

class ReferenceConnector extends BaseConnector {
  public async executeCapability(
    capability: ConnectorCapability,
    payload: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return {
      status: 'success',
      connectorId: this.manifest.id,
      capability,
      result: `Executed '${capability}' capability on ${this.manifest.name}`,
      payload,
      timestamp: new Date().toISOString(),
    };
  }
}

export class ConnectorRegistry {
  private static instance: ConnectorRegistry;
  private connectors = new Map<string, BaseConnector>();

  private constructor() {
    this.registerReferenceConnectors();
  }

  public static getInstance(): ConnectorRegistry {
    if (!ConnectorRegistry.instance) {
      ConnectorRegistry.instance = new ConnectorRegistry();
    }
    return ConnectorRegistry.instance;
  }

  private registerReferenceConnectors(): void {
    const references: ConnectorManifest[] = [
      // 1. AI
      { id: 'conn_openrouter', name: 'OpenRouter AI', category: 'ai', version: '1.0.0', description: 'Universal LLM Gateway', authType: 'api_key', capabilities: ['execute', 'stream', 'read'] },
      { id: 'conn_openai', name: 'OpenAI GPT-4o', category: 'ai', version: '1.0.0', description: 'OpenAI API Connector', authType: 'api_key', capabilities: ['execute', 'stream', 'read'] },
      { id: 'conn_anthropic', name: 'Anthropic Claude', category: 'ai', version: '1.0.0', description: 'Anthropic Claude API', authType: 'api_key', capabilities: ['execute', 'stream'] },

      // 2. Game Development
      { id: 'conn_unity', name: 'Unity Engine API', category: 'gamedev', version: '1.0.0', description: 'Unity Asset & Build Pipeline', authType: 'api_key', capabilities: ['create', 'execute', 'read'] },
      { id: 'conn_unreal', name: 'Unreal Engine', category: 'gamedev', version: '1.0.0', description: 'Unreal Live Link & Automation', authType: 'api_key', capabilities: ['execute', 'read'] },
      { id: 'conn_godot', name: 'Godot Engine', category: 'gamedev', version: '1.0.0', description: 'Godot Project Bridge', authType: 'none', capabilities: ['create', 'read'] },

      // 3. Design
      { id: 'conn_figma', name: 'Figma Design', category: 'design', version: '1.0.0', description: 'Figma UI/UX Tokens & Assets', authType: 'oauth2', capabilities: ['read', 'download', 'webhook'] },
      { id: 'conn_photoshop', name: 'Adobe Photoshop', category: 'design', version: '1.0.0', description: 'Adobe Creative Cloud Connector', authType: 'api_key', capabilities: ['create', 'update'] },

      // 4. Source Control
      { id: 'conn_github', name: 'GitHub Integration', category: 'source_control', version: '1.0.0', description: 'Git Repositories, PRs, Actions', authType: 'oauth2', capabilities: ['read', 'write', 'create', 'webhook'] },
      { id: 'conn_gitlab', name: 'GitLab', category: 'source_control', version: '1.0.0', description: 'GitLab CI/CD & Repos', authType: 'api_key', capabilities: ['read', 'write', 'webhook'] },

      // 5. Project Management
      { id: 'conn_jira', name: 'Atlassian Jira', category: 'project_mgmt', version: '1.0.0', description: 'Jira Issue & Sprint Tracker', authType: 'oauth2', capabilities: ['create', 'update', 'read', 'search'] },
      { id: 'conn_linear', name: 'Linear App', category: 'project_mgmt', version: '1.0.0', description: 'Linear Issue Tracking', authType: 'api_key', capabilities: ['create', 'update', 'read'] },

      // 6. Communication
      { id: 'conn_slack', name: 'Slack Workplace', category: 'communication', version: '1.0.0', description: 'Slack Bot & Channels', authType: 'oauth2', capabilities: ['write', 'read', 'webhook', 'stream'] },
      { id: 'conn_discord', name: 'Discord Bot', category: 'communication', version: '1.0.0', description: 'Discord Community Bridge', authType: 'api_key', capabilities: ['write', 'read', 'webhook'] },

      // 7. Database
      { id: 'conn_postgres', name: 'PostgreSQL Database', category: 'database', version: '1.0.0', description: 'Relational DB Connector', authType: 'basic', capabilities: ['read', 'write', 'create', 'search'] },
      { id: 'conn_supabase', name: 'Supabase BaaS', category: 'database', version: '1.0.0', description: 'Supabase DB & Storage', authType: 'api_key', capabilities: ['read', 'write', 'realtime'] },

      // 8. Finance
      { id: 'conn_stripe', name: 'Stripe Payments', category: 'finance', version: '1.0.0', description: 'Stripe Billing & Invoices', authType: 'api_key', capabilities: ['create', 'read', 'webhook'] },
      { id: 'conn_quickbooks', name: 'Intuit QuickBooks', category: 'finance', version: '1.0.0', description: 'Enterprise Accounting', authType: 'oauth2', capabilities: ['read', 'create'] },

      // 9. E-Commerce
      { id: 'conn_shopify', name: 'Shopify Store', category: 'ecommerce', version: '1.0.0', description: 'E-Commerce Storefront API', authType: 'oauth2', capabilities: ['read', 'create', 'update', 'webhook'] },

      // 10. Observability
      { id: 'conn_grafana', name: 'Grafana Telemetry', category: 'observability', version: '1.0.0', description: 'Grafana Dashboards & Metrics', authType: 'api_key', capabilities: ['read', 'stream'] },
    ];

    references.forEach((manifest) => {
      const conn = new ReferenceConnector(manifest);
      this.connectors.set(manifest.id, conn);
    });
  }

  public register(connector: BaseConnector): void {
    this.connectors.set(connector.manifest.id, connector);
  }

  public get(id: string): BaseConnector | undefined {
    return this.connectors.get(id);
  }

  public getByCategory(category: string): BaseConnector[] {
    return Array.from(this.connectors.values()).filter((c) => c.manifest.category === category);
  }

  public getAll(): BaseConnector[] {
    return Array.from(this.connectors.values());
  }
}
