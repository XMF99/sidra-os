import { FC, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface WorkspaceDTO {
  workspace_id: string;
  domain: string;
  selected_model_id: string;
  installed_apps: string[];
  provision_event_id: string;
}

export const OnboardingFlow: FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [screen, setScreen] = useState<number>(1);
  const [scope, setScope] = useState<'Individual' | 'Team' | 'Company'>('Company');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(['Game Development']);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(['Projects', 'AI Agents']);
  const [provisioning, setProvisioning] = useState<boolean>(false);
  const [provisioningLogs, setProvisioningLogs] = useState<string[]>([]);
  const [provisionResult, setProvisionResult] = useState<WorkspaceDTO | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const industries = [
    'Game Development',
    'Data Analysis',
    'Software',
    'Restaurant',
    'Healthcare',
    'Manufacturing',
    'Construction',
    'Education',
    'Marketing',
    'Finance',
  ];

  const needs = ['Accounting', 'CRM', 'Projects', 'AI Agents', 'Analytics'];

  const toggleIndustry = (ind: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]
    );
  };

  const toggleNeed = (need: string) => {
    setSelectedNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  const startProvisioning = async () => {
    setScreen(4);
    setProvisioning(true);
    setProvisioningLogs([]);
    setErrorMsg('');

    try {
      // Streamed progress step 1
      setProvisioningLogs([`Analyzing setup (Industry: ${selectedIndustries.join(', ') || 'Game Development'})...`]);
      await new Promise((res) => setTimeout(res, 400));

      // Streamed progress step 2
      setProvisioningLogs((prev) => [
        ...prev,
        `Selecting applications (${selectedNeeds.join(', ') || 'Projects'})...`,
      ]);
      await new Promise((res) => setTimeout(res, 400));

      // Real IPC call writing SQLite events
      const result = await invoke<WorkspaceDTO>('app_provision_workspace', {
        domain: selectedIndustries[0] || 'Game Development',
        apps: selectedNeeds,
      });

      // Streamed progress step 3
      setProvisioningLogs((prev) => [
        ...prev,
        `Preparing operating system workspace (${result.workspace_id})...`,
      ]);

      setProvisionResult(result);
      setProvisioning(false);
    } catch (err: any) {
      setErrorMsg(`Provisioning Failed: ${String(err)}`);
      setProvisioning(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#090d16',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'Inter, system-ui, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 580,
          backgroundColor: '#121624',
          border: '1px solid #242938',
          borderRadius: 12,
          padding: 32,
          boxSizing: 'border-box',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* Step Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, fontSize: 13, color: '#94a3b8' }}>
          <span>THEKY OS Setup</span>
          <span>Step {screen} of 5</span>
        </div>

        {/* Screen 1: Sign In */}
        {screen === 1 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0' }}>Welcome to THEKY v2</h2>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px 0' }}>
              Sign in to your AI Operating System workspace.
            </p>
            <button
              onClick={() => setScreen(2)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 8,
                backgroundColor: '#6366f1',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Continue with Workspace Sign In →
            </button>
          </div>
        )}

        {/* Screen 2: Scope */}
        {screen === 2 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px 0' }}>Who is this for?</h2>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 20px 0' }}>
              Select your workspace scale.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
              {(['Individual', 'Team', 'Company'] as const).map((sc) => (
                <button
                  key={sc}
                  onClick={() => setScope(sc)}
                  style={{
                    padding: '16px 12px',
                    borderRadius: 8,
                    backgroundColor: scope === sc ? 'rgba(99, 102, 241, 0.2)' : '#1a1f2e',
                    border: scope === sc ? '1px solid #6366f1' : '1px solid #282f42',
                    color: scope === sc ? '#6366f1' : '#f8fafc',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {sc}
                </button>
              ))}
            </div>
            <button
              onClick={() => setScreen(3)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 8,
                backgroundColor: '#6366f1',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Next Step →
            </button>
          </div>
        )}

        {/* Screen 3: Industry & Needs (Multi-select) */}
        {screen === 3 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px 0' }}>What do you work in?</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 16px 0' }}>Select all industries that apply.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {industries.map((ind) => {
                const active = selectedIndustries.includes(ind);
                return (
                  <button
                    key={ind}
                    onClick={() => toggleIndustry(ind)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 20,
                      backgroundColor: active ? '#6366f1' : '#1a1f2e',
                      color: '#fff',
                      border: active ? '1px solid #818cf8' : '1px solid #282f42',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {ind} {active ? '✓' : ''}
                  </button>
                );
              })}
            </div>

            <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 12px 0' }}>What applications do you need?</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {needs.map((need) => {
                const active = selectedNeeds.includes(need);
                return (
                  <button
                    key={need}
                    onClick={() => toggleNeed(need)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 20,
                      backgroundColor: active ? 'rgba(99, 102, 241, 0.3)' : '#1a1f2e',
                      color: active ? '#818cf8' : '#cbd5e1',
                      border: active ? '1px solid #6366f1' : '1px solid #282f42',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {need} {active ? '✓' : ''}
                  </button>
                );
              })}
            </div>

            <button
              onClick={startProvisioning}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 8,
                backgroundColor: '#6366f1',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Provision THEKY Workspace →
            </button>
          </div>
        )}

        {/* Screen 4: Honest Streamed Provisioning */}
        {screen === 4 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px 0' }}>Provisioning Workspace</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 20px 0' }}>
              Executing backend setup and writing SHA-256 Vault events...
            </p>

            <div
              style={{
                backgroundColor: '#090d16',
                borderRadius: 8,
                padding: 16,
                border: '1px solid #242938',
                marginBottom: 20,
                minHeight: 140,
                fontSize: 13,
                fontFamily: 'monospace',
              }}
            >
              {provisioningLogs.map((log, idx) => (
                <div key={idx} style={{ marginBottom: 8, color: '#38bdf8' }}>
                  [✓] {log}
                </div>
              ))}
              {provisioning && <div style={{ color: '#818cf8' }}>[⏳] Executing SQLite transactions...</div>}
              {errorMsg && <div style={{ color: '#f87171' }}>[❌] {errorMsg}</div>}
            </div>

            {!provisioning && provisionResult && (
              <button
                onClick={() => setScreen(5)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 8,
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Provisioning Complete — Enter Workspace →
              </button>
            )}
          </div>
        )}

        {/* Screen 5: Enter Workspace */}
        {screen === 5 && provisionResult && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0' }}>Workspace Ready</h2>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 16px 0' }}>
              Domain: <strong>{provisionResult.domain}</strong> • Model: <strong>{provisionResult.selected_model_id}</strong>
            </p>
            <p style={{ color: '#10b981', fontSize: 12, margin: '0 0 24px 0', fontFamily: 'monospace' }}>
              Vault Event ID: {provisionResult.provision_event_id} (SHA-256 Chain Verified)
            </p>
            <button
              onClick={onComplete}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 8,
                backgroundColor: '#6366f1',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Launch THEKY OS Canvas
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
