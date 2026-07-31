import { FC } from 'react';
import { useSupplyChainStore } from '../../state/useSupplyChainStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, KPICard, Alert, Icon } from '@sidra/ui';

export const SupplyChainWorkspaceView: FC = () => {
  const { inventoryHealthScore, warehouseUtilizationPercent, supplierOnTimeRatePercent, activePurchaseOrdersCount, purchaseOrdersValueAmount, fulfillmentVelocityPercent } = useSupplyChainStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Box
        padding="24px"
        bg="linear-gradient(135deg, rgba(20, 184, 166, 0.22) 0%, rgba(99, 102, 241, 0.22) 100%)"
        borderRadius="8px"
        border="1px solid rgba(20, 184, 166, 0.5)"
      >
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Heading level={2}>Supply Chain & Procurement Workspace</Heading>
              <Text size="xs" color="muted">AI-First Enterprise Supply Chain Platform</Text>
            </div>
            <StatusBadge status="success">AI CSCO ACTIVE</StatusBadge>
          </div>
          <Text color="secondary">
            Consumes certified platform services to orchestrate procurement, inventory levels, warehouse operations, and global logistics.
          </Text>
        </Stack>
      </Box>

      <Grid columns={4} gap="16px">
        <KPICard
          title="Inventory Health Score"
          value={`${inventoryHealthScore}% Health`}
          change="Zero Out-of-Stock"
          changeType="positive"
          icon={<Icon name="Package" />}
        />
        <KPICard
          title="Warehouse Utilization"
          value={`${warehouseUtilizationPercent}% Load`}
          change="Optimal Bin Capacity"
          changeType="positive"
          icon={<Icon name="Home" />}
        />
        <KPICard
          title="Supplier On-Time Rate"
          value={`${supplierOnTimeRatePercent}% On-Time`}
          change="High Vendor Score"
          changeType="positive"
          icon={<Icon name="Truck" />}
        />
        <KPICard
          title="Active Purchase Orders"
          value={`${activePurchaseOrdersCount} POs ($${(purchaseOrdersValueAmount / 1000000).toFixed(1)}M)`}
          change={`${fulfillmentVelocityPercent}% Velocity`}
          changeType="positive"
          icon={<Icon name="FileText" />}
        />
      </Grid>

      <Alert type="info" title="Supply Chain & Procurement Telemetry:">
        Active PO Ledger: <strong>42 Active Purchase Orders ($3.8M)</strong> • 100% of procurement events synced with the Finance Intelligence & Operations Suites.
      </Alert>
    </Stack>
  );
};
