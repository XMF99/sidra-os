export interface GraphNode {
  id: string;
  type: 'Project' | 'Mission' | 'Workflow' | 'Document' | 'Agent' | 'Department' | 'Artifact';
  label: string;
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  fromId: string;
  toId: string;
  relation: string;
}

export class KnowledgeGraph {
  private static instance: KnowledgeGraph;
  private nodes = new Map<string, GraphNode>();
  private edges: GraphEdge[] = [];

  public static getInstance(): KnowledgeGraph {
    if (!KnowledgeGraph.instance) {
      KnowledgeGraph.instance = new KnowledgeGraph();
    }
    return KnowledgeGraph.instance;
  }

  public addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
  }

  public addEdge(edge: GraphEdge): void {
    this.edges.push(edge);
  }

  public getRelatedEntities(entityId: string): GraphNode[] {
    const relatedIds = new Set<string>();
    this.edges.forEach((e) => {
      if (e.fromId === entityId) relatedIds.add(e.toId);
      if (e.toId === entityId) relatedIds.add(e.fromId);
    });

    const result: GraphNode[] = [];
    relatedIds.forEach((id) => {
      const node = this.nodes.get(id);
      if (node) result.push(node);
    });

    return result;
  }
}
