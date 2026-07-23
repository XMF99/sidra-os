import { FC } from 'react';
import { Card } from '../../../components/composite/Card';
import { WidgetErrorBoundary } from '../../../app/boundaries/WidgetErrorBoundary';
import { useProjectsQuery } from '../../../data/queries';
import { navigate } from '../../../routes/navigate';
import { FolderKanban, Pin } from 'lucide-react';

export const PinnedProjectsWidget: FC = () => {
  const { data: projects, isLoading, error } = useProjectsQuery();
  const pinnedProjects = (projects || []).filter((p) => p.isPinned);

  return (
    <WidgetErrorBoundary widgetName="Pinned Projects">
      <Card padding="var(--sd-space-4)">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sd-space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-2)' }}>
            <Pin size={18} style={{ color: 'var(--sd-color-primary)' }} />
            <h4 style={{ margin: 0, fontSize: 'var(--sd-font-size-md)', fontWeight: 'var(--sd-font-weight-semibold)' }}>
              Pinned Projects
            </h4>
          </div>
          <button
            onClick={() => navigate.projects()}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--sd-color-primary)',
              cursor: 'pointer',
              fontSize: 'var(--sd-font-size-xs)',
            }}
          >
            Manage
          </button>
        </div>

        {isLoading ? (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text-muted)' }}>Loading pinned projects...</div>
        ) : error ? (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-status-danger)' }}>Error loading projects</div>
        ) : pinnedProjects.length === 0 ? (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text-muted)' }}>Pin a project to keep it here.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sd-space-2)' }}>
            {pinnedProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate.projectDetail(project.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--sd-space-2) var(--sd-space-3)',
                  borderRadius: 'var(--sd-radius-md)',
                  backgroundColor: 'var(--sd-color-bg-inset)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-2)' }}>
                  <FolderKanban size={16} style={{ color: 'var(--sd-color-primary)' }} />
                  <span style={{ fontSize: 'var(--sd-font-size-sm)', fontWeight: 'var(--sd-font-weight-medium)', color: 'var(--sd-color-text)' }}>
                    {project.name}
                  </span>
                </div>
                <span style={{ fontSize: 'var(--sd-font-size-xs)', color: 'var(--sd-color-text-muted)' }}>
                  {project.missionCount} missions · {project.docCount} docs
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </WidgetErrorBoundary>
  );
};
