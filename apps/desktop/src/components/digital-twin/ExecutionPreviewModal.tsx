import { FC } from 'react';
import { useDigitalTwinStore } from '../../state/useDigitalTwinStore';
import { Stack, Box, Heading, Text, StatusBadge, Button, Alert } from '@sidra/ui';

export const ExecutionPreviewModal: FC = () => {
  const { stagedPreview, approveExecutionPlan, clearStagedPreview } = useDigitalTwinStore();

  if (!stagedPreview) return null;

  return (
    <div
      role="dialog"
      aria-label="Pre-Execution Preview Modal"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={clearStagedPreview}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540, width: '100%' }}>
        <Box
          padding="28px"
          bg="var(--sd-color-surface-raised, #12151e)"
          borderRadius="12px"
          border="1px solid var(--sd-color-accent, #6366f1)"
          style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.8)' }}
        >
          <Stack gap="16px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={3}>Pre-Execution Preview</Heading>
              <StatusBadge status={stagedPreview.isApproved ? 'success' : 'pending'}>
                {stagedPreview.isApproved ? 'HUMAN APPROVED' : 'APPROVAL REQUIRED'}
              </StatusBadge>
            </div>

            <Heading level={4}>{stagedPreview.planTitle}</Heading>

            <Alert type="info" title="Rollback Availability Strategy:">
              {stagedPreview.rollbackStrategy}
            </Alert>

            <div>
              <Text size="xs" weight="semibold" color="muted">Created Objects:</Text>
              <ul style={{ margin: '4px 0 0 16px', fontSize: 12, color: '#34d399' }}>
                {stagedPreview.createdObjects.map((obj, i) => (
                  <li key={i}>+ {obj}</li>
                ))}
              </ul>
            </div>

            <div>
              <Text size="xs" weight="semibold" color="muted">Updated Objects:</Text>
              <ul style={{ margin: '4px 0 0 16px', fontSize: 12, color: '#fbbf24' }}>
                {stagedPreview.updatedObjects.map((obj, i) => (
                  <li key={i}>~ {obj}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              {!stagedPreview.isApproved ? (
                <Button
                  variant="primary"
                  onClick={() => approveExecutionPlan(stagedPreview.planId)}
                >
                  Human Approval: Execute Plan
                </Button>
              ) : (
                <StatusBadge status="success">PLAN EXECUTED IN PRODUCTION</StatusBadge>
              )}
              <Button variant="ghost" onClick={clearStagedPreview}>
                Close Preview
              </Button>
            </div>
          </Stack>
        </Box>
      </div>
    </div>
  );
};
