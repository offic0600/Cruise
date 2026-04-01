'use client';

import { Check, ChevronDown, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Team } from '@/lib/api/types';

export function ProjectTeamPill({
  value,
  teams,
  query,
  onQueryChange,
  onSelect,
  t,
}: {
  value: number | null;
  teams: Team[];
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (teamId: number | null) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  const normalized = query.trim().toLowerCase();
  const filtered = normalized ? teams.filter((team) => team.name.toLowerCase().includes(normalized) || team.key.toLowerCase().includes(normalized)) : teams;
  const selected = teams.find((team) => team.id === value) ?? null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" className="h-10 rounded-full border border-border-soft bg-white px-4 text-sm font-medium text-ink-700 shadow-none hover:bg-slate-50">
          <Users className="mr-2 h-4 w-4 text-ink-400" />
          <span>{selected ? (selected.key || selected.name) : t('projects.composer.workspaceTeam')}</span>
          <ChevronDown className="ml-2 h-4 w-4 text-ink-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[260px] rounded-[20px] border-border-subtle p-0">
        <div className="border-b border-border-soft px-4 py-3">
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t('projects.composer.searchTeams')}
            className="h-auto border-0 bg-transparent px-0 py-0 text-[16px] shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="px-1 py-1.5">
          {filtered.map((team) => (
            <button
              key={team.id}
              type="button"
              onClick={() => onSelect(team.id)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[15px] text-ink-700 transition hover:bg-slate-100"
            >
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-sky-200 bg-sky-100 px-2 text-[11px] font-semibold text-sky-700">
                {team.key || team.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="truncate">{team.name}</span>
              <span className="ml-auto inline-flex w-4 justify-center">
                {team.id === value ? <Check className="h-4 w-4 text-ink-700" /> : null}
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
