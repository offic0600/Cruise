'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { localizePath } from '@/i18n/config';
import { useI18n } from '@/i18n/useI18n';
import type { Issue, Project, View } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { useViewsWorkspace } from '@/lib/query/views';

type ParsedViewFilter = {
  scope?: string;
  stateCategory?: string[];
  priority?: string[];
  state?: string[];
};

export default function ViewsPage() {
  const { locale, t } = useI18n();
  const user = getStoredUser();
  const [q, setQ] = useState('');
  const { issuesQuery, projectsQuery, viewsQuery } = useViewsWorkspace();

  const issues = (issuesQuery.data ?? []) as Issue[];
  const projects = (projectsQuery.data ?? []) as Project[];
  const views = (viewsQuery.data ?? []) as View[];
  const [activeViewId, setActiveViewId] = useState<number | null>(views[0]?.id ?? null);

  useEffect(() => {
    if (activeViewId == null && views.length) {
      setActiveViewId(views[0].id);
    }
  }, [activeViewId, views]);

  const activeView = useMemo(
    () => views.find((view) => view.id === activeViewId) ?? views[0] ?? null,
    [activeViewId, views]
  );

  const filteredIssues = useMemo(() => {
    const scoped = issues.filter((issue) => {
      if (!q) return true;
      const keyword = q.toLowerCase();
      return issue.title.toLowerCase().includes(keyword) || issue.identifier.toLowerCase().includes(keyword);
    });

    if (!activeView?.filterJson) return scoped;

    const parsed = parseViewFilter(activeView.filterJson);
    return scoped.filter((issue) => {
      if (parsed.scope === 'me' && user?.id != null) {
        const isMine = issue.assigneeId === user.id || issue.reporterId === user.id;
        if (!isMine) return false;
      }
      if (parsed.stateCategory?.length && !parsed.stateCategory.includes(issue.stateCategory)) {
        return false;
      }
      if (parsed.priority?.length && !parsed.priority.includes(issue.priority)) {
        return false;
      }
      if (parsed.state?.length && !parsed.state.includes(issue.state)) {
        return false;
      }
      return true;
    });
  }, [activeView?.filterJson, issues, q, user?.id]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-ink-900">{t('views.title')}</h1>
          <p className="mt-2 text-sm text-ink-700">{t('views.subtitle')}</p>
        </div>

        <Card className="filter-bar">
          <CardContent className="p-0">
            <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder={t('views.searchPlaceholder')} />
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <section className="space-y-3">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveViewId(view.id)}
                className={`w-full rounded-panel border p-5 text-left transition ${
                  activeView?.id === view.id
                    ? 'border-ink-900 bg-ink-900 text-white shadow-nav'
                    : 'border-border-subtle bg-surface-raised text-ink-900 shadow-card hover:bg-slate-50'
                }`}
              >
                <div className="text-base font-semibold">{view.name}</div>
                <div className={`mt-2 text-sm ${activeView?.id === view.id ? 'text-slate-300' : 'text-ink-700'}`}>
                  {view.description ?? t('views.defaultDescription')}
                </div>
              </button>
            ))}
          </section>

          <Card className="section-panel">
            <CardHeader className="border-b border-border-subtle p-0 pb-4">
              <CardTitle>{activeView?.name ?? t('views.title')}</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 p-0">
              {filteredIssues.length ? (
                filteredIssues.map((item) => (
                  <Link
                    key={item.id}
                    href={localizePath(locale, `/issues/${item.id}`)}
                    className="grid gap-3 px-1 py-4 md:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
                  >
                    <div>
                      <div className="font-medium text-ink-900">{item.title}</div>
                      <div className="mt-1 text-xs text-ink-400">{item.identifier}</div>
                    </div>
                    <div className="text-sm text-ink-700">{projects.find((project) => project.id === item.projectId)?.name ?? `#${item.projectId}`}</div>
                    <div>
                      <Badge>{t(`common.status.${item.state}`)}</Badge>
                    </div>
                    <div className="text-sm text-ink-700">{new Date(item.updatedAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'zh-CN')}</div>
                  </Link>
                ))
              ) : (
                <div className="px-1 py-14 text-center text-ink-400">{t('views.empty')}</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function parseViewFilter(filterJson: string): ParsedViewFilter {
  try {
    const parsed = JSON.parse(filterJson) as ParsedViewFilter;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}
