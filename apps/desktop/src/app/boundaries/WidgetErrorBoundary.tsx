import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  widgetName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[WidgetErrorBoundary] Widget [${this.props.widgetName || 'unnamed'}] error:`, error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 'var(--sd-space-4)',
            borderRadius: 'var(--sd-radius-md)',
            backgroundColor: 'var(--sd-color-bg-surface)',
            border: '1px dashed var(--sd-status-danger)',
            minHeight: '80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 'var(--sd-font-size-sm)',
              fontWeight: 'var(--sd-font-weight-semibold)',
              color: 'var(--sd-status-danger)',
              marginBottom: 'var(--sd-space-1)',
            }}
          >
            Widget Unavailable ({this.props.widgetName || 'Widget'})
          </div>
          <div
            style={{
              fontSize: 'var(--sd-font-size-xs)',
              color: 'var(--sd-color-text-muted)',
              marginBottom: 'var(--sd-space-2)',
            }}
          >
            {this.state.error?.message || 'Data retrieval failed.'}
          </div>
          <button
            onClick={this.handleRetry}
            style={{
              alignSelf: 'flex-start',
              padding: '2px var(--sd-space-2)',
              fontSize: 'var(--sd-font-size-xs)',
              borderRadius: 'var(--sd-radius-sm)',
              backgroundColor: 'var(--sd-color-bg-inset)',
              border: '1px solid var(--sd-color-border)',
              color: 'var(--sd-color-text)',
              cursor: 'pointer',
            }}
          >
            Retry Widget
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
