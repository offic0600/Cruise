'use client';

import { Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  ISSUE_STATUS_MENU_OPTIONS,
  type IssueStatusMenuValue,
  issueStatusMenuIcon,
  issueStatusMenuLabelKey,
} from './issues-list-utils';

export function IssueStatusSelectMenu({
  value,
  query,
  onQueryChange,
  onSelect,
  placeholder,
  shortcut,
  t,
}: {
  value: IssueStatusMenuValue;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (value: IssueStatusMenuValue) => void | Promise<void>;
  placeholder: string;
  shortcut: string;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  const normalizedQuery = query.trim().toLowerCase();
  const filteredStatusOptions = ISSUE_STATUS_MENU_OPTIONS.filter((option) =>
    t(issueStatusMenuLabelKey(option.value)).toLowerCase().includes(normalizedQuery)
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
        {filteredStatusOptions.map((option, index) => (
          <button
            key={option.value}
            type="button"
            onClick={() => void onSelect(option.value)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[15px] text-ink-700 transition hover:bg-slate-100"
          >
            <span className="flex w-4 justify-center">{issueStatusMenuIcon(option.value)}</span>
            <span className="truncate">{t(issueStatusMenuLabelKey(option.value))}</span>
            <span className="ml-auto flex items-center gap-2 text-sm text-ink-500">
              <span className="inline-flex w-4 justify-center">{value === option.value ? <Check className="h-4 w-4 text-ink-700" /> : null}</span>
              <span>{index + 1}</span>
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
