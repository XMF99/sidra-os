import { FC } from 'react';
import { useSupplyChainStore } from '../../state/useSupplyChainStore';
import { Stack, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const WarehouseLogisticsView: FC = () => {
  const { inventoryItems } = useSupplyChainStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Warehouse Operations & Logistics Intelligence</Heading>
      <Text color="secondary">
        Monitors stock levels, bin locations, reorder points, shipment tracking, and fulfillment velocity.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {inventoryItems.map((item) => (
          <Box
            key={item.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="10px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Heading level={4}>{item.itemName}</Heading>
                  <Text size="xs" color="muted">SKU: {item.sku} • Location: {item.warehouseLocation}</Text>
                </div>
                <StatusBadge status="success">{item.stockLevel} UNITS IN STOCK</StatusBadge>
              </div>

              <Text size="xs" color="secondary">
                Reorder Threshold: <strong>{item.reorderPoint} Units (Auto-Replenish Active)</strong>
              </Text>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
