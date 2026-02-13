"use client";

import React from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f6f7f8] p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
              <AlertCircle className="h-7 w-7 text-rose-500" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-neutral-500 mb-1">
              An unexpected error occurred. This has been logged automatically.
            </p>
            {this.state.error?.message && (
              <p className="text-xs text-neutral-400 font-mono bg-neutral-50 rounded-lg px-3 py-2 mb-5 break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-800 transition-colors"
              >
                <RefreshCcw className="h-4 w-4" />
                Reload Page
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = "/dashboard";
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-neutral-700 text-sm font-semibold rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
