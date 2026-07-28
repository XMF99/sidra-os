import { KnowledgeGraphEntity, KnowledgeGraphRelationship } from './types';

export class KnowledgeGraph {
  private static instance: KnowledgeGraph;
  private entities = new Map<string, KnowledgeGraphEntity>();
  private relationships: KnowledgeGraphRelationship[] = [];

  private constructor() {
    this.seedDefaultGraph();
  }

  public static getInstance(): KnowledgeGraph {
    if (!KnowledgeGraph.instance) {
      KnowledgeGraph.instance = new KnowledgeGraph();
    }
    return KnowledgeGraph.instance;
  }

  private seedDefaultGraph(): void {
    const e1: KnowledgeGraphEntity = { id: 'ENT-ORG-01', type: 'Organization', name: 'Sidra OS Platform Firm' };
    const e2: KnowledgeGraphEntity = { id: 'ENT-PROJ-01', type: 'Project', name: 'Desktop Alpha Monorepo' };
    const e3: KnowledgeGraphEntity = { id: 'ENT-DOC-01', type: 'Document', name: 'Sidra OS Security Policy' };
    const e4: KnowledgeGraphEntity = { id: 'ENT-MSN-01', type: 'Mission', name: 'Enterprise Platform Release' };
    const e5: KnowledgeGraphEntity = { id: 'ENT-AGT-01', type: 'Agent', name: 'Auditor Agent Alpha' };

    this.addEntity(e1);
    this.addEntity(e2);
    this.addEntity(e3);
    this.addEntity(e4);
    this.addEntity(e5);

    this.addRelationship({ id: 'REL-01', sourceEntityId: 'ENT-PROJ-01', targetEntityId: 'ENT-ORG-01', relationshipType: 'BELONGS_TO' });
    this.addRelationship({ id: 'REL-02', sourceEntityId: 'ENT-DOC-01', targetEntityId: 'ENT-PROJ-01', relationshipType: 'REFERENCES' });
    this.addRelationship({ id: 'REL-03', sourceEntityId: 'ENT-MSN-01', targetEntityId: 'ENT-PROJ-01', relationshipType: 'PART_OF' });
    this.addRelationship({ id: 'REL-04', sourceEntityId: 'ENT-AGT-01', targetEntityId: 'ENT-MSN-01', relationshipType: 'EXECUTES' });
  }

  public addEntity(entity: KnowledgeGraphEntity): void {
    this.entities.set(entity.id, entity);
  }

  public addRelationship(rel: KnowledgeGraphRelationship): void {
    this.relationships.push(rel);
  }

  public getEntity(id: string): KnowledgeGraphEntity | undefined {
    return this.entities.get(id);
  }

  public getAllEntities(): KnowledgeGraphEntity[] {
    return Array.from(this.entities.values());
  }

  public getAllRelationships(): KnowledgeGraphRelationship[] {
    return [...this.relationships];
  }
}
