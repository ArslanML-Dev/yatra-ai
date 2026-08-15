"use client";

import { Component, type ReactNode } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

interface MapErrorBoundaryProps {
  children: ReactNode;
}

interface MapErrorBoundaryState {
  hasError: boolean;
  retryKey: number;
}

/**
 * Scoped to just the Leaflet map subtree. react-leaflet v5 + React 19
 * has a known remount race ("Map container is already initialized" —
 * github.com/PaulLeCam/react-leaflet/issues/1133) that can throw on
 * certain unmount/remount sequences (e.g. fast client-side navigation
 * away from and back to /map). Catching it here means a map failure
 * degrades to a scoped, real retry control instead of the whole app
 * hitting the global error screen — not hiding the error, handling it.
 */
export class MapErrorBoundary extends Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  state: MapErrorBoundaryState = { hasError: false, retryKey: 0 };

  static getDerivedStateFromError(): Partial<MapErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Map failed to render:", error);
  }

  handleRetry = (): void => {
    this.setState((prev) => ({ hasError: false, retryKey: prev.retryKey + 1 }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
          <ErrorState
            title="The map couldn't load"
            description="This can happen after navigating back and forth quickly. Try again."
          />
          <button
            type="button"
            onClick={this.handleRetry}
            className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-navy-800"
          >
            Try again
          </button>
        </div>
      );
    }
    // Keyed on retryKey so a retry forces a genuinely fresh mount of
    // the Leaflet subtree, not a re-render of the same failed instance.
    return <div key={this.state.retryKey} className="h-full w-full">{this.props.children}</div>;
  }
}
