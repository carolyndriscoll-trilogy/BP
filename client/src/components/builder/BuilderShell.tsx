import { useMemo, useCallback } from 'react';
import { ArrowLeft, Eye } from 'lucide-react';
import { useSearch } from 'wouter';
import type { BrainliftData } from '@shared/schema';
import { TactileButton } from '@/components/ui/tactile-button';
import { BuilderView, BUILDER_PHASES } from './BuilderView';

interface BuilderShellProps {
  data: BrainliftData;
  slug: string;
  onPreview: () => void;
  editingAuthor: boolean;
  setEditingAuthor: (editing: boolean) => void;
  authorInput: string;
  setAuthorInput: (input: string) => void;
  onUpdateAuthor: (author: string) => void;
}

export function BuilderShell({
  data,
  slug,
  onPreview,
  editingAuthor,
  setEditingAuthor,
  authorInput,
  setAuthorInput,
  onUpdateAuthor,
}: BuilderShellProps) {
  const searchString = useSearch();

  const activePhase = useMemo(() => {
    const params = new URLSearchParams(searchString);
    const phase = parseInt(params.get('phase') || '1', 10);
    return phase >= 1 && phase <= BUILDER_PHASES.length ? phase : 1;
  }, [searchString]);

  const setActivePhase = useCallback((phase: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('phase', String(phase));
    const newUrl = `?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <header className="shrink-0 border-b border-border bg-card">
        <div className="px-5 py-4 sm:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <button
                onClick={onPreview}
                className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft size={14} />
                Back to BrainLift
              </button>

              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">
                  Builder Workspace
                </div>
                <h1 className="mt-1 text-[28px] font-bold tracking-tight leading-tight truncate">
                  {data.title}
                </h1>
                <div
                  className={`mt-1 flex items-center gap-1 text-[13px] ${editingAuthor ? 'cursor-text' : 'cursor-pointer'}`}
                  onClick={() => {
                    if (!editingAuthor) {
                      setAuthorInput(data.author || '');
                      setEditingAuthor(true);
                    }
                  }}
                >
                  <span className="text-muted-foreground">By</span>
                  {editingAuthor ? (
                    <input
                      type="text"
                      value={authorInput}
                      onChange={(e) => setAuthorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && authorInput.trim()) {
                          onUpdateAuthor(authorInput.trim());
                        }
                        if (e.key === 'Escape') {
                          setEditingAuthor(false);
                        }
                      }}
                      onBlur={() => {
                        if (authorInput.trim()) {
                          onUpdateAuthor(authorInput.trim());
                        } else {
                          setEditingAuthor(false);
                        }
                      }}
                      autoFocus
                      placeholder="Enter name..."
                      className="border-none border-b border-b-border bg-transparent py-0.5 px-0 text-[13px] w-[170px] outline-none text-foreground"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      className={
                        data.author
                          ? 'text-muted-foreground'
                          : 'text-gray-400 italic border-b border-dashed border-border pb-px'
                      }
                    >
                      {data.author || 'Set Owner Name...'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 lg:justify-end">
              <span className="hidden text-[12px] text-muted-foreground md:inline">
                Focused authoring mode. Your changes save inside each phase.
              </span>
              <TactileButton
                variant="inset"
                onClick={onPreview}
                className="inline-flex items-center gap-2 px-4 py-2"
              >
                <Eye size={14} />
                Preview
              </TactileButton>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-sidebar lg:block">
          <div className="px-5 py-6">
            <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-4">
              Build Phases
            </div>
            <div className="space-y-2">
              {BUILDER_PHASES.map((phase) => {
                const isActive = activePhase === phase.id;
                return (
                  <button
                    key={phase.id}
                    onClick={() => setActivePhase(phase.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                      isActive
                        ? 'border-primary/30 bg-primary/10'
                        : 'border-transparent bg-transparent hover:border-border hover:bg-background/70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {phase.id}
                      </span>
                      <span className="min-w-0">
                        <span className={`block text-[14px] font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {phase.label}
                        </span>
                        {phase.dok && (
                          <span className="mt-0.5 block text-[11px] uppercase tracking-[0.12em] text-muted-foreground/70">
                            {phase.dok}
                          </span>
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="border-b border-border bg-card lg:hidden">
            <div className="flex gap-2 overflow-x-auto px-4 py-3 sm:px-6">
              {BUILDER_PHASES.map((phase) => {
                const isActive = activePhase === phase.id;
                return (
                  <button
                    key={phase.id}
                    onClick={() => setActivePhase(phase.id)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                      isActive
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground'
                    }`}
                  >
                    {phase.id}. {phase.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mx-auto max-w-6xl px-5 py-6 sm:px-7 sm:py-8">
            <BuilderView
              data={data}
              slug={slug}
              activePhase={activePhase}
              onPhaseChange={setActivePhase}
              showPhaseSidebar={false}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
