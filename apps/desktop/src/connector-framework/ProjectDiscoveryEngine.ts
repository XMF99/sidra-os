import { DiscoveredProject } from './types';
import { LocalAppDetector } from './LocalAppDetector';

export class ProjectDiscoveryEngine {
  private static instance: ProjectDiscoveryEngine;
  private detector = LocalAppDetector.getInstance();

  public static getInstance(): ProjectDiscoveryEngine {
    if (!ProjectDiscoveryEngine.instance) {
      ProjectDiscoveryEngine.instance = new ProjectDiscoveryEngine();
    }
    return ProjectDiscoveryEngine.instance;
  }

  public discoverProjects(connectorId: string): DiscoveredProject[] {
    const appInfo = this.detector.detectLocalApplication(connectorId);
    if (appInfo.projects) {
      return appInfo.projects;
    }

    // Default discovery fallback
    return [
      {
        id: `proj_discovered_${Date.now()}`,
        name: `Default Discovered Workspace for ${connectorId}`,
        path: `C:\\SidraWorkspaces\\${connectorId}`,
        type: 'Workspace',
        lastModified: new Date().toISOString(),
      },
    ];
  }
}
