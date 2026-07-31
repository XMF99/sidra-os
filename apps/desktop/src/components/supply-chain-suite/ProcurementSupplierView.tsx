import { FC } from 'react';
import { useSupplyChainStore } from '../../state/useSupplyChainStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Button } from '@sidra/ui';

export const ProcurementSupplierView: FC = () => {
  const { purchaseOrders, supplierScorecards, approvePurchaseOrder } = useSupplyChainStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Procurement Center & Supplier Scorecards</Heading>
      <Text color="secondary">
        Manages purchase requisitions, RFQs, purchase orders, vendor performance ratings, and receiving workflows.
      </Text>

      <Grid columns={2} gap="16px">
        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Purchase Orders Ledger</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {purchaseOrders.map((po) => (
                <div key={po.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div>
                    <div><strong>{po.supplierName}</strong></div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>{po.itemDescription} • Total: ${po.totalCost.toLocaleString()}</div>
                  </div>
                  {po.status !== 'Approved' ? (
                    <Button variant="primary" size="sm" onClick={() => approvePurchaseOrder(po.id)}>
                      Approve PO
                    </Button>
                  ) : (
                    <StatusBadge status="success">APPROVED</StatusBadge>
                  )}
                </div>
              ))}
            </div>
          </Stack>
        </Box>

        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Supplier Directory & Ratings</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {supplierScorecards.map((sup) => (
                <div key={sup.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div>
                    <div><strong>{sup.vendorName}</strong></div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Performance Rating: {sup.performanceRating}% • Risk Level: {sup.riskLevel}</div>
                  </div>
                  <StatusBadge status="success">PREFERRED VENDOR</StatusBadge>
                </div>
              ))}
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
