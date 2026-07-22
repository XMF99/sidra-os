import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getArtifacts, executeArtifact, ExecutableArtifactDTO } from '../lib/api';
import { Cpu, Play, Terminal, Shield, FileCode, CheckCircle2 } from 'lucide-react';

export const ArtifactsRoom: React.FC = () => {
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>('art_fin_01');
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);

  const { data: artifacts, isLoading } = useQuery({
    queryKey: ['artifacts'],
    queryFn: getArtifacts,
  });

  const execMutation = useMutation({
    mutationFn: executeArtifact,
    onSuccess: (data) => {
      setExecutionOutput(data);
    },
  });

  const selectedArtifact = artifacts?.find((a) => a.id[0] === selectedArtifactId || a.id === selectedArtifactId);

  return (
    <div
      style={{
        flex: 1,
        height: '100vh',
        backgroundColor: 'var(--sd-color-surface-base)',
        color: 'var(--sd-color-text-primary)',
        padding: '24px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--sd-color-border-subtle)',
          paddingBottom: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu color="var(--sd-color-accent)" />
            <span>Executable Artifacts (Milestone M20)</span>
          </h1>
          <p style={{ color: 'var(--sd-color-text-secondary)', margin: '4px 0 0 0', fontSize: '14px' }}>
            WASM Host Execution Runtime & Capability-Bounded Refusal (ADR-0054, ADR-0055, ADR-0056)
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            color: '#22c55e',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            border: '1px solid rgba(34, 197, 94, 0.2)',
          }}
        >
          ✅ M20 Verified Complete
        </div>
      </header>

      {/* Main Grid: Artifacts List & Executor */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Artifact List */}
        <div style={cardContainerStyle}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCode size={18} />
            <span>Registered WASM Executable Artifacts</span>
          </h3>

          {isLoading ? (
            <div>Loading artifacts...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {artifacts?.map((art) => {
                const artId = typeof art.id === 'object' ? art.id[0] : art.id;
                const isSelected = selectedArtifactId === artId;

                return (
                  <div
                    key={artId}
                    onClick={() => setSelectedArtifactId(artId)}
                    style={{
                      padding: '14px',
                      borderRadius: '6px',
                      border: isSelected
                        ? '1px solid var(--sd-color-accent)'
                        : '1px solid var(--sd-color-border-subtle)',
                      backgroundColor: isSelected
                        ? 'rgba(59, 130, 246, 0.05)'
                        : 'var(--sd-color-surface-base)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{art.name}</span>
                      <code style={{ fontSize: '11px', color: 'var(--sd-color-text-tertiary)' }}>{artId}</code>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--sd-color-text-secondary)' }}>
                      {art.description}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--sd-color-text-tertiary)', marginTop: '4px' }}>
                      <span>WASM: <code>{art.wasm_filename}</code></span>
                      <span>Origin Order: <code>{art.produced_by_work_order}</code></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Artifact Inspector & Sandbox Execution Host */}
        <div style={cardContainerStyle}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} />
            <span>Capability Grants & Host Execution Sandbox</span>
          </h3>

          {selectedArtifact ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{selectedArtifact.name}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--sd-color-text-secondary)' }}>
                  Author Agent: <code>{selectedArtifact.produced_by_agent}</code>
                </p>
              </div>

              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sd-color-text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Derived Capability Grants (Subset of Work Order Grant, ADR-0054):
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedArtifact.capability_grants.map((grant, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        backgroundColor: 'var(--sd-color-surface-base)',
                        borderRadius: '4px',
                        fontSize: '12px',
                        border: '1px solid var(--sd-color-border-subtle)',
                      }}
                    >
                      <code>{grant.capability_id}</code>
                      <span style={{ color: '#22c55e', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> Bounded Grant
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => execMutation.mutate(selectedArtifactId)}
                disabled={execMutation.isPending}
                style={{
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--sd-color-accent)',
                  color: '#ffffff',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Play size={16} />
                {execMutation.isPending ? 'Executing in WASM Host Runtime...' : 'Execute Artifact in Host Runtime'}
              </button>

              {/* Execution Console Output */}
              {executionOutput && (
                <div
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#38bdf8',
                    padding: '12px',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    whiteSpace: 'pre-wrap',
                    border: '1px solid #1e293b',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#94a3b8' }}>
                    <Terminal size={14} />
                    <span>Runtime Host Execution Log:</span>
                  </div>
                  {executionOutput}
                </div>
              )}
            </div>
          ) : (
            <div>Select an artifact to inspect and execute</div>
          )}
        </div>
      </div>
    </div>
  );
};

const cardContainerStyle: React.CSSProperties = {
  backgroundColor: 'var(--sd-color-surface-raised)',
  border: '1px solid var(--sd-color-border-subtle)',
  borderRadius: '8px',
  padding: '20px',
};
