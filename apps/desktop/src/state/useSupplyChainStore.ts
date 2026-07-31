import { create } from 'zustand';

export type PurchaseOrderStatus = 'Draft' | 'Approved' | 'Fulfilled';
export type SupplierRiskLevel = 'Low' | 'Medium' | 'High';

export interface PurchaseOrder {
  id: string;
  supplierName: string;
  itemDescription: string;
  totalCost: number;
  status: PurchaseOrderStatus;
}

export interface SupplierScorecard {
  id: string;
  vendorName: string;
  performanceRating: number; // 0..100
  riskLevel: SupplierRiskLevel;
}

export interface InventoryItem {
  id: string;
  sku: string;
  itemName: string;
  stockLevel: number;
  reorderPoint: number;
  warehouseLocation: string;
}

export interface CscoRecommendation {
  id: string;
  title: string;
  recommendation: string;
  impactEstimate: string;
  confidenceScore: number; // 0..100
  explainabilityWhy: string;
}

export interface SupplyChainSimulationScenario {
  id: string;
  type: 'Demand' | 'Inventory' | 'Warehouse' | 'Supplier' | 'Logistics';
  title: string;
  projectedCostReduction: number; // %
  riskScore: number; // 0..100
  simulationPass: boolean;
}

export interface SupplyAuditFinding {
  id: string;
  findingTitle: string;
  severity: 'High' | 'Medium' | 'Low';
  evidence: string;
  status: 'Open' | 'Mitigated' | 'Dismissed';
}

interface SupplyChainState {
  inventoryHealthScore: number;
  warehouseUtilizationPercent: number;
  supplierOnTimeRatePercent: number;
  activePurchaseOrdersCount: number;
  purchaseOrdersValueAmount: number;
  fulfillmentVelocityPercent: number;
  demandForecastAccuracyPercent: number;

  purchaseOrders: PurchaseOrder[];
  supplierScorecards: SupplierScorecard[];
  inventoryItems: InventoryItem[];
  cscoRecommendations: CscoRecommendation[];
  simulations: SupplyChainSimulationScenario[];
  auditFindings: SupplyAuditFinding[];

  // Actions
  approvePurchaseOrder: (id: string) => void;
  runSupplyChainSimulation: (type: SupplyChainSimulationScenario['type'], title: string) => SupplyChainSimulationScenario;
  resolveSupplyAuditFinding: (id: string) => void;
}

const DEFAULT_PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: 'po-1', supplierName: 'NVIDIA Enterprise Systems', itemDescription: 'H100 Tensor Core GPU Compute Nodes (Batch 4)', totalCost: 2400000, status: 'Approved' },
  { id: 'po-2', supplierName: 'Supermicro Server Solutions', itemDescription: 'Ultra-High Density Rack Units', totalCost: 1400000, status: 'Draft' },
];

const DEFAULT_SUPPLIERS: SupplierScorecard[] = [
  { id: 'sup-1', vendorName: 'NVIDIA Corporation', performanceRating: 98, riskLevel: 'Low' },
  { id: 'sup-2', vendorName: 'Supermicro Systems', performanceRating: 95, riskLevel: 'Low' },
];

const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', sku: 'SKU-GPU-H100-01', itemName: 'NVIDIA H100 SXM5 80GB Node', stockLevel: 64, reorderPoint: 16, warehouseLocation: 'WH-ALPHA-BIN-04' },
  { id: 'inv-2', sku: 'SKU-NET-100G-02', itemName: 'ConnectX-7 100G InfiniBand Adapter', stockLevel: 120, reorderPoint: 30, warehouseLocation: 'WH-BETA-BIN-12' },
];

const DEFAULT_CSCO_RECOMMENDATIONS: CscoRecommendation[] = [
  {
    id: 'csco-rec-1',
    title: 'Consolidate GPU Compute Hardware POs for Bulk Discount',
    recommendation: 'Combine Batch 4 and Batch 5 hardware POs with NVIDIA to secure an additional 6.5% enterprise tier rebate.',
    impactEstimate: '+$247k Direct Savings',
    confidenceScore: 98,
    explainabilityWhy: 'Historical contract terms trigger Tier 1 volume discount thresholds above $3.5M combined PO value.',
  },
  {
    id: 'csco-rec-2',
    title: 'Implement Regional Buffer Stocking for High-Demand Nodes',
    recommendation: 'Pre-allocate 12 GPU nodes to European Data Center Warehouse to decrease fulfillment latency by 68%.',
    impactEstimate: '68% Lower Latency',
    confidenceScore: 95,
    explainabilityWhy: 'Sales & CRM pipeline forecasts show a 40% surge in EU enterprise deployments over Q4.',
  },
];

const DEFAULT_SIMULATIONS: SupplyChainSimulationScenario[] = [
  { id: 'sim-sup-1', type: 'Inventory', title: 'Global Hardware Safety Stock Optimization Simulation', projectedCostReduction: 18, riskScore: 7, simulationPass: true },
  { id: 'sim-sup-2', type: 'Logistics', title: 'Air vs Sea Logistics Cost & Lead Time Simulation', projectedCostReduction: 24, riskScore: 9, simulationPass: true },
];

const DEFAULT_AUDIT_FINDINGS: SupplyAuditFinding[] = [
  { id: 'aud-sup-1', findingTitle: 'Verified Inventory Barcode Hashes & Vault Traceability', severity: 'Low', evidence: '100% of receiving events match Vault ledger hashes with zero discrepancies.', status: 'Mitigated' },
];

export const useSupplyChainStore = create<SupplyChainState>((set) => ({
  inventoryHealthScore: 98,
  warehouseUtilizationPercent: 84,
  supplierOnTimeRatePercent: 97.4,
  activePurchaseOrdersCount: 42,
  purchaseOrdersValueAmount: 3800000,
  fulfillmentVelocityPercent: 99.2,
  demandForecastAccuracyPercent: 96,

  purchaseOrders: DEFAULT_PURCHASE_ORDERS,
  supplierScorecards: DEFAULT_SUPPLIERS,
  inventoryItems: DEFAULT_INVENTORY,
  cscoRecommendations: DEFAULT_CSCO_RECOMMENDATIONS,
  simulations: DEFAULT_SIMULATIONS,
  auditFindings: DEFAULT_AUDIT_FINDINGS,

  approvePurchaseOrder: (id) =>
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((p) => (p.id === id ? { ...p, status: 'Approved' } : p)),
    })),

  runSupplyChainSimulation: (type, title) => {
    const newSim: SupplyChainSimulationScenario = {
      id: `sim-sup-${Date.now()}`,
      type,
      title,
      projectedCostReduction: 20,
      riskScore: 8,
      simulationPass: true,
    };

    set((state) => ({ simulations: [newSim, ...state.simulations] }));
    return newSim;
  },

  resolveSupplyAuditFinding: (id) =>
    set((state) => ({
      auditFindings: state.auditFindings.map((f) => (f.id === id ? { ...f, status: 'Mitigated' } : f)),
    })),
}));
