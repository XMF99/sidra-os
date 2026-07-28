import { DocumentRecord } from './types';

export class DocumentRegistry {
  private static instance: DocumentRegistry;
  private documents = new Map<string, DocumentRecord>();

  public static getInstance(): DocumentRegistry {
    if (!DocumentRegistry.instance) {
      DocumentRegistry.instance = new DocumentRegistry();
    }
    return DocumentRegistry.instance;
  }

  public register(doc: DocumentRecord): void {
    this.documents.set(doc.id, doc);
  }

  public unregister(id: string): boolean {
    return this.documents.delete(id);
  }

  public get(id: string, requesterWorkspaceId?: string): DocumentRecord | undefined {
    const doc = this.documents.get(id);
    if (!doc) return undefined;

    if (requesterWorkspaceId && doc.workspaceId !== requesterWorkspaceId) {
      return undefined;
    }
    return doc;
  }

  public getById(id: string): DocumentRecord | undefined {
    return this.documents.get(id);
  }

  public getByWorkspace(workspaceId: string): DocumentRecord[] {
    return Array.from(this.documents.values()).filter((d) => d.workspaceId === workspaceId);
  }

  public getAll(): DocumentRecord[] {
    return Array.from(this.documents.values());
  }

  public getAllMap(): Map<string, DocumentRecord> {
    return new Map(this.documents);
  }
}
