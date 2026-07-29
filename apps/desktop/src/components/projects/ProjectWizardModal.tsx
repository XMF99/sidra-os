import React, { useState, useEffect } from 'react';
import { X, Sparkles, FolderPlus, Gamepad2, Code, Building2, Cpu, Megaphone, FileText, CheckCircle, ArrowRight, ArrowLeft, Users, Bot, FolderCheck } from 'lucide-react';
import { useShellStore } from '../../state/useShellStore';
import { VoiceInputAffordance } from '../common/VoiceInputAffordance';

interface ProjectWizardModalProps {
  onClose?: () => void;
  onProjectCreated?: (project: any) => void;
}

export type ProjectType = 'game_studio' | 'software' | 'erp' | 'research' | 'marketing' | 'blank';

interface TemplateOption {
  id: ProjectType;
  title: string;
  description: string;
  icon: typeof Gamepad2;
  color: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'game_studio',
    title: 'Game Studio',
    description: '3D/2D game development pipeline with graphics, physics, levels, and asset management.',
    icon: Gamepad2,
    color: '#8b5cf6',
  },
  {
    id: 'software',
    title: 'Software',
    description: 'Full-stack application development suite with CI/CD, repos, and issue tracking.',
    icon: Code,
    color: '#3b82f6',
  },
  {
    id: 'erp',
    title: 'ERP Systems',
    description: 'Enterprise resource planning, financial operations, supply chain, and workflows.',
    icon: Building2,
    color: '#10b981',
  },
  {
    id: 'research',
    title: 'Research & AI',
    description: 'Data science, AI models, paper synthesis, and scientific experimentation.',
    icon: Cpu,
    color: '#f59e0b',
  },
  {
    id: 'marketing',
    title: 'Marketing & Growth',
    description: 'Campaign planning, brand assets, social media execution, and content hub.',
    icon: Megaphone,
    color: '#ec4899',
  },
  {
    id: 'blank',
    title: 'Blank Workspace',
    description: 'Custom empty project workspace with basic storage and AI access.',
    icon: FileText,
    color: '#64748b',
  },
];

export const ProjectWizardModal: React.FC<ProjectWizardModalProps> = ({ onClose, onProjectCreated }) => {
  const { isProjectWizardOpen, setProjectWizardOpen, selectedProjectTemplate } = useShellStore();

  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [projectType, setProjectType] = useState<ProjectType>('software');
  const [description, setDescription] = useState<string>('');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(['Engineering', 'Product']);
  const [selectedAiAgents, setSelectedAiAgents] = useState<string[]>([
    'Lead Architect Agent',
    'Full-Stack Developer Agent',
    'QA Tester Bot',
  ]);
  const [isProvisioning, setIsProvisioning] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  useEffect(() => {
    if (selectedProjectTemplate && isProjectWizardOpen) {
      if (selectedProjectTemplate === 'Game Studio' || selectedProjectTemplate === 'game_studio') {
        setProjectType('game_studio');
        setName('New Game Studio Project');
      }
    }
  }, [selectedProjectTemplate, isProjectWizardOpen]);

  if (!isProjectWizardOpen) return null;

  const handleClose = () => {
    setProjectWizardOpen(false);
    setStep(1);
    setIsComplete(false);
    if (onClose) onClose();
  };

  const handleToggleDepartment = (dept: string) => {
    if (selectedDepartments.includes(dept)) {
      setSelectedDepartments(selectedDepartments.filter((d) => d !== dept));
    } else {
      setSelectedDepartments([...selectedDepartments, dept]);
    }
  };

  const handleToggleAgent = (agent: string) => {
    if (selectedAiAgents.includes(agent)) {
      setSelectedAiAgents(selectedAiAgents.filter((a) => a !== agent));
    } else {
      setSelectedAiAgents([...selectedAiAgents, agent]);
    }
  };

  const handleFinish = () => {
    setIsProvisioning(true);
    setTimeout(() => {
      setIsProvisioning(false);
      setIsComplete(true);

      const createdProject = {
        id: `prj-${Date.now()}`,
        name: name || 'Untitled Project',
        type: projectType,
        description,
        departments: selectedDepartments,
        aiAgents: selectedAiAgents,
        status: 'Active',
        progress: 15,
        createdAt: new Date().toISOString(),
        spaces: {
          knowledge: `${name || 'Project'} Knowledge Space`,
          missionBoard: `${name || 'Project'} Mission Board`,
          folders: ['Assets', 'Documentation', 'Source Code', 'Design Briefs'],
          aiWorkspace: `${name || 'Project'} Autonomous Agent Lab`,
        },
      };

      if (onProjectCreated) {
        onProjectCreated(createdProject);
      }

      setTimeout(() => {
        handleClose();
      }, 1500);
    }, 1200);
  };

  const allDepartments = ['Engineering', 'Design', 'Operations', 'Product', 'Marketing', 'Finance'];
  const allAgents = [
    'Lead Architect Agent',
    'Game Designer Agent',
    'Full-Stack Developer Agent',
    'QA Tester Bot',
    'Content Strategist AI',
    'Operations Manager Agent',
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
          border: '1px solid var(--sd-color-border, #334155)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: 'var(--sd-color-text, #f8fafc)',
        }}
      >
        {/* Wizard Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--sd-color-border, #334155)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.12) 0%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--sd-color-primary, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <FolderPlus size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Create New Project</h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--sd-color-text-muted, #94a3b8)' }}>
                Step {step} of 6 — {step === 1 ? 'Project Name' : step === 2 ? 'Project Type' : step === 3 ? 'Description' : step === 4 ? 'Departments' : step === 5 ? 'AI Team' : 'Finish & Provision'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--sd-color-text-muted, #94a3b8)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--sd-color-border, #334155)',
            backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '4px',
                backgroundColor: i <= step ? 'var(--sd-color-primary, #6366f1)' : 'transparent',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Body Content by Step */}
        <div style={{ padding: '24px', flex: 1, minHeight: '340px' }}>
          {/* STEP 1: PROJECT NAME */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Step 1: What is your project named?</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--sd-color-text-muted, #94a3b8)' }}>
                Choose a clear, recognizable name for your new workspace.
              </p>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. NextGen Cyberpunk RPG Studio"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--sd-color-border, #334155)',
                  backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                  color: 'var(--sd-color-text, #f8fafc)',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {/* STEP 2: PROJECT TYPE */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Step 2: Select Project Type & Template</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {TEMPLATES.map((tmpl) => {
                  const Icon = tmpl.icon;
                  const isSelected = projectType === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setProjectType(tmpl.id)}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        border: isSelected ? `2px solid ${tmpl.color}` : '1px solid var(--sd-color-border, #334155)',
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--sd-color-bg-inset, #0f172a)',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          backgroundColor: tmpl.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{tmpl.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--sd-color-text-muted, #94a3b8)', marginTop: '2px' }}>
                          {tmpl.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: DESCRIPTION */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Step 3: Project Overview & Objectives</h3>
                <VoiceInputAffordance
                  size="sm"
                  currentValue={description}
                  onTranscript={(text) => setDescription(text)}
                />
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--sd-color-text-muted, #94a3b8)' }}>
                Describe the key goals, deliverables, and vision for this project.
              </p>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your vision, key milestones, or dictate using voice..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--sd-color-border, #334155)',
                  backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                  color: 'var(--sd-color-text, #f8fafc)',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>
          )}

          {/* STEP 4: DEPARTMENTS */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Step 4: Select Participating Departments</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--sd-color-text-muted, #94a3b8)' }}>
                Choose which organization departments will be assigned to this project.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {allDepartments.map((dept) => {
                  const isChecked = selectedDepartments.includes(dept);
                  return (
                    <div
                      key={dept}
                      onClick={() => handleToggleDepartment(dept)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: isChecked ? '1px solid var(--sd-color-primary, #6366f1)' : '1px solid var(--sd-color-border, #334155)',
                        backgroundColor: isChecked ? 'rgba(99, 102, 241, 0.15)' : 'var(--sd-color-bg-inset, #0f172a)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '13px',
                        fontWeight: 500,
                      }}
                    >
                      <Users size={16} style={{ color: isChecked ? 'var(--sd-color-primary, #6366f1)' : '#94a3b8' }} />
                      <span>{dept}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: AI TEAM */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Step 5: Assemble AI Team & Agents</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--sd-color-text-muted, #94a3b8)' }}>
                Assign specialized autonomous AI agents to drive tasks and missions for this project.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {allAgents.map((agent) => {
                  const isChecked = selectedAiAgents.includes(agent);
                  return (
                    <div
                      key={agent}
                      onClick={() => handleToggleAgent(agent)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: isChecked ? '1px solid #10b981' : '1px solid var(--sd-color-border, #334155)',
                        backgroundColor: isChecked ? 'rgba(16, 185, 129, 0.15)' : 'var(--sd-color-bg-inset, #0f172a)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '13px',
                        fontWeight: 500,
                      }}
                    >
                      <Bot size={16} style={{ color: isChecked ? '#10b981' : '#94a3b8' }} />
                      <span>{agent}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: FINISH & PROVISION */}
          {step === 6 && (
            <div>
              {isProvisioning ? (
                <div style={{ padding: '48px 0', textAlign: 'center' }}>
                  <Sparkles size={48} style={{ color: 'var(--sd-color-primary, #6366f1)', animation: 'pulse 1.5s infinite' }} />
                  <h3 style={{ margin: '16px 0 0 0', fontSize: '18px', fontWeight: 600 }}>Provisioning Project Workspace...</h3>
                  <p style={{ color: 'var(--sd-color-text-muted, #94a3b8)', fontSize: '13px', marginTop: '6px' }}>
                    Building Knowledge Space, Mission Board, Folders, and AI Workspace
                  </p>
                </div>
              ) : isComplete ? (
                <div style={{ padding: '48px 0', textAlign: 'center' }}>
                  <CheckCircle size={56} style={{ color: '#10b981', margin: '0 auto 16px auto' }} />
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Project Ready!</h3>
                  <p style={{ color: 'var(--sd-color-text-muted, #94a3b8)', fontSize: '14px', marginTop: '8px' }}>
                    "{name || 'Untitled Project'}" has been created with all 5 workspace environments.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Step 6: Ready to Provision Workspace</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--sd-color-text-muted, #94a3b8)' }}>
                    Review project configurations before automatic provisioning.
                  </p>

                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                      border: '1px solid var(--sd-color-border, #334155)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      fontSize: '13px',
                    }}
                  >
                    <div><strong>Project Name:</strong> {name || 'Untitled Project'}</div>
                    <div><strong>Template:</strong> {TEMPLATES.find((t) => t.id === projectType)?.title}</div>
                    <div><strong>Departments:</strong> {selectedDepartments.join(', ') || 'None'}</div>
                    <div><strong>AI Team:</strong> {selectedAiAgents.join(', ') || 'None'}</div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FolderCheck size={16} /> Will automatically generate: Project Workspace, Knowledge Space, Mission Board, Default Folders, and AI Workspace.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--sd-color-border, #334155)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
          }}
        >
          <button
            type="button"
            disabled={step === 1 || isProvisioning || isComplete}
            onClick={() => setStep(step - 1)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid var(--sd-color-border, #334155)',
              backgroundColor: 'transparent',
              color: step === 1 ? '#475569' : 'var(--sd-color-text-muted, #94a3b8)',
              cursor: step === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
            }}
          >
            <ArrowLeft size={16} /> Previous
          </button>

          {step < 6 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !name.trim()) setName('New Sidra Project');
                setStep(step + 1);
              }}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--sd-color-primary, #6366f1)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Next Step <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={isProvisioning || isComplete}
              onClick={handleFinish}
              style={{
                padding: '8px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#10b981',
                color: '#fff',
                fontWeight: 600,
                fontSize: '13px',
                cursor: isProvisioning || isComplete ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              <Sparkles size={16} /> Create & Provision Project
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
