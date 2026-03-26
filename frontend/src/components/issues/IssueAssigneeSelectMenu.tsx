'use client';

import { Check, UserCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getIssueInitials } from './issues-list-utils';

type IssueMenuMember = {
  id: number | string;
  name: string;
};

export function IssueAssigneeSelectMenu({
  value,
  members,
  currentUser,
  query,
  onQueryChange,
  onSelect,
  placeholder,
  shortcut,
  t,
}: {
  value: number | null;
  members: IssueMenuMember[];
  currentUser?: IssueMenuMember | null;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (assigneeId: number | null) => void | Promise<void>;
  placeholder: string;
  shortcut: string;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  const normalizedQuery = query.trim().toLowerCase();
  const filteredMembers = (normalizedQuery
    ? members.filter((member) => member.name.toLowerCase().includes(normalizedQuery))
    : members).filter((member) => String(member.id) !== String(currentUser?.id ?? ''));
  const currentUserVisible =
    currentUser &&
    (!normalizedQuery || currentUser.name.toLowerCase().includes(normalizedQuery));

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
        <button
          type="button"
          onClick={() => void onSelect(null)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[15px] text-ink-700 transition hover:bg-slate-100"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center text-ink-400">
            <UserCircle2 className="h-4 w-4" />
          </span>
          <span className="truncate">{t('views.new.preview.noAssignee')}</span>
          <span className="ml-auto flex items-center gap-2 text-sm text-ink-500">
            <span className="inline-flex w-4 justify-center">
              {value == null ? <Check className="h-4 w-4 text-ink-700" /> : null}
            </span>
            <span>0</span>
          </span>
        </button>
        {currentUserVisible ? (
          <button
            type="button"
            onClick={() => void onSelect(Number(currentUser.id))}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[15px] text-ink-700 transition hover:bg-slate-100"
          >
            <AssigneeAvatar name={currentUser.name} />
            <span className="truncate">{currentUser.name}</span>
            <span className="ml-auto flex items-center gap-2 text-sm text-ink-500">
              <span className="inline-flex w-4 justify-center">
                {String(value ?? '') === String(currentUser.id) ? <Check className="h-4 w-4 text-ink-700" /> : null}
              </span>
              <span>1</span>
            </span>
          </button>
        ) : null}
        {filteredMembers.length ? (
          <div className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-[0.08em] text-ink-400">
            {t('views.new.preview.teamMembers')}
          </div>
        ) : null}
        {filteredMembers.map((member, index) => (
          <button
            key={member.id}
            type="button"
            onClick={() => void onSelect(Number(member.id))}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[15px] text-ink-700 transition hover:bg-slate-100"
          >
            <AssigneeAvatar name={member.name} />
            <span className="truncate">{member.name}</span>
            <span className="ml-auto flex items-center gap-2 text-sm text-ink-500">
              <span className="inline-flex w-4 justify-center">
                {String(value ?? '') === String(member.id) ? <Check className="h-4 w-4 text-ink-700" /> : null}
              </span>
              <span>{index + (currentUserVisible ? 2 : 1)}</span>
            </span>
          </button>
        ))}
        {!filteredMembers.length && !currentUserVisible ? (
          <div className="px-3 py-4 text-sm text-ink-400">{t('issues.detailSidebar.noAssigneeResults')}</div>
        ) : null}
      </div>
    </>
  );
}

function AssigneeAvatar({ name }: { name: string }) {
  return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-rose-100 bg-rose-100 text-[10px] font-semibold uppercase text-rose-600">
      {getIssueInitials(name)}
    </span>
  );
}
