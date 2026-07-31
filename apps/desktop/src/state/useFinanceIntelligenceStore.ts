import { create } from 'zustand';

export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export interface ChartOfAccount {
  code: string;
  name: string;
  type: AccountType;
  balance: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  accountCode: string;
  debit: number;
  credit: number;
  status: 'Posted' | 'Draft' | 'Audited';
}

export interface CfoRecommendation {
  id: string;
  title: string;
  recommendation: string;
  impactEstimate: string;
  confidenceScore: number; // 0..100
  explainabilityWhy: string;
}

export interface FinancialSimulationScenario {
  id: string;
  type: 'Hiring' | 'Pricing' | 'Expansion' | 'Investment';
  title: string;
  projectedRoi: number; // e.g. 3.4x
  riskScore: number; // 0..100
  simulationPass: boolean;
}

export interface AuditFinding {
  id: string;
  findingTitle: string;
  severity: 'High' | 'Medium' | 'Low';
  evidence: string;
  status: 'Open' | 'Mitigated' | 'Dismissed';
}

export interface CustomerInvoice {
  id: string;
  customerName: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Outstanding' | 'Overdue';
}

export interface VendorBill {
  id: string;
  vendorName: string;
  amount: number;
  dueDate: string;
  status: 'Scheduled' | 'Paid' | 'Pending Approval';
}

interface FinanceIntelligenceState {
  cashPositionArr: number; // $ in Millions
  expensesArr: number;
  cashRunwayMonths: number;
  grossMarginPercent: number;
  budgetAdherencePercent: number;
  financialHealthScore: number;

  accounts: ChartOfAccount[];
  journalEntries: JournalEntry[];
  cfoRecommendations: CfoRecommendation[];
  simulations: FinancialSimulationScenario[];
  auditFindings: AuditFinding[];
  invoices: CustomerInvoice[];
  bills: VendorBill[];

  // Actions
  postJournalEntry: (entry: Omit<JournalEntry, 'id' | 'status'>) => void;
  runFinancialSimulation: (type: FinancialSimulationScenario['type'], title: string) => FinancialSimulationScenario;
  resolveAuditFinding: (id: string) => void;
  payVendorBill: (id: string) => void;
}

const DEFAULT_ACCOUNTS: ChartOfAccount[] = [
  { code: '1010', name: 'Operating Cash & Bank Account', type: 'Asset', balance: 12400000 },
  { code: '1200', name: 'Accounts Receivable', type: 'Asset', balance: 1850000 },
  { code: '2010', name: 'Accounts Payable', type: 'Liability', balance: 420000 },
  { code: '3000', name: 'Retained Equity', type: 'Equity', balance: 10000000 },
  { code: '4000', name: 'Software & Game Subscription Revenue', type: 'Revenue', balance: 12400000 },
  { code: '5000', name: 'AI Sub-Agent & Cloud Computing Expenses', type: 'Expense', balance: 8100000 },
];

const DEFAULT_ENTRIES: JournalEntry[] = [
  { id: 'ent-101', date: new Date().toISOString().split('T')[0], description: 'Stripe SaaS Subscription Billing Deposit', accountCode: '1010', debit: 450000, credit: 0, status: 'Audited' },
  { id: 'ent-102', date: new Date().toISOString().split('T')[0], description: 'Cloud Compute Infrastructure Vendor Payment', accountCode: '5000', debit: 0, credit: 120000, status: 'Posted' },
];

const DEFAULT_RECOMMENDATIONS: CfoRecommendation[] = [
  {
    id: 'cfo-rec-1',
    title: 'Capital Re-allocation into High-ROI Game Studio Pipeline',
    recommendation: 'Reallocate $250k from general overhead into Game Studio GPU cluster compute to accelerate asset pipeline velocity by 35%.',
    impactEstimate: '+$1.2M ARR in Q4',
    confidenceScore: 98,
    explainabilityWhy: 'Historical ROI analysis demonstrates 5.4x return on GPU compute pipeline investments with 99.2% execution success.',
  },
  {
    id: 'cfo-rec-2',
    title: 'Early Vendor Payment Discount Capture',
    recommendation: 'Schedule early payment for GitHub Enterprise vendor bill to capture 2% prompt payment cash discount.',
    impactEstimate: '+$14,200 Annual Savings',
    confidenceScore: 95,
    explainabilityWhy: 'Cash runway stands at 28 months, making early discount capture highly net-positive for operating margins.',
  },
];

const DEFAULT_SIMULATIONS: FinancialSimulationScenario[] = [
  { id: 'sim-fin-1', type: 'Hiring', title: 'Hire 4 Senior Rust Engineers Simulation', projectedRoi: 3.8, riskScore: 12, simulationPass: true },
  { id: 'sim-fin-2', type: 'Expansion', title: 'Launch EU Regional Compute Space Simulation', projectedRoi: 4.5, riskScore: 18, simulationPass: true },
];

const DEFAULT_AUDIT_FINDINGS: AuditFinding[] = [
  { id: 'aud-1', findingTitle: 'Verified SHA-256 Vault Hash Traceability on All Postings', severity: 'Low', evidence: '100% journal entries linked to immutable Vault event logs.', status: 'Mitigated' },
];

const DEFAULT_INVOICES: CustomerInvoice[] = [
  { id: 'inv-1001', customerName: 'Apex Game Publishing Corp', amount: 350000, dueDate: '2026-08-15', status: 'Paid' },
  { id: 'inv-1002', customerName: 'Valence Interactive Systems', amount: 180000, dueDate: '2026-08-30', status: 'Outstanding' },
];

const DEFAULT_BILLS: VendorBill[] = [
  { id: 'bill-5001', vendorName: 'GitHub Enterprise License', amount: 71000, dueDate: '2026-08-10', status: 'Scheduled' },
  { id: 'bill-5002', vendorName: 'Cloud GPU Compute Provider', amount: 120000, dueDate: '2026-08-20', status: 'Pending Approval' },
];

export const useFinanceIntelligenceStore = create<FinanceIntelligenceState>((set) => ({
  cashPositionArr: 12.4,
  expensesArr: 8.1,
  cashRunwayMonths: 28,
  grossMarginPercent: 78,
  budgetAdherencePercent: 96,
  financialHealthScore: 99,

  accounts: DEFAULT_ACCOUNTS,
  journalEntries: DEFAULT_ENTRIES,
  cfoRecommendations: DEFAULT_RECOMMENDATIONS,
  simulations: DEFAULT_SIMULATIONS,
  auditFindings: DEFAULT_AUDIT_FINDINGS,
  invoices: DEFAULT_INVOICES,
  bills: DEFAULT_BILLS,

  postJournalEntry: (entry) =>
    set((state) => ({
      journalEntries: [
        {
          id: `ent-${Date.now()}`,
          status: 'Posted',
          ...entry,
        },
        ...state.journalEntries,
      ],
    })),

  runFinancialSimulation: (type, title) => {
    const newSim: FinancialSimulationScenario = {
      id: `sim-fin-${Date.now()}`,
      type,
      title,
      projectedRoi: 4.1,
      riskScore: 15,
      simulationPass: true,
    };

    set((state) => ({ simulations: [newSim, ...state.simulations] }));
    return newSim;
  },

  resolveAuditFinding: (id) =>
    set((state) => ({
      auditFindings: state.auditFindings.map((f) => (f.id === id ? { ...f, status: 'Mitigated' } : f)),
    })),

  payVendorBill: (id) =>
    set((state) => ({
      bills: state.bills.map((b) => (b.id === id ? { ...b, status: 'Paid' } : b)),
    })),
}));
