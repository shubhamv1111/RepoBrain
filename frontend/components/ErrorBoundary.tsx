"use client";

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            className="flex flex-col items-center justify-center py-12 gap-3"
            style={{ color: "var(--rb-text-muted)" }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "var(--rb-border)" }}
            >
              <span style={{ fontSize: "18px" }}>!</span>
            </div>
            <p className="text-[14px]">Something went wrong</p>
            <p className="text-[12px]">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="text-[12px] mt-2 cursor-pointer"
              style={{ color: "var(--rb-blue)" }}
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
