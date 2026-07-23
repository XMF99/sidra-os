import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RouteErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[RouteErrorBoundary] Page route error:', error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 'var(--sd-space-6)',
            margin: 'var(--sd-space-6)',
            borderRadius: 'var(--sd-radius-lg)',
            backgroundColor: 'var(--sd-color-bg-surface)',
            border: '1px solid var(--sd-color-border)',
            textAlign: 'center',
          }}
        >
          <h3
            style={{
              margin: '0 0 var(--sd-space-2) 0',
              fontSize: 'var(--sd-font-size-lg)',
              color: 'var(--sd-status-danger)',
            }}
          >
            Failed to Load Page Content
          </h3>
          <p
            style={{
              margin: '0 0 var(--sd-space-4) 0',
              fontSize: 'var(--sd-font-size-base)',
              color: 'var(--sd-color-text-muted)',
            }}
          >
            This page encountered an error. Other areas of Sidra OS remain operational.
          </p>
          {this.state.error && (
            <pre
              style={{
                padding: 'var(--sd-space-3)',
                borderRadius: 'var(--sd-radius-sm)',
                backgroundColor: 'var(--sd-color-bg-inset)',
                color: 'var(--sd-color-text-muted)',
                fontSize: 'var(--sd-font-size-xs)',
                fontFamily: 'var(--sd-font-mono)',
                textAlign: 'left',
                overflowX: 'auto',
                margin: '0 0 var(--sd-space-4) 0',
                maxHeight: '100px',
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleRetry}
            style={{
              padding: 'var(--sd-space-2) var(--sd-space-4)',
              borderRadius: 'var(--sd-radius-md)',
              backgroundColor: 'var(--sd-color-primary)',
              color: 'var(--sd-color-primary-contrast)',
              border: 'none',
              fontWeight: 'var(--sd-font-weight-medium)',
              cursor: 'pointer',
            }}
          >
            Retry View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
