import { FC } from 'react';
import { useThekyConsoleStore } from '../../state/useThekyConsoleStore';
import { Button, Icon, StatusBadge } from '@sidra/ui';

export interface ConversationActionsMenuProps {
  messageId: string;
  convertedAction?: { type: string; id: string; name: string };
}

export const ConversationActionsMenu: FC<ConversationActionsMenuProps> = ({
  messageId,
  convertedAction,
}) => {
  const { convertMessageToAction } = useThekyConsoleStore();

  if (convertedAction) {
    return (
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <StatusBadge status="success">
          CONVERTED TO {convertedAction.type.toUpperCase()}: {convertedAction.name}
        </StatusBadge>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        paddingTop: 8,
        borderTop: '1px solid rgba(255,255,255,0.08)',
        flexWrap: 'wrap',
      }}
    >
      <span style={{ fontSize: 11, color: '#6b7280', marginRight: 4 }}>Convert to:</span>
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<Icon name="CheckSquare" size={12} />}
        onClick={() => convertMessageToAction(messageId, 'Task')}
        style={{ fontSize: 11, height: 24, padding: '0 8px' }}
      >
        Task
      </Button>
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<Icon name="Folder" size={12} />}
        onClick={() => convertMessageToAction(messageId, 'Project')}
        style={{ fontSize: 11, height: 24, padding: '0 8px' }}
      >
        Project
      </Button>
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<Icon name="FileText" size={12} />}
        onClick={() => convertMessageToAction(messageId, 'Document')}
        style={{ fontSize: 11, height: 24, padding: '0 8px' }}
      >
        Doc
      </Button>
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<Icon name="BookOpen" size={12} />}
        onClick={() => convertMessageToAction(messageId, 'Knowledge')}
        style={{ fontSize: 11, height: 24, padding: '0 8px' }}
      >
        Knowledge
      </Button>
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<Icon name="Layers" size={12} />}
        onClick={() => convertMessageToAction(messageId, 'Workspace')}
        style={{ fontSize: 11, height: 24, padding: '0 8px', color: '#818cf8' }}
      >
        Generate Workspace
      </Button>
    </div>
  );
};
