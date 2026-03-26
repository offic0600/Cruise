'use client';

import { Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  ISSUE_PRIORITY_ORDER,
  NO_PRIORITY_VALUE,
  issuePriorityIcon,
  issuePriorityLabelKey,
} from './issues-list-utils';
import type { Issue } from '@/lib/api/types';

export function IssuePrioritySelectMenu({
  value,
  query,
  onQueryChange,
  onSelect,
  placeholder,
  shortcut,
  t,
}: {
  value: Issue['priority'];
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (value: Issue['priority']) => void | Promise<void>;
  placeholder: string;
  shortcut: string;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = [NO_PRIORITY_VALUE, ...ISSUE_PRIORITY_ORDER].filter((priority) => {
    const label =
      priority === NO_PRIORITY_VALUE
        ? t('views.new.preview.noPriority')
        : t(issuePriorityLabelKey(priority) ?? 'views.new.preview.noPriority');
    return label.toLowerCase().includes(normalizedQuery);
  });

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
        {filteredOptions.map((priority, index) => {
          const selected = priority === NO_PRIORITY_VALUE ? value == null : value === priority;
          return (
            <button
              key={priority}
              type="button"
              onClick={() => void onSelect(priority === NO_PRIORITY_VALUE ? null : priority)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[15px] text-ink-700 transition hover:bg-slate-100"
            >
              <span className="flex w-4 justify-center">
                {priority === NO_PRIORITY_VALUE ? issuePriorityIcon(null) : issuePriorityIcon(priority)}
              </span>
              <span className="truncate">
                {priority === NO_PRIORITY_VALUE
                  ? t('views.new.preview.noPriority')
                  : t(issuePriorityLabelKey(priority) ?? 'views.new.preview.noPriority')}
              </span>
              <span className="ml-auto flex items-center gap-2 text-sm text-ink-500">
                <span className="inline-flex w-4 justify-center">
                  {selected ? <Check className="h-4 w-4 text-ink-700" /> : null}
                </span>
                <span>{index}</span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
