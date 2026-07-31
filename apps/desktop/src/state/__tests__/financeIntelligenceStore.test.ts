import { describe, it, expect } from 'vitest';
import { useFinanceIntelligenceStore } from '../useFinanceIntelligenceStore';

describe('useFinanceIntelligenceStore', () => {
  it('manages Finance Workspace metrics and cash positions', () => {
    const store = useFinanceIntelligenceStore.getState();
    expect(store.cashPositionArr).toBeGreaterThan(0);
    expect(store.cashRunwayMonths).toBeGreaterThan(12);
    expect(store.financialHealthScore).toBeGreaterThanOrEqual(95);
  });

  it('delivers AI CFO recommendations with high confidence scores', () => {
    const store = useFinanceIntelligenceStore.getState();
    expect(store.cfoRecommendations.length).toBeGreaterThan(0);
    expect(store.cfoRecommendations.every((rec) => rec.confidenceScore >= 90)).toBe(true);
  });

  it('posts journal entries into the General Ledger and audit trail', () => {
    const store = useFinanceIntelligenceStore.getState();
    const initialCount = store.journalEntries.length;

    store.postJournalEntry({
      date: new Date().toISOString().split('T')[0],
      description: 'Test SaaS Deposit Entry',
      accountCode: '1010',
      debit: 50000,
      credit: 0,
    });

    const updatedEntries = useFinanceIntelligenceStore.getState().journalEntries;
    expect(updatedEntries.length).toBe(initialCount + 1);
    expect(updatedEntries[0].description).toBe('Test SaaS Deposit Entry');
  });

  it('executes Financial Digital Twin simulations inside the isolated sandbox', () => {
    const store = useFinanceIntelligenceStore.getState();
    const initialCount = store.simulations.length;

    const sim = store.runFinancialSimulation('Hiring', 'Hire 2 AI Financial Auditors Simulation');
    expect(sim.simulationPass).toBe(true);
    expect(sim.projectedRoi).toBeGreaterThan(1.0);
    expect(useFinanceIntelligenceStore.getState().simulations.length).toBe(initialCount + 1);
  });

  it('manages AI Financial Auditor findings and mitigation workflows', () => {
    const store = useFinanceIntelligenceStore.getState();
    expect(store.auditFindings.length).toBeGreaterThan(0);

    const firstFinding = store.auditFindings[0];
    store.resolveAuditFinding(firstFinding.id);

    expect(useFinanceIntelligenceStore.getState().auditFindings.find((f) => f.id === firstFinding.id)?.status).toBe('Mitigated');
  });
});
