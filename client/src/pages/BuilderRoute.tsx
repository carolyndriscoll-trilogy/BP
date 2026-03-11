import { Component, type ReactNode } from 'react';
import BuilderPage from '@/pages/Builder';

interface BuilderRouteProps {
  slug: string;
}

interface BuilderBoundaryProps {
  slug: string;
  children: ReactNode;
}

interface BuilderBoundaryState {
  hasError: boolean;
}

class BuilderErrorBoundary extends Component<BuilderBoundaryProps, BuilderBoundaryState> {
  state: BuilderBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('[BuilderRoute] Unhandled builder error', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
          <div className="max-w-lg text-center">
            <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-3">
              Builder
            </div>
            <h1 className="text-2xl font-bold">The builder failed to load</h1>
            <p className="mt-3 text-muted-foreground">
              Open the standard BrainLift view while this builder error is being fixed.
            </p>
            <button
              onClick={() => window.location.assign(`/grading/${this.props.slug}`)}
              className="mt-6 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium"
            >
              Open BrainLift
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function BuilderRoute({ slug }: BuilderRouteProps) {
  return (
    <BuilderErrorBoundary slug={slug}>
      <BuilderPage slug={slug} />
    </BuilderErrorBoundary>
  );
}
