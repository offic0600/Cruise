'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import type { Label } from '@/lib/api/types';

export function IssueLabelsSelectMenu({
  labels,
  labelCatalog,
  selectedLabelIds,
  teamId,
  onToggle,
  onCreateLabel,
  t,
}: {
  labels: Label[];
  labelCatalog?: { teamLabels: Label[]; workspaceLabels: Label[] };
  selectedLabelIds: Array<string | number>;
  teamId: number | null;
  onToggle: (labelId: number) => void;
  onCreateLabel: (scopeType: 'TEAM' | 'WORKSPACE', name: string) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState<'TEAM' | 'WORKSPACE' | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredLabels = normalizedQuery ? labels.filter((item) => item.name.toLowerCase().includes(normalizedQuery)) : labels;
  const selectedSet = new Set(selectedLabelIds.map((value) => String(value)));
  const frequentLabels = filteredLabels.filter((item) => selectedSet.has(String(item.id)));
  const teamLabels = (labelCatalog?.teamLabels ?? filteredLabels)
    .filter((item) => (!normalizedQuery || item.name.toLowerCase().includes(normalizedQuery)) && !selectedSet.has(String(item.id)));
  const workspaceLabels = (labelCatalog?.workspaceLabels ?? filteredLabels)
    .filter((item) => (!normalizedQuery || item.name.toLowerCase().includes(normalizedQuery)) && !selectedSet.has(String(item.id)));
  const canCreate = Boolean(normalizedQuery) && !labels.some((item) => item.name.toLowerCase() === normalizedQuery);

  const handleCreate = async (scopeType: 'TEAM' | 'WORKSPACE') => {
    const name = query.trim();
    if (!name) return;
    setCreating(scopeType);
    try {
      await onCreateLabel(scopeType, name);
      setQuery('');
    } finally {
      setCreating(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 border-b border-border-soft px-4 py-3">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('settings.composer.searchLabels')}
          className="h-auto border-0 bg-transparent px-0 py-0 text-[16px] shadow-none focus-visible:ring-0"
        />
        <span className="rounded-lg border border-border-soft px-2 py-1 text-xs font-medium text-ink-400">L</span>
      </div>

      <div className="max-h-80 overflow-y-auto py-2">
        {canCreate ? (
          <div className="space-y-1 px-2 pb-3">
            {teamId ? (
              <button
                type="button"
                onClick={() => void handleCreate('TEAM')}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] text-ink-800 transition hover:bg-slate-50"
                disabled={creating != null}
              >
                <span className="text-xl leading-none text-ink-500">+</span>
                <span>{t('settings.composer.createTeamLabel', { value: query.trim() })}</span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void handleCreate('WORKSPACE')}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] text-ink-800 transition hover:bg-slate-50"
              disabled={creating != null}
            >
              <span className="text-xl leading-none text-ink-500">+</span>
              <span>{t('settings.composer.createWorkspaceLabel', { value: query.trim() })}</span>
            </button>
          </div>
        ) : null}

        {labels.length ? (
          <>
            {frequentLabels.length ? (
              <>
                <div className="px-6 pb-2 text-sm font-medium text-ink-400">{t('settings.composer.frequentlyUsedLabels')}</div>
                <div className="space-y-1 px-2 pb-3">
                  {frequentLabels.map((tag) => (
                    <IssueLabelOption key={tag.id} tag={tag} selected={true} onToggle={onToggle} />
                  ))}
                </div>
              </>
            ) : null}

            {teamLabels.length ? (
              <>
                <div className="px-6 pb-2 text-sm font-medium text-ink-400">{t('settings.composer.teamLabels')}</div>
                <div className="space-y-1 px-2 pb-3">
                  {teamLabels.map((tag) => (
                    <IssueLabelOption key={tag.id} tag={tag} selected={false} onToggle={onToggle} />
                  ))}
                </div>
              </>
            ) : null}

            {workspaceLabels.length ? (
              <>
                <div className="px-6 pb-2 text-sm font-medium text-ink-400">{t('settings.composer.workspaceLabels')}</div>
                <div className="space-y-1 px-2">
                  {workspaceLabels.map((tag) => (
                    <IssueLabelOption key={tag.id} tag={tag} selected={false} onToggle={onToggle} />
                  ))}
                </div>
              </>
            ) : normalizedQuery && !canCreate ? (
              <div className="px-4 py-6 text-center text-sm text-ink-400">{t('settings.composer.noLabels')}</div>
            ) : null}
          </>
        ) : !canCreate ? (
          <div className="px-4 py-6 text-center text-sm text-ink-400">{t('settings.composer.noLabels')}</div>
        ) : null}
      </div>
    </>
  );
}

function IssueLabelOption({
  tag,
  selected,
  onToggle,
}: {
  tag: Label;
  selected: boolean;
  onToggle: (labelId: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(tag.id)}
      className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left text-[15px] text-ink-800 transition hover:bg-slate-50 ${selected ? 'bg-slate-100' : ''}`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-md border ${selected ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-border-soft bg-white text-transparent'}`}
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
          <path d="M6.4 11.2 3.6 8.4l-.8.8 3.6 3.6 6.8-6.8-.8-.8z" />
        </svg>
      </span>
      <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: tag.color ?? '#94a3b8' }} />
      <span className="truncate">{tag.name}</span>
    </button>
  );
}
