import { FC } from 'react';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Button, Alert, KPICard, Icon } from '@sidra/ui';

export const EnterpriseAdminCenterView: FC = () => {
  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Heading level={3}>Administration & Governance Center</Heading>
          <Text color="secondary">
            Centralized Organization Administration: Member roles, Department permissions, AI token consumption, SAML SSO, MFA, and Security Audit Logs.
          </Text>
        </div>
        <Button variant="secondary" size="md">
          Export Security Audit Logs
        </Button>
      </div>

      <Grid columns={4} gap="16px">
        <KPICard title="Organization Members" value="40 Active Users" change="28 AI Agents + 12 Humans" changeType="positive" icon={<Icon name="Users" />} />
        <KPICard title="AI Consumption" value="1.24M Tokens / mo" change="Within Budget Cap" changeType="positive" icon={<Icon name="Zap" />} />
        <KPICard title="Storage Usage" value="48.2 GB / 1 TB" change="Vault Encrypted" changeType="positive" icon={<Icon name="Shield" />} />
        <KPICard title="Billing & Invoicing" value="Not Configured" change="Requires Provider Setup" changeType="neutral" icon={<Icon name="TrendingUp" />} />
      </Grid>

      <Grid columns={2} gap="16px">
        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Security & Identity Provisioning</Heading>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>SAML 2.0 / Okta SSO:</span>
                <StatusBadge status="success">CONFIGURED</StatusBadge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Multi-Factor Authentication (MFA):</span>
                <StatusBadge status="success">ENFORCED</StatusBadge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Permission Broker Department Isolation:</span>
                <StatusBadge status="success">ACTIVE</StatusBadge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Customer Data Retention & Privacy Controls:</span>
                <StatusBadge status="success">ZERO TRAINING DEFAULT</StatusBadge>
              </div>
            </div>
          </Stack>
        </Box>

        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Billing & Spend Controls</Heading>
            <Alert type="info" title="Billing Provider Configuration Status:">
              Enterprise Billing Provider is currently <strong>Not Configured</strong>. Spend limits and invoice history will populate automatically once a payment gateway is connected.
            </Alert>
            <div style={{ marginTop: 8 }}>
              <Button variant="primary" size="sm">
                Connect Enterprise Billing Gateway
              </Button>
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
