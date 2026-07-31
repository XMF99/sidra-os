import { describe, it, expect } from 'vitest';
import { useExecutiveSuiteStore } from '../useExecutiveSuiteStore';

describe('useExecutiveSuiteStore', () => {
  it('manages Financial Snapshot and executive KPIs', () => {
    const store = useExecutiveSuiteStore.getState();
    expect(store.financials.revenueArr).toBeGreaterThan(0);
    expect(store.financials.cashRunwayMonths).toBeGreaterThan(12);
  });

  it('maintains 7 Virtual AI Board Advisors with high confidence recommendations', () => {
    const store = useExecutiveSuiteStore.getState();
    expect(store.boardAdvisors.length).toBe(7);
    expect(store.boardAdvisors.every((adv) => adv.confidenceScore >= 90)).toBe(true);
  });

  it('manages Executive War Room crisis incidents and resolution workflows', () => {
    const store = useExecutiveSuiteStore.getState();
    expect(store.warRoomIncidents.length).toBeGreaterThan(0);

    const firstIncident = store.warRoomIncidents[0];
    store.resolveWarRoomIncident(firstIncident.id);
    expect(useExecutiveSuiteStore.getState().warRoomIncidents.find((inc) => inc.id === firstIncident.id)?.status).toBe('Resolved');
  });

  it('approves pending executive decisions with explainability trails', () => {
    const store = useExecutiveSuiteStore.getState();
    expect(store.pendingDecisions.length).toBeGreaterThan(0);

    const firstDecision = store.pendingDecisions[0];
    expect(firstDecision.explainability.why).toBeTruthy();

    store.approveExecutiveDecision(firstDecision.id);
    expect(useExecutiveSuiteStore.getState().pendingDecisions.find((d) => d.id === firstDecision.id)?.approvalStatus).toBe('Approved');
  });

  it('adds and searches searchable executive memory entries', () => {
    const store = useExecutiveSuiteStore.getState();
    const initialCount = store.executiveMemory.length;

    store.addExecutiveMemoryNote('Q3 Board Resolution', 'Strategic Milestone', 'Approved expansion of Game Studio solution.');
    const updatedMemory = useExecutiveSuiteStore.getState().executiveMemory;

    expect(updatedMemory.length).toBe(initialCount + 1);
    expect(updatedMemory[0].title).toContain('Q3 Board Resolution');
  });
});
