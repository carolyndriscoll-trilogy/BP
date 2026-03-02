import { useMemo, useCallback } from 'react';
import { useSearch } from 'wouter';
import type { BrainliftData } from '@shared/schema';
import { PurposePhase } from './PurposePhase';
import { ExpertsPhase } from './ExpertsPhase';
import { KnowledgeTreePhase } from './KnowledgeTreePhase';
import { PlaceholderPhase } from './PlaceholderPhase';

const PHASES = [
  { id: 1, label: 'You & Your Mission', dok: null },
  { id: 2, label: 'Your Experts', dok: null },
  { id: 3, label: 'Knowledge Tree', dok: 'DOK1 + DOK2' },
  { id: 4, label: 'Connections', dok: 'DOK3' },
  { id: 5, label: 'Blueprints', dok: null },
  { id: 6, label: 'Your Stance', dok: 'DOK4' },
] as const;

interface BuilderViewProps {
  data: BrainliftData;
  slug: string;
}

export function BuilderView({ data, slug }: BuilderViewProps) {
  const searchString = useSearch();

  const activePhase = useMemo(() => {
    const params = new URLSearchParams(searchString);
    const phase = parseInt(params.get('phase') || '1', 10);
    return phase >= 1 && phase <= 6 ? phase : 1;
  }, [searchString]);

  const setActivePhase = useCallback((phase: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('phase', String(phase));
    params.set('mode', 'build');
    const newUrl = `?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  return (
    <div className="flex gap-6 min-h-[600px]">
      {/* Phase sidebar */}
      <nav className="w-56 shrink-0">
        <div className="text-[11px] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-3 px-3">
          Build Phases
        </div>
        <ul className="list-none p-0 m-0 flex flex-col gap-0.5">
          {PHASES.map((phase) => {
            const isActive = activePhase === phase.id;
            return (
              <li key={phase.id}>
                <button
                  onClick={() => setActivePhase(phase.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors border-none cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <span className="text-[11px] font-bold w-5 text-center shrink-0">{phase.id}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block truncate">{phase.label}</span>
                    {phase.dok && (
                      <span className="block text-[10px] text-muted-foreground/60 font-normal leading-tight">{phase.dok}</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Phase content */}
      <div className="flex-1 min-w-0">
        {activePhase === 1 && (
          <PurposePhase data={data} slug={slug} />
        )}
        {activePhase === 2 && (
          <ExpertsPhase data={data} slug={slug} />
        )}
        {activePhase === 3 && (
          <KnowledgeTreePhase data={data} slug={slug} />
        )}
        {activePhase >= 4 && (
          <PlaceholderPhase
            label={PHASES.find(p => p.id === activePhase)?.label || ''}
          />
        )}
      </div>
    </div>
  );
}
