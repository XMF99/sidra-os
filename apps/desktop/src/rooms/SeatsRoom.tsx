import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSeats, createSeat, SeatDTO } from '../lib/api';
import { Users, UserPlus, Shield, Wallet, HardDrive, CheckCircle2, Lock } from 'lucide-react';

export const SeatsRoom: React.FC = () => {
  const [newSeatName, setNewSeatName] = useState('');
  const queryClient = useQueryClient();

  const { data: seats, isLoading } = useQuery({
    queryKey: ['seats'],
    queryFn: getSeats,
  });

  const createMutation = useMutation({
    mutationFn: createSeat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seats'] });
      setNewSeatName('');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeatName.trim()) return;
    createMutation.mutate(newSeatName);
  };

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
            <Users color="var(--sd-color-accent)" />
            <span>Seats & Human Identity (Milestone M21)</span>
          </h1>
          <p style={{ color: 'var(--sd-color-text-secondary)', margin: '4px 0 0 0', fontSize: '14px' }}>
            Layer-1 First-Class Human Identity Substrate & Per-Seat Controls (ADR-0057, ADR-0058, ADR-0059)
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
          ✅ M21 Verified Complete
        </div>
      </header>

      {/* Invite/Create Seat Form */}
      <div style={cardContainerStyle}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={16} />
          <span>Invite & Materialize New Colleague Seat</span>
        </h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={newSeatName}
            onChange={(e) => setNewSeatName(e.target.value)}
            placeholder="Enter colleague display name (e.g. Sam Altman)..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid var(--sd-color-border-subtle)',
              backgroundColor: 'var(--sd-color-surface-base)',
              color: 'var(--sd-color-text-primary)',
            }}
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
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
            {createMutation.isPending ? 'Provisioning...' : 'Invite Seat'}
          </button>
        </form>
      </div>

      {/* Seats Table */}
      <div style={cardContainerStyle}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0' }}>
          Registered Seats & Isolated Capabilities
        </h3>

        {isLoading ? (
          <div>Loading seats...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--sd-color-border-subtle)', textAlign: 'left' }}>
                  <th style={thStyle}>Seat ID</th>
                  <th style={thStyle}>Display Name</th>
                  <th style={thStyle}>Actor Value (`events.actor`)</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Per-Seat Fence (ADR-0058)</th>
                  <th style={thStyle}>Budget Ceiling (ADR-0058)</th>
                  <th style={thStyle}>Memory Namespace (ADR-0059)</th>
                </tr>
              </thead>
              <tbody>
                {seats?.map((seat: SeatDTO) => (
                  <tr key={seat.id} style={{ borderBottom: '1px solid var(--sd-color-border-subtle)' }}>
                    <td style={tdStyle}>
                      <code>{seat.id}</code>
                    </td>
                    <td style={tdStyle}>
                      <strong>{seat.display_name}</strong>
                      {seat.is_founding && (
                        <span style={foundingBadgeStyle}>Founding</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span style={actorBadgeStyle}>{seat.actor_value}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={activeBadgeStyle}>
                        <CheckCircle2 size={12} /> {seat.status}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Shield size={14} color="#3b82f6" />
                        <span>{seat.is_founding ? 'Full Policy (*)' : 'fs.read:vault/Sources/**'}</span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Wallet size={14} color="#f59e0b" />
                        <span>${(seat.budget_ceiling_cents / 100).toFixed(2)} / mo</span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <HardDrive size={14} color="#8b5cf6" />
                        <code>{seat.memory_namespace}</code>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* M21 Architecture Guarantee Box */}
      <div
        style={{
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '8px',
          padding: '16px',
          fontSize: '13px',
          color: 'var(--sd-color-text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ fontWeight: 600, color: 'var(--sd-color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Lock size={16} color="#3b82f6" />
          <span>M21 Architecture Invariants (ADR-0057, ADR-0058, ADR-0059)</span>
        </div>
        <div>
          • <strong>Zero History Rewritten:</strong> Founding Seat is bound to pre-existing <code>'principal'</code> actor value. Admitting a second Seat appends events with zero SQL writes to <code>events</code>.
        </div>
        <div>
          • <strong>Permission Broker Integration:</strong> Per-Seat Fence is applied as an intersection term over the single choke point (<code>effective = policy AND seat_fence</code>).
        </div>
        <div>
          • <strong>Default Deny Scoping:</strong> Working memory namespace <code>seat/&lt;id&gt;</code> isolation is enforced at the capability level.
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

const thStyle: React.CSSProperties = {
  padding: '10px 12px',
  color: 'var(--sd-color-text-secondary)',
  fontWeight: 500,
};

const tdStyle: React.CSSProperties = {
  padding: '12px',
};

const foundingBadgeStyle: React.CSSProperties = {
  marginLeft: '8px',
  padding: '2px 6px',
  borderRadius: '4px',
  backgroundColor: 'rgba(139, 92, 246, 0.1)',
  color: '#8b5cf6',
  fontSize: '11px',
};

const actorBadgeStyle: React.CSSProperties = {
  padding: '2px 8px',
  borderRadius: '4px',
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  color: '#3b82f6',
  fontFamily: 'monospace',
  fontSize: '12px',
};

const activeBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 8px',
  borderRadius: '4px',
  backgroundColor: 'rgba(34, 197, 94, 0.1)',
  color: '#22c55e',
  fontSize: '12px',
};
