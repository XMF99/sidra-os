import { FC } from 'react';
import { useCustomerIntelligenceStore } from '../../state/useCustomerIntelligenceStore';
import { Stack, Box, Heading, Text, StatusBadge, Button, Alert } from '@sidra/ui';

export const CustomerSuccessSupportView: FC = () => {
  const { tickets, resolveSupportTicket } = useCustomerIntelligenceStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Customer Success & Support Center</Heading>
      <Text color="secondary">
        Monitors customer onboarding health, support ticket queues, SLA compliance, and renewal workflows.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {tickets.map((tkt) => (
          <Box
            key={tkt.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="10px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Heading level={4}>{tkt.subject}</Heading>
                  <Text size="xs" color="muted">Customer: {tkt.customerName} • Priority: {tkt.priority}</Text>
                </div>
                <StatusBadge status={tkt.status === 'Resolved' ? 'success' : 'active'}>{tkt.status.toUpperCase()}</StatusBadge>
              </div>

              <div style={{ fontSize: 12, color: '#9ca3af' }}>
                SLA Compliance Status: <strong style={{ color: tkt.slaMet ? '#34d399' : '#f87171' }}>{tkt.slaMet ? 'SLA MET' : 'SLA BREACH'}</strong>
              </div>

              {tkt.status !== 'Resolved' && (
                <Button variant="primary" size="sm" onClick={() => resolveSupportTicket(tkt.id)}>
                  Mark Ticket Resolved
                </Button>
              )}
            </Stack>
          </Box>
        ))}
      </div>

      <Alert type="success" title="Customer Health Index:">
        Net Retention Rate stands at 124% with 98% average health score across enterprise accounts.
      </Alert>
    </Stack>
  );
};
