import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[AppErrorBoundary] Uncaught shell error:', error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            padding: 'var(--sd-space-6)',
            backgroundColor: 'var(--sd-color-bg-app)',
            color: 'var(--sd-color-text)',
            fontFamily: 'var(--sd-font-sans)',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              padding: 'var(--sd-space-6)',
              borderRadius: 'var(--sd-radius-lg)',
              backgroundColor: 'var(--sd-color-bg-surface)',
              border: '1px solid var(--sd-color-border)',
              boxShadow: 'var(--sd-shadow-3)',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                margin: '0 0 var(--sd-space-3) 0',
                fontSize: 'var(--sd-font-size-xl)',
                color: 'var(--sd-status-danger)',
              }}
            >
              Sidra OS Application Error
            </h2>
            <p
              style={{
                margin: '0 0 var(--sd-space-4) 0',
                fontSize: 'var(--sd-font-size-base)',
                color: 'var(--sd-color-text-muted)',
              }}
            >
              An unexpected shell error occurred. The local Vault and event log remain intact.
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
                  maxHeight: '120px',
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
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
