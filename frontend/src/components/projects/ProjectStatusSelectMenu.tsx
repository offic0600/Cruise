'use client';

import { Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PROJECT_STATUS_OPTIONS, type ProjectComposerStatus, projectStatusIcon, projectStatusLabelKey } from './project-composer-utils';

export function ProjectStatusSelectMenu({
  value,
  query,
  onQueryChange,
  onSelect,
  placeholder,
  shortcut,
  t,
}: {
  value: ProjectComposerStatus;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (value: ProjectComposerStatus) => void | Promise<void>;
  placeholder: string;
  shortcut: string;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = PROJECT_STATUS_OPTIONS.filter((status) =>
    t(projectStatusLabelKey(status)).toLowerCase().includes(normalizedQuery)
  );

  return (
    <>
      <div className="border-b border-border-soft px-4 py-3">
        <div className="flex items-center gap-3">
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            className="h-auto border-0 bg-transparent px-0 py-0 text-[16px] shadow-none focus-visible:ring-0"
          />
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-border-soft bg-white px-1.5 text-[12px] font-medium text-ink-400">
            {shortcut}
          </span>
        </div>
      </div>
      <div className="px-1 py-1.5">
        {filtered.map((status, index) => (
          <button
            key={status}
            type="button"
            onClick={() => void onSelect(status)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[15px] text-ink-700 transition hover:bg-slate-100"
          >
            <span className="flex w-4 justify-center">{projectStatusIcon(status)}</span>
            <span className="truncate">{t(projectStatusLabelKey(status))}</span>
            <span className="ml-auto flex items-center gap-2 text-sm text-ink-500">
              <span className="inline-flex w-4 justify-center">{value === status ? <Check className="h-4 w-4 text-ink-700" /> : null}</span>
              <span>{index + 1}</span>
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
