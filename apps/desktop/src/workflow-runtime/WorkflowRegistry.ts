import { WorkflowDefinition, WorkflowNode } from './types';

export class WorkflowRegistry {
  private static instance: WorkflowRegistry;
  private workflows = new Map<string, WorkflowDefinition>();

  private constructor() {
    this.registerDefaultWorkflows();
  }

  public static getInstance(): WorkflowRegistry {
    if (!WorkflowRegistry.instance) {
      WorkflowRegistry.instance = new WorkflowRegistry();
    }
    return WorkflowRegistry.instance;
  }

  private registerDefaultWorkflows(): void {
    // 1. Executive Procurement Approval Workflow
    const procurementNodes = new Map<string, WorkflowNode>([
      ['start_proc', { id: 'start_proc', type: 'start', title: 'Procurement Request Submitted', nextNodes: ['verify_budget'] }],
      ['verify_budget', { id: 'verify_budget', type: 'service_task', title: 'Verify Department Budget', nextNodes: ['check_amount'] }],
      ['check_amount', { id: 'check_amount', type: 'decision', title: 'Amount > $10,000?', condition: 'amount > 10000', switchCases: { true: 'exec_approval', false: 'dept_approval' } }],
      ['exec_approval', { id: 'exec_approval', type: 'human_task', title: 'CFO Executive Approval', nextNodes: ['issue_po'], compensationNodeId: 'cancel_request', humanTask: { assigneeRole: 'CFO', approvalTitle: 'Approve High Value PO' } }],
      ['dept_approval', { id: 'dept_approval', type: 'human_task', title: 'Department Lead Approval', nextNodes: ['issue_po'], compensationNodeId: 'cancel_request', humanTask: { assigneeRole: 'Lead', approvalTitle: 'Approve Standard PO' } }],
      ['cancel_request', { id: 'cancel_request', type: 'task', title: 'Cancel Purchase Request & Notify' }],
      ['issue_po', { id: 'issue_po', type: 'connector_task', connectorId: 'conn_quickbooks', capability: 'create', title: 'Generate Purchase Order', nextNodes: ['end_proc'] }],
      ['end_proc', { id: 'end_proc', type: 'end', title: 'Procurement Completed' }],
    ]);

    const procurementWf: WorkflowDefinition = {
      id: 'wf_procurement',
      name: 'Executive Procurement Approval',
      version: '1.0.0',
      description: 'Structured PO request approval gate with financial ceiling decision branching & CFO signoff',
      startNodeId: 'start_proc',
      nodes: procurementNodes,
      category: 'finance',
      tags: ['procurement', 'approval', 'cfo'],
    };

    // 2. AI Content Publishing Pipeline
    const contentNodes = new Map<string, WorkflowNode>([
      ['start_content', { id: 'start_content', type: 'start', title: 'Content Brief Ingested', nextNodes: ['ai_generate'] }],
      ['ai_generate', { id: 'ai_generate', type: 'ai_task', title: 'Generate Article Copy via Claude', capability: 'execute', nextNodes: ['review_gate'] }],
      ['review_gate', { id: 'review_gate', type: 'human_task', title: 'Editorial Human Review', nextNodes: ['publish_cms'], compensationNodeId: 'notify_reject', humanTask: { assigneeRole: 'Editor', approvalTitle: 'Review Content Draft' } }],
      ['notify_reject', { id: 'notify_reject', type: 'task', title: 'Notify Writer of Rejection' }],
      ['publish_cms', { id: 'publish_cms', type: 'connector_task', connectorId: 'conn_notion', capability: 'write', title: 'Publish to Notion / CMS', nextNodes: ['end_content'] }],
      ['end_content', { id: 'end_content', type: 'end', title: 'Content Published' }],
    ]);

    const contentWf: WorkflowDefinition = {
      id: 'wf_content_publish',
      name: 'AI & Human Content Publishing',
      version: '1.0.0',
      description: 'AI content draft generation with mandatory editorial human review and multi-channel publication',
      startNodeId: 'start_content',
      nodes: contentNodes,
      category: 'marketing',
      tags: ['content', 'ai', 'editorial'],
    };

    // 3. Game Asset Build & Packaging Pipeline
    const gamedevNodes = new Map<string, WorkflowNode>([
      ['start_asset', { id: 'start_asset', type: 'start', title: '3D Asset Creation Request', nextNodes: ['generate_mesh'] }],
      ['generate_mesh', { id: 'generate_mesh', type: 'connector_task', connectorId: 'conn_meshy', capability: 'create', title: 'Generate Mesh via Meshy AI', nextNodes: ['opt_blender'] }],
      ['opt_blender', { id: 'opt_blender', type: 'connector_task', connectorId: 'conn_blender', capability: 'execute', title: 'Optimize Topology in Blender', nextNodes: ['import_unreal'] }],
      ['import_unreal', { id: 'import_unreal', type: 'connector_task', connectorId: 'conn_unreal', capability: 'execute', title: 'Import Asset into Unreal Engine 5', nextNodes: ['end_asset'] }],
      ['end_asset', { id: 'end_asset', type: 'end', title: 'Asset Production Complete' }],
    ]);

    const gamedevWf: WorkflowDefinition = {
      id: 'wf_gamedev_pipeline',
      name: 'Game Asset Generation & UE5 Pipeline',
      version: '1.0.0',
      description: 'End-to-end 3D asset generation from Meshy AI to Blender topology optimization to UE5 import',
      startNodeId: 'start_asset',
      nodes: gamedevNodes,
      category: 'gamedev',
      tags: ['gamedev', 'unreal', 'blender'],
    };

    this.register(procurementWf);
    this.register(contentWf);
    this.register(gamedevWf);
  }

  public register(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.id, workflow);
  }

  public get(id: string): WorkflowDefinition | undefined {
    return this.workflows.get(id);
  }

  public getAll(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }
}
