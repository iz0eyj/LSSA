import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('🔴 ErrorBoundary: Error caught:', error);
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔴 ErrorBoundary: Component crashed:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    console.log('🔄 ErrorBoundary: Retrying...');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Errore nel Componente</h1>
            </div>
            
            <p className="text-gray-600 mb-6">
              Si è verificato un errore imprevisto durante il rendering del componente.
            </p>
            
            <button
              onClick={this.handleRetry}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-6"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Riprova
            </button>
            
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold text-gray-700 cursor-pointer mb-2">
                Dettagli Errore (Development)
              </summary>
              
              {this.state.error && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-red-600 mb-2">Messaggio di Errore:</h3>
                    <pre className="bg-red-50 p-3 rounded text-sm text-red-800 overflow-x-auto">
                      {this.state.error.message}
                    </pre>
                  </div>
                  
                  {this.state.error.stack && (
                    <div>
                      <h3 className="font-medium text-red-600 mb-2">Stack Trace:</h3>
                      <pre className="bg-red-50 p-3 rounded text-xs text-red-700 overflow-x-auto max-h-40 overflow-y-auto">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <h3 className="font-medium text-red-600 mb-2">Component Stack:</h3>
                      <pre className="bg-red-50 p-3 rounded text-xs text-red-700 overflow-x-auto max-h-40 overflow-y-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;