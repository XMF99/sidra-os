import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getSystemStatus, executeGoal } from '../lib/api';

export const Lobby: React.FC = () => {
  const [goalText, setGoalText] = useState('');
  const [activePlanResult, setActivePlanResult] = useState<any>(null);

  const { data: systemInfo } = useQuery({
    queryKey: ['systemStatus'],
    queryFn: getSystemStatus,
  });

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
        height: '100vh',
        backgroundColor: 'var(--sd-color-surface-base)',
        color: 'var(--sd-color-text-primary)',
        padding: 'var(--sd-space-6)',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          borderBottom: '1px solid var(--sd-color-border-subtle)',
          paddingBottom: 'var(--sd-space-4)',
          marginBottom: 'var(--sd-space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', margin: 0 }}>Lobby</h1>
          <p style={{ color: 'var(--sd-color-text-secondary)', margin: '4px 0 0 0' }}>
            Sidra OS Executive Atrium
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--sd-color-surface-raised)',
            border: '1px solid var(--sd-color-border-subtle)',
            borderRadius: 'var(--sd-radius-md)',
            padding: '8px 12px',
            fontSize: '12px',
          }}
        >
          Kernel Status: <strong>{systemInfo?.status ?? 'Ready'}</strong> ({systemInfo?.version})
        </div>
      </header>

      {/* Outcome Entry Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
          State an outcome to initiate Executive work:
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            placeholder="e.g. Ingest document, chunk, vector search, format executive brief"
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid var(--sd-color-border-subtle)',
              backgroundColor: 'var(--sd-color-surface-raised)',
              color: 'var(--sd-color-text-primary)',
            }}
          />
          <button
            type="submit"
            disabled={goalMutation.isPending}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'var(--sd-color-accent)',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {goalMutation.isPending ? 'Executing...' : 'Execute Outcome'}
          </button>
        </div>
      </form>

      {/* Execution Results View */}
      {activePlanResult && (
        <div
          style={{
            flex: 1,
            backgroundColor: 'var(--sd-color-surface-raised)',
            border: '1px solid var(--sd-color-border-subtle)',
            borderRadius: '8px',
            padding: '20px',
            overflowY: 'auto',
          }}
        >
          <h2 style={{ fontSize: '18px', marginTop: 0 }}>Active Task Plan: {activePlanResult.plan.plan_id}</h2>
          <p>Goal: {activePlanResult.plan.goal}</p>
          <p>Status: <strong>{activePlanResult.plan.status}</strong></p>

          <h3 style={{ fontSize: '15px', marginTop: '16px' }}>Executed Plan Steps:</h3>
          {activePlanResult.plan.steps.map((step: any) => (
            <div
              key={step.step_id}
              style={{
                backgroundColor: 'var(--sd-color-surface-overlay)',
                border: '1px solid var(--sd-color-border-subtle)',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '8px',
              }}
            >
              <div style={{ fontWeight: 600 }}>{step.description} ({step.assigned_role})</div>
              <div style={{ fontSize: '12px', color: 'var(--sd-color-text-secondary)', marginTop: '4px' }}>
                Result: {step.result ?? 'Pending'}
              </div>
            </div>
          ))}

          <h3 style={{ fontSize: '15px', marginTop: '16px' }}>Executive Brief Output with Provenance Metadata:</h3>
          {activePlanResult.messages.map((msg: any) => (
            <div
              key={msg.message_id}
              style={{
                backgroundColor: 'var(--sd-color-surface-base)',
                border: '1px solid var(--sd-color-accent)',
                borderRadius: '6px',
                padding: '12px',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '13px',
              }}
            >
              {msg.content}
              <div style={{ fontSize: '11px', color: 'var(--sd-color-text-muted)', marginTop: '8px' }}>
                [Provenance Tag]: Author={msg.provenance.author_agent_id} ({msg.provenance.author_role}), Authorized={msg.provenance.authorized_by_principal ? 'Yes' : 'No'}, Token={msg.provenance.capability_id}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
