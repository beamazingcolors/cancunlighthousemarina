import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#002147] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-white">
              Ocurrió un error inesperado
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              El sistema de control de Cancun Lighthouse Marina protegió la integridad de tu sesión. Puedes reiniciar la interfaz de manera segura.
            </p>

            {this.state.error && (
              <div className="p-3 bg-black/40 rounded-xl text-[11px] font-mono text-rose-300 text-left overflow-x-auto max-h-28 border border-white/5">
                {this.state.error.message || 'Error desconocido de renderizado'}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 bg-[#00A3E0] hover:bg-[#008ec4] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00A3E0]/25"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recargar Sistema</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
