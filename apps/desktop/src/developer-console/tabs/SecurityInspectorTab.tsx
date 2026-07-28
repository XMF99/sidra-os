import React, { useState } from 'react';
import { SecurityIdentityEngine } from '../../security-identity/SecurityIdentityEngine';
import { AuthSessionToken } from '../../security-identity/types';

export const SecurityInspectorTab: React.FC = () => {
  const [selectedIdentityTypeFilter, setSelectedIdentityTypeFilter] = useState<string>('ALL');
  const [activeSubView, setActiveSubView] = useState<'identities' | 'sessions' | 'secrets' | 'crypto' | 'rbac' | 'audit'>('identities');
  const [testOutput, setTestOutput] = useState<string | null>(null);

  // Auth Tester State
  const [targetIdentityId, setTargetIdentityId] = useState<string>('usr_admin');
  const [issuedToken, setIssuedToken] = useState<AuthSessionToken | null>(null);

  // Crypto Tester State
  const [plainInput, setPlainInput] = useState<string>('Sidra OS Confidential Local Secret Payload');
  const [cipherOutput, setCipherOutput] = useState<string>('');
  const [signOutput, setSignOutput] = useState<string>('');

  // RBAC Tester State
  const [rbacResource, setRbacResource] = useState<string>('mission');
  const [rbacAction, setRbacAction] = useState<string>('execute');

  const engine = SecurityIdentityEngine.getInstance();
  const registry = engine.getRegistry();
  const identities = registry.getAllIdentities();
  const tokens = engine.getActiveTokens();
  const secrets = engine.getAllSecrets();
  const auditLogs = engine.getAuditLog();
  const metrics = engine.getMetrics();

  const handleAuthenticateTest = () => {
    try {
      const res = engine.authenticate(targetIdentityId);
      if (res.success && res.token) {
        setIssuedToken(res.token);
        setTestOutput(`Authenticated identity '${targetIdentityId}'. Issued token '${res.token.id}'.`);
      } else {
        setTestOutput(`Authentication Failed: ${res.state}`);
      }
    } catch (err) {
      setTestOutput(`Auth Error: ${(err as Error).message}`);
    }
  };

  const handleEncryptTest = () => {
    const cipher = engine.encrypt(plainInput);
    setCipherOutput(cipher);
    const sig = engine.sign(plainInput);
    setSignOutput(sig);
    setTestOutput(`Encrypted & Signed text successfully.`);
  };

  const handleRotateSecrets = () => {
    try {
      const rotated = engine.rotateSecrets();
      setTestOutput(`Rotated ${rotated.length} platform vault secrets.`);
    } catch (err) {
      setTestOutput(`Rotation Error: ${(err as Error).message}`);
    }
  };

  const handleAuthorizeTest = () => {
    const res = engine.authorize(targetIdentityId, rbacResource, rbacAction);
    setTestOutput(`Authorization Result: ${res.authorized ? 'AUTHORIZED' : 'DENIED'} (${res.reason})`);
  };

  const filteredIdentities = identities.filter((i) => {
    return selectedIdentityTypeFilter === 'ALL' || i.identityType === selectedIdentityTypeFilter;
  });

  return (
    <div className="p-6 space-y-6 text-slate-100 font-sans">
      {/* Top Header Metrics Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔐</span>
            <div>
              <h2 className="text-xl font-bold text-teal-400">Sidra Security & Identity Engine</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Platform security authority controlling identities, authentication, RBAC authorization, and local-first secret vaults
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Auth QPS</div>
            <div className="text-sm font-bold text-emerald-400">{metrics.authRequestsPerSec}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Active Sessions</div>
            <div className="text-sm font-bold text-teal-300">{metrics.activeSessionsCount}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Active Tokens</div>
            <div className="text-sm font-bold text-amber-400">{metrics.activeTokenCount}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Secret Rotations</div>
            <div className="text-sm font-bold text-blue-400">{metrics.secretRotationsCount}</div>
          </div>
        </div>
      </div>

      {/* Sub-view Navigation Tabs */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubView('identities')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'identities'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            👤 Identity Registry ({filteredIdentities.length})
          </button>
          <button
            onClick={() => setActiveSubView('sessions')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'sessions'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            🔑 Active Sessions ({tokens.length})
          </button>
          <button
            onClick={() => setActiveSubView('secrets')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'secrets'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            🔒 API Keys & Secrets ({secrets.length})
          </button>
          <button
            onClick={() => setActiveSubView('crypto')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'crypto'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            ✍️ Cryptography & Signatures
          </button>
          <button
            onClick={() => setActiveSubView('rbac')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'rbac'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            🛡️ RBAC Explorer
          </button>
          <button
            onClick={() => setActiveSubView('audit')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'audit'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📜 Audit Log ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Output Banner */}
      {testOutput && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-mono flex justify-between items-center">
          <span>{testOutput}</span>
          <button onClick={() => setTestOutput(null)} className="text-slate-400 hover:text-slate-200 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Identities Subview */}
      {activeSubView === 'identities' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-300">Filter by Identity Type:</span>
            <select
              value={selectedIdentityTypeFilter}
              onChange={(e) => setSelectedIdentityTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-slate-200 uppercase"
            >
              {['ALL', 'administrator', 'developer_identity', 'ai_agent', 'service_account', 'human_user'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredIdentities.map((id) => (
              <div key={id.id} className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{id.name}</h3>
                    <span className="text-[10px] text-slate-400">{id.id} • {id.identityType}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      id.status === 'active'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        : 'bg-rose-950 text-rose-300 border border-rose-500/50'
                    }`}
                  >
                    {id.status}
                  </span>
                </div>

                <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Permissions ({id.permissions.length}):</span>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {id.permissions.map((p) => (
                      <span key={p} className="bg-slate-900 text-teal-300 border border-slate-800 px-2 py-0.5 rounded text-[10px]">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sessions Subview */}
      {activeSubView === 'sessions' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h3 className="font-bold text-slate-200 text-sm">Active Session & API Tokens ({tokens.length})</h3>
            <button
              onClick={handleAuthenticateTest}
              className="px-3 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs"
            >
              ⚡ Authenticate & Issue Token
            </button>
          </div>

          {issuedToken && (
            <div className="p-3.5 bg-teal-950/40 border border-teal-500/50 text-teal-300 rounded-xl text-xs font-mono">
              <span className="font-bold block">Newly Issued Token:</span>
              ID: {issuedToken.id} | Scope: {issuedToken.scope.join(', ')} | Value: {issuedToken.tokenValue}
            </div>
          )}

          <div className="space-y-3">
            {tokens.map((tok) => (
              <div key={tok.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-teal-300">{tok.id}</span>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold uppercase">
                      {tok.tokenType}
                    </span>
                    <span className="text-[10px] text-slate-400">Identity: {tok.identityId}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Value: <code className="text-amber-300">{tok.tokenValue}</code> | Expires: {tok.expiresAt}</p>
                </div>

                <button
                  onClick={() => engine.revokeToken(tok.id)}
                  className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-bold"
                >
                  Revoke Token
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Secrets Subview */}
      {activeSubView === 'secrets' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h3 className="font-bold text-slate-200 text-sm">Local-First Secret Vault ({secrets.length})</h3>
            <button
              onClick={handleRotateSecrets}
              className="px-3 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs"
            >
              🔄 Rotate All Secrets
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {secrets.map((sec) => (
              <div key={sec.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-100">{sec.name}</h4>
                    <span className="text-[10px] text-slate-400">{sec.id} • v{sec.version}</span>
                  </div>
                  <span className="text-[9px] bg-slate-900 border border-slate-800 text-teal-300 px-2 py-0.5 rounded uppercase font-bold">
                    {sec.secretType}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg text-[10px] text-amber-300 font-mono overflow-x-auto">
                  {sec.encryptedValue}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crypto Subview */}
      {activeSubView === 'crypto' && (
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6 font-mono text-xs">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3">✍️ Cryptography & Digital Signature Tester</h3>
          <div className="space-y-2">
            <label className="text-slate-300">Plaintext Input Data:</label>
            <input
              type="text"
              value={plainInput}
              onChange={(e) => setPlainInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono text-xs"
            />
          </div>

          <button
            onClick={handleEncryptTest}
            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
          >
            🔒 Encrypt & Sign Input Data
          </button>

          {cipherOutput && (
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Encrypted Ciphertext:</span>
                <span className="text-teal-300">{cipherOutput}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">HMAC SHA-256 Digital Signature:</span>
                <span className="text-amber-400">{signOutput}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RBAC Subview */}
      {activeSubView === 'rbac' && (
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6 font-mono text-xs">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3">🛡️ Role-Based Access Control (RBAC) Explorer</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400">Select Identity:</label>
              <select
                value={targetIdentityId}
                onChange={(e) => setTargetIdentityId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono"
              >
                {identities.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.identityType})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Resource Target:</label>
              <input
                type="text"
                value={rbacResource}
                onChange={(e) => setRbacResource(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Action:</label>
              <input
                type="text"
                value={rbacAction}
                onChange={(e) => setRbacAction(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleAuthorizeTest}
            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
          >
            🛡️ Check Authorization
          </button>
        </div>
      )}

      {/* Audit Subview */}
      {activeSubView === 'audit' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Security Audit Log Stream ({auditLogs.length})</h3>
          {auditLogs.map((aud) => (
            <div key={aud.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-teal-300">[{aud.action}] Identity: {aud.identityId}</span>
                <p className="text-[10px] text-slate-400">Resource: {aud.resource} | State: {aud.state}</p>
              </div>
              <span className="text-[10px] text-slate-500">{aud.timestamp}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
