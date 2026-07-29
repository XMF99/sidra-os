import React, { useState } from 'react';
import { X, Sparkles, Calendar, Layers, Building, Bot, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useShellStore } from '../../state/useShellStore';
import { VoiceInputAffordance } from '../common/VoiceInputAffordance';

interface MissionWizardModalProps {
  onClose?: () => void;
  onMissionCreated?: (mission: any) => void;
}

export const MissionWizardModal: React.FC<MissionWizardModalProps> = ({ onClose, onMissionCreated }) => {
  const { isMissionWizardOpen, setMissionWizardOpen } = useShellStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [project, setProject] = useState('Game Studio Engine v2');
  const [department, setDepartment] = useState('Engineering');
  const [assignedAi, setAssignedAi] = useState('Lead Architect Agent');
  const [deadline, setDeadline] = useState('2026-08-15');
  const [inputMode, setInputMode] = useState<'type' | 'speak'>('type');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isMissionWizardOpen) return null;

  const handleClose = () => {
    setMissionWizardOpen(false);
    setIsSuccess(false);
    if (onClose) onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMission = {
      id: `m-${Date.now()}`,
      name,
      description,
      priority,
      project,
      department,
      assignedAi,
      deadline,
      status: 'In Progress',
      createdAt: new Date().toISOString(),
    };

    setIsSuccess(true);
    if (onMissionCreated) {
      onMissionCreated(newMission);
    }

    setTimeout(() => {
      handleClose();
      setName('');
      setDescription('');
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
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
          maxWidth: '620px',
          backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
          border: '1px solid var(--sd-color-border, #334155)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: 'var(--sd-color-text, #f8fafc)',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--sd-color-border, #334155)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%)',
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
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Create Mission</h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--sd-color-text-muted, #94a3b8)' }}>
                Define goals and assign AI team members to execute work
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
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {isSuccess ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <CheckCircle2 size={56} style={{ color: '#10b981', margin: '0 auto 16px auto' }} />
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Mission Dispatched!</h3>
            <p style={{ color: 'var(--sd-color-text-muted, #94a3b8)', marginTop: '8px', fontSize: '14px' }}>
              Assigning {assignedAi} to execute "{name}" within {project}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Input Mode Selector Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '-6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sd-color-text-muted, #94a3b8)' }}>
                INPUT METHOD
              </span>
              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                  padding: '3px',
                  borderRadius: '8px',
                  border: '1px solid var(--sd-color-border, #334155)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setInputMode('type')}
                  style={{
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: inputMode === 'type' ? 'var(--sd-color-primary, #6366f1)' : 'transparent',
                    color: inputMode === 'type' ? '#fff' : 'var(--sd-color-text-muted, #94a3b8)',
                    cursor: 'pointer',
                  }}
                >
                  Type Text
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('speak')}
                  style={{
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: inputMode === 'speak' ? 'var(--sd-color-primary, #6366f1)' : 'transparent',
                    color: inputMode === 'speak' ? '#fff' : 'var(--sd-color-text-muted, #94a3b8)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  🎤 Speak Directive
                </button>
              </div>
            </div>

            {/* Mission Name */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                Mission Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Implement Physics Collision Matrix in Game Engine"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--sd-color-border, #334155)',
                  backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                  color: 'var(--sd-color-text, #f8fafc)',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Mission Description & Voice Affordance */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500 }}>Description & Directives</label>
                <VoiceInputAffordance
                  size="sm"
                  currentValue={description}
                  onTranscript={(text) => {
                    setDescription(text);
                    if (!name) setName('Voice Directive: Project Implementation Task');
                  }}
                />
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed instructions or use voice dictation..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--sd-color-border, #334155)',
                  backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                  color: 'var(--sd-color-text, #f8fafc)',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Selectors Grid: Project, Department, Priority */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--sd-color-text-muted, #94a3b8)' }}>
                  <Layers size={14} /> Project
                </label>
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--sd-color-border, #334155)',
                    backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                    color: 'var(--sd-color-text, #f8fafc)',
                    fontSize: '13px',
                  }}
                >
                  <option value="Game Studio Engine v2">Game Studio Engine v2</option>
                  <option value="Core Platform Services">Core Platform Services</option>
                  <option value="Enterprise ERP Integration">Enterprise ERP Integration</option>
                  <option value="AI Research & Autonomy">AI Research & Autonomy</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--sd-color-text-muted, #94a3b8)' }}>
                  <Building size={14} /> Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--sd-color-border, #334155)',
                    backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                    color: 'var(--sd-color-text, #f8fafc)',
                    fontSize: '13px',
                  }}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design & UX">Design & UX</option>
                  <option value="Product Management">Product Management</option>
                  <option value="Operations">Operations</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
            </div>

            {/* Selectors Grid: Assign AI, Priority, Deadline */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--sd-color-text-muted, #94a3b8)' }}>
                  <Bot size={14} /> Assign AI
                </label>
                <select
                  value={assignedAi}
                  onChange={(e) => setAssignedAi(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--sd-color-border, #334155)',
                    backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                    color: 'var(--sd-color-text, #f8fafc)',
                    fontSize: '12px',
                  }}
                >
                  <option value="Lead Architect Agent">Lead Architect Agent</option>
                  <option value="Game Studio Assistant">Game Studio Assistant</option>
                  <option value="Full-Stack Dev Agent">Full-Stack Dev Agent</option>
                  <option value="QA Certification Bot">QA Certification Bot</option>
                  <option value="Ops Controller">Ops Controller</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--sd-color-text-muted, #94a3b8)' }}>
                  <ShieldAlert size={14} /> Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--sd-color-border, #334155)',
                    backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                    color: 'var(--sd-color-text, #f8fafc)',
                    fontSize: '12px',
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--sd-color-text-muted, #94a3b8)' }}>
                  <Calendar size={14} /> Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--sd-color-border, #334155)',
                    backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                    color: 'var(--sd-color-text, #f8fafc)',
                    fontSize: '12px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid var(--sd-color-border, #334155)',
                  backgroundColor: 'transparent',
                  color: 'var(--sd-color-text-muted, #94a3b8)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--sd-color-primary, #6366f1)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                }}
              >
                Create Mission
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
