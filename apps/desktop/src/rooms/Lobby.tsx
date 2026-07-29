import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Crosshair, Plus, Sparkles, CheckCircle2, Bot } from 'lucide-react';
import { executeGoal } from '../lib/api';
import { useShellStore } from '../state/useShellStore';
import { VoiceInputAffordance } from '../components/common/VoiceInputAffordance';

export const Lobby: React.FC = () => {
  const { developerMode, setMissionWizardOpen } = useShellStore();
  const [goalText, setGoalText] = useState('');
  const [activePlanResult, setActivePlanResult] = useState<any>(null);

  const goalMutation = useMutation({
    mutationFn: executeGoal,
    onSuccess: (data) => {
      setActivePlanResult(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalText.trim()) return;
    goalMutation.mutate(goalText);
  };

  return (
    <div
      style={{
        flex: 1,
        minHeight: '100vh',
        backgroundColor: 'var(--sd-color-bg-app)',
        color: 'var(--sd-color-text, #f8fafc)',
        padding: '32px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        maxWidth: '1280px',
        margin: '0 auto',
      }}
    >
      <header
        style={{
          borderBottom: '1px solid var(--sd-color-border, #334155)',
          paddingBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Crosshair size={28} style={{ color: '#10b981' }} /> Mission Center
          </h1>
          <p style={{ color: 'var(--sd-color-text-muted, #94a3b8)', margin: '4px 0 0 0', fontSize: '14px' }}>
            Dispatch objectives and monitor active mission execution across your AI team.
          </p>
        </div>

        <button
          onClick={() => setMissionWizardOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: 'var(--sd-color-primary, #6366f1)',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
          }}
        >
          <Plus size={18} /> New Mission
        </button>
      </header>

      {/* Outcome Entry Form */}
      <div
        style={{
          backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
          border: '1px solid var(--sd-color-border, #334155)',
          borderRadius: '16px',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ fontSize: '15px', fontWeight: 600 }}>Dispatch Immediate Directive</label>
          <VoiceInputAffordance
            size="sm"
            currentValue={goalText}
            onTranscript={(text) => setGoalText(text)}
          />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            placeholder="State a mission goal or click Speak..."
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid var(--sd-color-border, #334155)',
              backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
              color: 'var(--sd-color-text, #f8fafc)',
              fontSize: '14px',
            }}
          />

          <button
            type="submit"
            disabled={goalMutation.isPending}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'var(--sd-color-primary, #6366f1)',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Sparkles size={16} />
            {goalMutation.isPending ? 'Dispatching...' : 'Dispatch'}
          </button>
        </form>
      </div>

      {/* Execution Results View */}
      {activePlanResult && (
        <div
          style={{
            backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
            border: '1px solid var(--sd-color-border, #334155)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <CheckCircle2 size={22} style={{ color: '#10b981' }} />
            <h2 style={{ fontSize: '18px', margin: 0, fontWeight: 600 }}>
              Active Task Execution: {activePlanResult.plan.goal}
            </h2>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--sd-color-text-muted, #94a3b8)', marginBottom: '16px' }}>
            Status: <strong style={{ color: '#10b981' }}>{activePlanResult.plan.status}</strong>
          </div>

          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Executed Plan Steps:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {activePlanResult.plan.steps.map((step: any) => (
              <div
                key={step.step_id}
                style={{
                  backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                  border: '1px solid var(--sd-color-border, #334155)',
                  borderRadius: '10px',
                  padding: '14px',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bot size={14} style={{ color: '#6366f1' }} /> {step.description} ({step.assigned_role})
                </div>
                <div style={{ fontSize: '12px', color: 'var(--sd-color-text-muted, #94a3b8)', marginTop: '4px' }}>
                  Result: {step.result ?? 'Completed'}
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Executive Summary:</h3>
          {activePlanResult.messages.map((msg: any) => (
            <div
              key={msg.message_id}
              style={{
                backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                border: '1px solid var(--sd-color-primary, #6366f1)',
                borderRadius: '10px',
                padding: '16px',
                whiteSpace: 'pre-wrap',
                fontSize: '13px',
                lineHeight: 1.6,
              }}
            >
              {msg.content}

              {developerMode && (
                <div style={{ fontSize: '11px', color: '#8b5cf6', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #334155' }}>
                  [Developer Mode Tag]: Author={msg.provenance.author_agent_id} ({msg.provenance.author_role}), Token={msg.provenance.capability_id}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
