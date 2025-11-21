import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Terminal, XCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-red-500 font-mono flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-red-900 selection:text-white">
            {/* Background Noise/Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(255,0,0,0.03))] bg-[length:100%_4px,6px_100%] pointer-events-none"></div>
            
            <div className="max-w-3xl w-full z-10 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="border-2 border-red-600 bg-black/80 backdrop-blur-md p-8 rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                    <div className="flex items-center gap-4 mb-6 border-b border-red-900/50 pb-6">
                        <div className="w-16 h-16 bg-red-900/20 border border-red-500 rounded flex items-center justify-center animate-pulse">
                            <AlertTriangle size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tighter text-red-500 flex items-center gap-2">
                                CRITICAL_SYSTEM_FAILURE
                            </h1>
                            <p className="text-red-400/70 text-xs font-mono uppercase tracking-widest">
                                Exception Handler Triggered // Process Terminated
                            </p>
                        </div>
                    </div>

                    {/* Error Details */}
                    <div className="space-y-4 mb-8">
                        <div className="bg-red-950/20 border border-red-900/50 p-4 rounded text-sm font-mono overflow-x-auto">
                            <div className="flex items-center gap-2 text-red-400 mb-2 border-b border-red-900/30 pb-2">
                                <Terminal size={14} /> 
                                <span>STACK_TRACE_DUMP</span>
                            </div>
                            <p className="text-red-300 font-bold mb-2">
                                {this.state.error?.toString() || "Unknown Error Occurred"}
                            </p>
                            {this.state.errorInfo && (
                                <pre className="text-red-400/60 text-xs whitespace-pre-wrap">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={this.handleReload}
                            className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-500 text-black font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
                        >
                            <RefreshCw className="group-hover:rotate-180 transition-transform duration-500" size={20} />
                            INITIATE_SYSTEM_REBOOT
                        </button>
                        <button 
                            onClick={() => this.setState({ hasError: false })}
                            className="px-6 py-4 border border-red-900/50 text-red-500 hover:bg-red-900/20 font-mono text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                        >
                            <XCircle size={18} />
                            DISMISS (UNSAFE)
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-red-900 font-mono">
                        ERROR_CODE: 0xCRASH_OVERRIDE // MEMORY_DUMP_COMPLETE
                    </p>
                </div>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}