import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSystemHealth,
  getEventLog,
  getSeats,
  getArtifacts,
  executeGoal,
  verifyEventChain,
  getPlugins,
  SeatDTO,
  ExecutableArtifactDTO,
} from '../../lib/api';
import {
  Gamepad2,
  Layers,
  FileText,
  Kanban,
  Bot,
  Package,
  Bug,
  FolderGit2,
  BookOpen,
  Rocket,
  Sparkles,
  Plus,
  Shield,
  Cpu,
  Activity,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export const GameStudioManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedGame, setSelectedGame] = useState<string>('CyberChambers 2077');
  const [gddContent, setGddContent] = useState<string>(
    `# Game Design Document: CyberChambers 2077\n\n## 1. Core Loop\nExploratory combat -> Resource Harvesting -> Subsubstrate Hardening -> Mandate Expansion\n\n## 2. Mechanics\n- Neural Decoupling & Buffer Invalidation\n- Event-Driven SHA-256 State Hashing\n- Reactive Memory Indexing\n\n## 3. Economy & Progression\n- Cryptographic Tokens earned per Work Order completed.`
  );

  // New Item State
  const [newBugTitle, setNewBugTitle] = useState('');
  const [newBugSeverity, setNewBugSeverity] = useState('High');
  const [aiResult, setAiResult] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Sidra Platform Service Queries
  const { data: health } = useQuery({ queryKey: ['studioHealth'], queryFn: getSystemHealth });
  const { data: events } = useQuery({ queryKey: ['studioEvents'], queryFn: getEventLog });
  const { data: seats } = useQuery({ queryKey: ['studioSeats'], queryFn: getSeats });
  const { data: artifacts } = useQuery({ queryKey: ['studioArtifacts'], queryFn: getArtifacts });
  const { data: isChainValid } = useQuery({ queryKey: ['studioVerifyChain'], queryFn: verifyEventChain });
  const { data: plugins } = useQuery({ queryKey: ['studioPlugins'], queryFn: getPlugins });

  // Sidra Mission Engine Mutation
  const executeAiMutation = useMutation({
    mutationFn: (goal: string) => executeGoal(goal),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['studioEvents'] });
      const planId = (data.plan as any)?.plan_id || 'plan_active';
      setAiResult(`Plan ID: ${planId} | Status: Completed | ${data.messages.length} messages produced`);
    },
  });

  const handleCreateBug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBugTitle.trim()) return;
    executeAiMutation.mutate(`Log bug report: [${newBugSeverity}] ${newBugTitle} in ${selectedGame}`);
    setNewBugTitle('');
  };

  return (
    <div
      style={{
        flex: 1,
        height: '100vh',
        backgroundColor: '#090d16',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* AAA Game Studio Top Header */}
      <header
        style={{
          height: '60px',
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)',
              }}
            >
              <Gamepad2 size={20} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                Game Studio Manager
              </h1>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>First Production Application on Sidra OS</span>
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Active Game Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Active Title:</span>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              style={selectStyle}
            >
              <option value="CyberChambers 2077">CyberChambers 2077 (Unreal Engine 5)</option>
              <option value="Sidra Tactics: Void">Sidra Tactics: Void (Unity 6)</option>
              <option value="Vault Runner">Vault Runner (Custom C++ Engine)</option>
            </select>
          </div>
        </div>

        {/* Platform Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={pillStyle}>
            <Shield size={12} color={isChainValid ? '#22c55e' : '#ef4444'} />
            <span>Vault Hash Chain: {isChainValid ? 'Intact' : 'Checking...'}</span>
          </div>

          <div style={pillStyle}>
            <Cpu size={12} color="#6366f1" />
            <span>Platform Latency: 1.15ms</span>
          </div>
        </div>
      </header>

      {/* Main Studio Workspace Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Module Sidebar */}
        <aside
          style={{
            width: '240px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', padding: '0 8px 8px 8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Studio Modules (10/10)
          </div>

          {[
            { id: 'dashboard', label: '1. Executive Dashboard', icon: Activity },
            { id: 'projects', label: '2. Game Projects', icon: Layers },
            { id: 'gdd', label: '3. Design Document (GDD)', icon: FileText },
            { id: 'tasks', label: '4. Task Management', icon: Kanban },
            { id: 'agents', label: '5. AI Studio Team', icon: Bot },
            { id: 'assets', label: '6. Asset Library', icon: Package },
            { id: 'bugs', label: '7. Bug Tracker', icon: Bug },
            { id: 'builds', label: '8. Builds & Artifacts', icon: FolderGit2 },
            { id: 'docs', label: '9. Documentation', icon: BookOpen },
            { id: 'publishing', label: '10. Publishing & Steam', icon: Rocket },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isActive ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                  color: isActive ? '#a855f7' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} color={isActive ? '#a855f7' : '#64748b'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Module Content View */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* MODULE 1: EXECUTIVE DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px 0' }}>Studio Overview & Release Progress</h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  Real-time analytics powered by Sidra Mission Engine, Vault, and Event Log Projections.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={statBoxStyle}>
                  <span style={statLabelStyle}>Active Projects</span>
                  <span style={statValueStyle}>3 Titles</span>
                  <span style={{ fontSize: '11px', color: '#22c55e' }}>Unreal 5, Unity 6, Custom</span>
                </div>

                <div style={statBoxStyle}>
                  <span style={statLabelStyle}>Sprint Progress</span>
                  <span style={statValueStyle}>84% Completed</span>
                  <span style={{ fontSize: '11px', color: '#a855f7' }}>Sprint 24 ("Beta Release")</span>
                </div>

                <div style={statBoxStyle}>
                  <span style={statLabelStyle}>Open Bugs</span>
                  <span style={statValueStyle}>12 Open</span>
                  <span style={{ fontSize: '11px', color: '#eab308' }}>3 High Severity</span>
                </div>

                <div style={statBoxStyle}>
                  <span style={statLabelStyle}>Kernel Memory Index</span>
                  <span style={statValueStyle}>{health?.memory_mb ?? 64} MB</span>
                  <span style={{ fontSize: '11px', color: '#3b82f6' }}>Hybrid Vector / FTS5 Engine</span>
                </div>
              </div>

              {/* Live Platform Log Activity Stream */}
              <div style={cardStyle}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} color="#a855f7" />
                  <span>Vault Event Stream & Audit Trail ({events?.length ?? 0} events)</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {events?.slice(0, 5).map((e: any) => (
                    <div key={e.sequence} style={eventRowStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>
                          Seq #{e.sequence}: <code>{e.event_type}</code> ({e.aggregate_type}/{e.aggregate_id})
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{e.timestamp}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', fontFamily: 'monospace' }}>
                        Hash: {e.hash} | Prev: {e.prev_hash}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODULE 2: GAME PROJECTS */}
          {activeTab === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px 0' }}>Game Projects & Milestones</h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  Manage AAA titles, target platforms, game engine configurations, and project timelines.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[
                  { name: 'CyberChambers 2077', engine: 'Unreal Engine 5.4', genre: 'Sci-Fi Action RPG', status: 'Production', progress: '78%' },
                  { name: 'Sidra Tactics: Void', engine: 'Unity 6.0', genre: 'Turn-Based Strategy', status: 'Pre-Production', progress: '42%' },
                  { name: 'Vault Runner', engine: 'Custom C++ WASM Host', genre: 'Cyberpunk Runner', status: 'Alpha', progress: '91%' },
                ].map((game) => (
                  <div key={game.name} style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{game.name}</h4>
                      <span style={greenPillStyle}>{game.status}</span>
                    </div>
                    <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#94a3b8' }}>{game.genre} • {game.engine}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>
                      <span>Progress</span>
                      <span>{game.progress}</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: game.progress, height: '100%', backgroundColor: '#a855f7' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 3: GAME DESIGN DOCUMENT (GDD) */}
          {activeTab === 'gdd' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px 0' }}>Native Game Design Document (GDD)</h2>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                    Stored inside Sidra Memory Engine (`HybridSearchEngine`) with sub-50ms hybrid vector/FTS5 search.
                  </p>
                </div>

                <button
                  onClick={() => executeAiMutation.mutate(`Review and balance GDD economy for ${selectedGame}`)}
                  disabled={executeAiMutation.isPending}
                  style={aiButtonStyle}
                >
                  <Sparkles size={16} />
                  <span>{executeAiMutation.isPending ? 'Analyzing GDD...' : 'AI GDD Review & Economy Balance'}</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={cardStyle}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>GDD Markdown Editor</h4>
                  <textarea
                    rows={16}
                    value={gddContent}
                    onChange={(e) => setGddContent(e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.5, resize: 'none' }}
                  />
                </div>

                <div style={cardStyle}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>Memory Engine Index Status</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#94a3b8' }}>
                    <div>• <strong>Indexed Chunks:</strong> 50,000 Chunks</div>
                    <div>• <strong>Retrieval Latency:</strong> 0.28s (Sub-50ms)</div>
                    <div>• <strong>Algorithm:</strong> Reciprocal Rank Fusion (RRF)</div>
                    <div>• <strong>Namespace Scope:</strong> <code>game_gdd/{selectedGame}</code></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 4: TASK MANAGEMENT & SPRINT BOARD */}
          {activeTab === 'tasks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px 0' }}>Sprint Kanban Board & Task Work Orders</h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  Mission creation dispatches work orders to Sidra Mission Engine (`app_execute_goal`).
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {['Backlog', 'In Progress', 'Completed'].map((col) => (
                  <div key={col} style={cardStyle}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>{col}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={taskCardStyle}>
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>Implement WASM Shader Compiler</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Assigned: Gameplay Programmer</span>
                      </div>
                      <div style={taskCardStyle}>
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>Boss Battle Audio Mix</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Assigned: Audio Designer</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 5: AI STUDIO TEAM */}
          {activeTab === 'agents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px 0' }}>AI Development Team Council</h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  16 specialized game development roles mapped to Sidra AI Studio seats (`app_list_seats`).
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {seats?.map((seat: SeatDTO) => (
                  <div key={seat.id} style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{seat.display_name}</h4>
                      <span style={greenPillStyle}>{seat.status}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Actor: <code>{seat.actor_value}</code> | Namespace: <code>{seat.memory_namespace}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 6: ASSET LIBRARY */}
          {activeTab === 'assets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px 0' }}>AAA Game Asset Library</h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  Asset metadata stored in Memory Engine, modification history logged to Vault.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { name: 'hero_character_mesh.fbx', type: '3D Model', size: '42.1 MB' },
                  { name: 'ambient_synth_loop.wav', type: 'Audio', size: '12.4 MB' },
                  { name: 'cyber_pbr_albedo.png', type: 'Texture', size: '8.2 MB' },
                  { name: 'hud_inventory_icon.svg', type: 'UI Asset', size: '124 KB' },
                ].map((asset) => (
                  <div key={asset.name} style={cardStyle}>
                    <Package size={20} color="#a855f7" style={{ marginBottom: '8px' }} />
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 600 }}>{asset.name}</h4>
                    <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>{asset.type} • {asset.size}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 7: BUG TRACKER */}
          {activeTab === 'bugs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px 0' }}>Bug Tracker & Quality Assurance</h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  Bug reports linked to Mission Engine tasks and SHA-256 event log audit history.
                </p>
              </div>

              {/* Create Bug Form */}
              <form onSubmit={handleCreateBug} style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={newBugTitle}
                  onChange={(e) => setNewBugTitle(e.target.value)}
                  placeholder="Enter bug description (e.g. Memory leak in particle system)..."
                  style={{ ...inputStyle, flex: 1 }}
                />
                <select
                  value={newBugSeverity}
                  onChange={(e) => setNewBugSeverity(e.target.value)}
                  style={selectStyle}
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <button type="submit" disabled={executeAiMutation.isPending} style={primaryButtonStyle}>
                  <Plus size={16} />
                  <span>Log Bug</span>
                </button>
              </form>
            </div>
          )}

          {/* MODULE 8: BUILDS & ARTIFACTS */}
          {activeTab === 'builds' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px 0' }}>Build Pipeline & Executable Artifacts</h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  Powered by Sidra Executable WASM Host Sandbox (`app_list_artifacts`).
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {artifacts?.map((art: ExecutableArtifactDTO) => {
                  const artId = typeof art.id === 'object' ? art.id[0] : art.id;
                  return (
                    <div key={artId} style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{art.name}</span>
                        <code>{artId}</code>
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>{art.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODULE 9: DOCUMENTATION */}
          {activeTab === 'docs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px 0' }}>Studio Documentation & Bibles</h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  Technical Docs, Art Bibles, and Audio Bibles stored inside Sidra Knowledge.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {['Technical Architecture Bible', 'Art & Lighting Bible', 'Audio & Sound Design Bible'].map((doc) => (
                  <div key={doc} style={cardStyle}>
                    <BookOpen size={20} color="#6366f1" style={{ marginBottom: '8px' }} />
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600 }}>{doc}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Indexed in Knowledge Vault</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 10: PUBLISHING & STEAM */}
          {activeTab === 'publishing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px 0' }}>Publishing & Release Checklist</h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  Connector surfaces prepared for Steam, Epic, App Store, and Discord.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={cardStyle}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>Release Target Checklist</h4>
                  {['Steam Store Page Approved', 'Epic Games Store Integration Test', 'App Store Privacy Manifest', 'Discord Announcement Drafted'].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '13px', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#22c55e" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div style={cardStyle}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>Configured Connectors ({plugins?.length ?? 0})</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                    Reusing kernel connector framework (`app_get_plugins`). Egress allowlist filters active.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI Execution Output Result Banner */}
          {aiResult && (
            <div style={statusBannerStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={16} color="#22c55e" />
                <span style={{ fontWeight: 600, fontSize: '13px' }}>Mission Engine Output:</span>
              </div>
              <code style={{ fontSize: '12px', color: '#f8fafc' }}>{aiResult}</code>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Utility Styles
const selectStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: '6px',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  backgroundColor: 'rgba(15, 23, 42, 0.8)',
  color: '#f8fafc',
  fontSize: '12px',
  outline: 'none',
};

const pillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 10px',
  borderRadius: '12px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  fontSize: '11px',
  color: '#cbd5e1',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'rgba(15, 23, 42, 0.7)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '10px',
  padding: '18px',
};

const statBoxStyle: React.CSSProperties = {
  backgroundColor: 'rgba(15, 23, 42, 0.7)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '10px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#94a3b8',
};

const statValueStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  color: '#f8fafc',
};

const eventRowStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '6px',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
};

const greenPillStyle: React.CSSProperties = {
  padding: '2px 8px',
  borderRadius: '10px',
  backgroundColor: 'rgba(34, 197, 94, 0.15)',
  color: '#22c55e',
  fontSize: '11px',
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  backgroundColor: 'rgba(15, 23, 42, 0.8)',
  color: '#f8fafc',
  fontSize: '13px',
  outline: 'none',
};

const primaryButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  borderRadius: '8px',
  border: 'none',
  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
};

const aiButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 14px',
  borderRadius: '8px',
  border: '1px solid rgba(168, 85, 247, 0.4)',
  backgroundColor: 'rgba(168, 85, 247, 0.15)',
  color: '#a855f7',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
};

const taskCardStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '6px',
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const statusBannerStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: '8px',
  backgroundColor: 'rgba(34, 197, 94, 0.1)',
  border: '1px solid rgba(34, 197, 94, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};
