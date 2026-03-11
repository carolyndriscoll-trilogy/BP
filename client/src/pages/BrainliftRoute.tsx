import { useEffect, useMemo } from 'react';
import { useSearch } from 'wouter';
import Dashboard from '@/pages/Dashboard';

interface BrainliftRouteProps {
  slug: string;
}

export default function BrainliftRoute({ slug }: BrainliftRouteProps) {
  const searchString = useSearch();

  const redirectTarget = useMemo(() => {
    const params = new URLSearchParams(searchString);
    if (params.get('mode') !== 'build') {
      return null;
    }

    const phase = params.get('phase');
    return phase ? `/builder/${slug}?phase=${phase}` : `/builder/${slug}`;
  }, [searchString, slug]);

  useEffect(() => {
    if (redirectTarget) {
      window.location.replace(redirectTarget);
    }
  }, [redirectTarget]);

  if (redirectTarget) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-3">
            Builder
          </div>
          <div className="text-lg font-semibold">Opening the dedicated builder workspace...</div>
        </div>
      </div>
    );
  }

  return <Dashboard slug={slug} />;
}
