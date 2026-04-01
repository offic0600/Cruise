'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import type { Label } from '@/lib/api/types';

export function ProjectLabelsSelectMenu({
  labels,
  selectedLabelIds,
  onToggle,
  t,
}: {
  labels: Label[];
  selectedLabelIds: Array<string | number>;
  onToggle: (labelId: number) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery ? labels.filter((label) => label.name.toLowerCase().includes(normalizedQuery)) : labels;
  const selectedSet = new Set(selectedLabelIds.map((value) => String(value)));

  return (
    <>
      <div className="flex items-center gap-3 border-b border-border-soft px-4 py-3">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('projects.composer.searchLabels')}
          className="h-auto border-0 bg-transparent px-0 py-0 text-[16px] shadow-none focus-visible:ring-0"
        />
        <span className="rounded-lg border border-border-soft px-2 py-1 text-xs font-medium text-ink-400">L</span>
      </div>
      <div className="max-h-80 overflow-y-auto py-2">
        {filtered.length ? (
          <div className="space-y-1 px-2">
            {filtered.map((label) => {
              const selected = selectedSet.has(String(label.id));
              return (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => onToggle(label.id)}
                  className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left text-[15px] text-ink-800 transition hover:bg-slate-50 ${selected ? 'bg-slate-100' : ''}`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-md border ${selected ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-border-soft bg-white text-transparent'}`}
                  >
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                      <path d="M6.4 11.2 3.6 8.4l-.8.8 3.6 3.6 6.8-6.8-.8-.8z" />
                    </svg>
                  </span>
                  <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: label.color ?? '#94a3b8' }} />
                  <span className="truncate">{label.name}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-6 text-center text-sm text-ink-400">{t('projects.composer.noLabels')}</div>
        )}
      </div>
    </>
  );
}
