import { LocalAppInfo } from './types';

export class LocalAppDetector {
  private static instance: LocalAppDetector;

  public static getInstance(): LocalAppDetector {
    if (!LocalAppDetector.instance) {
      LocalAppDetector.instance = new LocalAppDetector();
    }
    return LocalAppDetector.instance;
  }

  public detectLocalApplication(connectorId: string): LocalAppInfo {
    const appDatabase: Record<string, LocalAppInfo> = {
      conn_unity: {
        name: 'Unity Engine & Hub',
        installed: true,
        version: '6000.0.1f1',
        executablePath: 'C:\\Program Files\\Unity Hub\\Unity Hub.exe',
        pluginPath: 'C:\\Program Files\\Unity\\Hub\\Editor\\6000.0.1f1\\Editor\\Data\\Managed',
        plugins: ['LiveLinkBridge.dll', 'SidraAutomationPlugin.dll'],
        status: 'running',
        projects: [
          { id: 'proj_u1', name: 'CyberCity RPG', path: 'C:\\Projects\\CyberCity', type: 'Unity 6', version: '6000.0.1f1', lastModified: new Date().toISOString() },
          { id: 'proj_u2', name: 'Desert Racer', path: 'C:\\Projects\\DesertRacer', type: 'Unity 2023.2', version: '2023.2.14f1', lastModified: new Date().toISOString() },
        ],
      },
      conn_unreal: {
        name: 'Unreal Engine 5.5',
        installed: true,
        version: '5.5.1',
        executablePath: 'C:\\Program Files\\Epic Games\\UE_5.5\\Engine\\Binaries\\Win64\\UnrealEditor.exe',
        pluginPath: 'C:\\Program Files\\Epic Games\\UE_5.5\\Engine\\Plugins\\SidraConnector',
        plugins: ['LiveLink', 'SubstanceUE5', 'SidraOSBridge'],
        status: 'idle',
        projects: [
          { id: 'proj_ue1', name: 'NeonSamurai.uproject', path: 'C:\\UnrealProjects\\NeonSamurai', type: 'UE 5.5', version: '5.5.1', lastModified: new Date().toISOString() },
        ],
      },
      conn_godot: {
        name: 'Godot Engine 4.3',
        installed: true,
        version: '4.3.stable',
        executablePath: 'C:\\Tools\\Godot\\Godot_v4.3-stable_win64.exe',
        status: 'running',
        projects: [
          { id: 'proj_gd1', name: 'PixelQuest', path: 'C:\\GodotProjects\\PixelQuest', type: 'Godot 4.3', lastModified: new Date().toISOString() },
        ],
      },
      conn_blender: {
        name: 'Blender 3D 4.2 LTS',
        installed: true,
        version: '4.2.0',
        executablePath: 'C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe',
        plugins: ['NodeWrangler', 'Rigify', 'SidraBlenderAddon'],
        status: 'idle',
        projects: [
          { id: 'proj_bl1', name: 'HeroCharacter.blend', path: 'C:\\Assets\\3D\\HeroCharacter.blend', type: 'Blender Scene', lastModified: new Date().toISOString() },
        ],
      },
      conn_photoshop: {
        name: 'Adobe Photoshop 2026',
        installed: true,
        version: '27.0.1',
        executablePath: 'C:\\Program Files\\Adobe\\Adobe Photoshop 2026\\Photoshop.exe',
        status: 'running',
      },
      conn_illustrator: {
        name: 'Adobe Illustrator 2026',
        installed: true,
        version: '30.0.0',
        executablePath: 'C:\\Program Files\\Adobe\\Adobe Illustrator 2026\\Support Files\\Contents\\Windows\\Illustrator.exe',
        status: 'idle',
      },
      conn_substance: {
        name: 'Adobe Substance 3D Painter',
        installed: true,
        version: '10.1.0',
        executablePath: 'C:\\Program Files\\Adobe\\Adobe Substance 3D Painter\\Adobe Substance 3D Painter.exe',
        status: 'idle',
      },
      conn_vscode: {
        name: 'Visual Studio Code',
        installed: true,
        version: '1.98.0',
        executablePath: 'C:\\Users\\a_ala\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe',
        plugins: ['sidra-os.vscode-bridge', 'rust-lang.rust-analyzer'],
        status: 'running',
        projects: [
          { id: 'proj_vsc1', name: 'sidra-os.code-workspace', path: 'C:\\sidra-os', type: 'VS Code Workspace', lastModified: new Date().toISOString() },
        ],
      },
      conn_vs: {
        name: 'Visual Studio 2022 Enterprise',
        installed: true,
        version: '17.12.0',
        executablePath: 'C:\\Program Files\\Microsoft Visual Studio\\2022\\Enterprise\\Common7\\IDE\\devenv.exe',
        status: 'idle',
      },
    };

    return (
      appDatabase[connectorId] || {
        name: connectorId,
        installed: false,
        status: 'not_detected',
      }
    );
  }
}
