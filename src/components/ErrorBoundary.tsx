import { Component, type ErrorInfo, type ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('LifeXP error boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-screen">
          <div className="panel">
            <h1>LifeXP hit a snag</h1>
            <p>Your data is still local in this browser. Try refreshing, then export a backup from Settings if the issue continues.</p>
            <code>{this.state.message}</code>
            <button className="btn primary" onClick={() => window.location.reload()}>Reload app</button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
