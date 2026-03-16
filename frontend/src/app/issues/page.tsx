'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useI18n } from '@/i18n/useI18n';
import {
  ActivityEvent,
  Comment,
  Doc,
  Epic,
  Issue,
  IssueRelation,
  Project,
  Sprint,
  Team,
  getActivityEvents,
  getComments,
  getDocs,
  getEpics,
  getIssueRelations,
  getIssues,
  getProjects,
  getSprints,
  getTeams,
} from '@/lib/api';

type IssueFilterState = {
  type: string;
  projectId: string;
  epicId: string;
  sprintId: string;
  state: string;
  priority: string;
};

const defaultFilters: IssueFilterState = {
  type: 'ALL',
  projectId: '',
  epicId: '',
  sprintId: '',
  state: '',
  priority: '',
};

export default function IssuesPage() {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [filters, setFilters] = useState<IssueFilterState>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailComments, setDetailComments] = useState<Comment[]>([]);
  const [detailDocs, setDetailDocs] = useState<Doc[]>([]);
  const [detailActivity, setDetailActivity] = useState<ActivityEvent[]>([]);
  const [detailRelations, setDetailRelations] = useState<IssueRelation[]>([]);

  useEffect(() => {
    void Promise.all([getIssues(), getProjects(), getEpics(), getSprints(), getTeams()])
      .then(([issueList, projectList, epicList, sprintList, teamList]) => {
        setIssues(issueList);
        setProjects(projectList);
        setEpics(epicList);
        setSprints(sprintList);
        setTeams(teamList);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type) {
      setFilters((current) => ({ ...current, type }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedIssue) return;
    setDetailLoading(true);
    void Promise.all([
      getComments({ issueId: selectedIssue.id }),
      getDocs({ issueId: selectedIssue.id }),
      getActivityEvents({ entityType: 'ISSUE', entityId: selectedIssue.id }),
      getIssueRelations(selectedIssue.id),
    ])
      .then(([comments, docs, activity, relations]) => {
        setDetailComments(comments);
        setDetailDocs(docs);
        setDetailActivity(activity);
        setDetailRelations(relations);
      })
      .finally(() => setDetailLoading(false));
  }, [selectedIssue]);

  const filteredIssues = useMemo(
    () =>
      issues.filter((issue) => {
        if (filters.type !== 'ALL' && issue.type !== filters.type) return false;
        if (filters.projectId && issue.projectId !== Number(filters.projectId)) return false;
        if (filters.epicId && issue.epicId !== Number(filters.epicId)) return false;
        if (filters.sprintId && issue.sprintId !== Number(filters.sprintId)) return false;
        if (filters.state && issue.state !== filters.state) return false;
        if (filters.priority && issue.priority !== filters.priority) return false;
        return true;
      }),
    [filters, issues]
  );

  const metrics = useMemo(
    () => [
      { label: t('issues.metrics.total'), value: filteredIssues.length },
      { label: t('issues.metrics.inProgress'), value: filteredIssues.filter((item) => item.state === 'IN_PROGRESS').length },
      { label: t('issues.metrics.inReview'), value: filteredIssues.filter((item) => item.state === 'IN_REVIEW').length },
      { label: t('issues.metrics.done'), value: filteredIssues.filter((item) => item.state === 'DONE').length },
    ],
    [filteredIssues, t]
  );

  const stateOptions = useMemo(
    () => [
      { value: '', label: t('issues.filters.allStates') },
      ...['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELED'].map((value) => ({
        value,
        label: t(`common.status.${value}`),
      })),
    ],
    [t]
  );

  const priorityOptions = useMemo(
    () => [
      { value: '', label: t('issues.filters.allPriorities') },
      ...['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((value) => ({
        value,
        label: t(`common.priority.${value}`),
      })),
    ],
    [t]
  );

  const drawerText =
    locale === 'en'
      ? {
          close: 'Close',
          overview: 'Overview',
          comments: 'Comments',
          activity: 'Activity',
          docs: 'Docs',
          relations: 'Relations',
          plannedRange: 'Planned range',
          estimate: 'Estimate',
          progress: 'Progress',
          source: 'Source',
          emptyComments: 'No comments for this issue.',
          emptyActivity: 'No activity for this issue.',
          emptyDocs: 'No docs linked to this issue.',
          emptyRelations: 'No relations linked to this issue.',
          note: 'Use Projects and Views to narrow the same execution objects.',
        }
      : {
          close: '关闭',
          overview: '概览',
          comments: '评论',
          activity: '活动',
          docs: '文档',
          relations: '关系',
          plannedRange: '计划周期',
          estimate: '工时估算',
          progress: '进度',
          source: '来源',
          emptyComments: '当前事项还没有评论。',
          emptyActivity: '当前事项还没有活动记录。',
          emptyDocs: '当前事项还没有关联文档。',
          emptyRelations: '当前事项还没有关系项。',
          note: '通过 Projects 和 Views 在同一批执行对象上切换上下文。',
        };

  const getProjectName = (projectId: number) => projects.find((item) => item.id === projectId)?.name ?? `#${projectId}`;
  const getEpicName = (epicId: number | null) => (epicId ? epics.find((item) => item.id === epicId)?.title ?? `#${epicId}` : t('common.notSet'));
  const getSprintName = (sprintId: number | null) => (sprintId ? sprints.find((item) => item.id === sprintId)?.name ?? `#${sprintId}` : t('common.notSet'));
  const getTeamName = (teamId: number | null) => (teamId ? teams.find((item) => item.id === teamId)?.name ?? `#${teamId}` : t('common.notSet'));

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader title={t('issues.title')} subtitle={t('issues.subtitle')} />

        <div className="grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>

        <section className="panel-card p-5">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <SelectField
              label={t('issues.filters.type')}
              value={filters.type}
              onChange={(value) => setFilters((current) => ({ ...current, type: value }))}
              options={[
                { value: 'ALL', label: t('issues.filters.allTypes') },
                { value: 'FEATURE', label: t('issues.type.FEATURE') },
                { value: 'TASK', label: t('issues.type.TASK') },
                { value: 'BUG', label: t('issues.type.BUG') },
                { value: 'TECH_DEBT', label: t('issues.type.TECH_DEBT') },
              ]}
            />
            <SelectField
              label={t('issues.filters.project')}
              value={filters.projectId}
              onChange={(value) => setFilters((current) => ({ ...current, projectId: value }))}
              options={[{ value: '', label: t('issues.filters.allProjects') }, ...projects.map((item) => ({ value: String(item.id), label: item.name }))]}
            />
            <SelectField
              label={t('issues.filters.epic')}
              value={filters.epicId}
              onChange={(value) => setFilters((current) => ({ ...current, epicId: value }))}
              options={[{ value: '', label: t('issues.filters.allEpics') }, ...epics.map((item) => ({ value: String(item.id), label: item.title }))]}
            />
            <SelectField
              label={t('issues.filters.sprint')}
              value={filters.sprintId}
              onChange={(value) => setFilters((current) => ({ ...current, sprintId: value }))}
              options={[{ value: '', label: t('issues.filters.allSprints') }, ...sprints.map((item) => ({ value: String(item.id), label: item.name }))]}
            />
            <SelectField
              label={t('issues.filters.state')}
              value={filters.state}
              onChange={(value) => setFilters((current) => ({ ...current, state: value }))}
              options={stateOptions}
            />
            <SelectField
              label={t('issues.filters.priority')}
              value={filters.priority}
              onChange={(value) => setFilters((current) => ({ ...current, priority: value }))}
              options={priorityOptions}
            />
          </div>
        </section>

        <section className="panel-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-soft">
              <tr className="text-left text-sm text-ink-700">
                <th className="px-5 py-4">{t('issues.columns.title')}</th>
                <th className="px-5 py-4">{t('issues.columns.type')}</th>
                <th className="px-5 py-4">{t('issues.columns.project')}</th>
                <th className="px-5 py-4">{t('issues.columns.epic')}</th>
                <th className="px-5 py-4">{t('issues.columns.sprint')}</th>
                <th className="px-5 py-4">{t('issues.columns.state')}</th>
                <th className="px-5 py-4">{t('issues.columns.priority')}</th>
                <th className="px-5 py-4">{t('issues.columns.team')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {!loading &&
                filteredIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="cursor-pointer hover:bg-slate-50/70"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-ink-900">{issue.title}</div>
                      <div className="mt-1 text-xs text-ink-400">{issue.identifier}</div>
                    </td>
                    <td className="px-5 py-4">{t(`issues.type.${issue.type}`)}</td>
                    <td className="px-5 py-4">{getProjectName(issue.projectId)}</td>
                    <td className="px-5 py-4">{getEpicName(issue.epicId)}</td>
                    <td className="px-5 py-4">{getSprintName(issue.sprintId)}</td>
                    <td className="px-5 py-4">{t(`common.status.${issue.state}`)}</td>
                    <td className="px-5 py-4">{t(`common.priority.${issue.priority}`)}</td>
                    <td className="px-5 py-4">{getTeamName(issue.teamId)}</td>
                  </tr>
                ))}
              {!loading && filteredIssues.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center text-ink-400">
                    {t('issues.empty')}
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center text-ink-400">
                    {t('common.loading')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <div className="text-xs text-ink-400">{drawerText.note}</div>
      </div>

      {selectedIssue && (
        <IssueDrawer
          issue={selectedIssue}
          loading={detailLoading}
          comments={detailComments}
          docs={detailDocs}
          activity={detailActivity}
          relations={detailRelations}
          locale={locale}
          drawerText={drawerText}
          getProjectName={getProjectName}
          getEpicName={getEpicName}
          getSprintName={getSprintName}
          getTeamName={getTeamName}
          translate={t}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </AppLayout>
  );
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-ink-900">{title}</h1>
      <p className="mt-2 text-sm text-ink-700">{subtitle}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel-card p-5">
      <div className="text-sm text-ink-700">{label}</div>
      <div className="mt-3 text-3xl font-semibold text-ink-900">{value}</div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-ink-700">{label}</div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="control-surface w-full px-3 py-2.5 text-sm"
      >
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function IssueDrawer({
  issue,
  loading,
  comments,
  docs,
  activity,
  relations,
  locale,
  drawerText,
  getProjectName,
  getEpicName,
  getSprintName,
  getTeamName,
  translate,
  onClose,
}: {
  issue: Issue;
  loading: boolean;
  comments: Comment[];
  docs: Doc[];
  activity: ActivityEvent[];
  relations: IssueRelation[];
  locale: string;
  drawerText: Record<string, string>;
  getProjectName: (projectId: number) => string;
  getEpicName: (epicId: number | null) => string;
  getSprintName: (sprintId: number | null) => string;
  getTeamName: (teamId: number | null) => string;
  translate: (path: string, variables?: Record<string, string | number>) => string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-surface-overlay backdrop-blur-sm">
      <div className="h-full w-full max-w-2xl overflow-y-auto border-l border-border-subtle bg-white shadow-elevated">
        <div className="sticky top-0 z-10 border-b border-border-subtle bg-white/95 px-6 py-5 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-ink-400">{issue.identifier}</div>
              <h2 className="mt-2 text-2xl font-semibold text-ink-900">{issue.title}</h2>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-ink-700">
                <span className="rounded-full bg-surface-soft px-2.5 py-1">{translate(`issues.type.${issue.type}`)}</span>
                <span className="rounded-full bg-surface-soft px-2.5 py-1">{translate(`common.status.${issue.state}`)}</span>
                <span className="rounded-full bg-surface-soft px-2.5 py-1">{translate(`common.priority.${issue.priority}`)}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-card border border-border-soft px-3 py-2 text-sm text-ink-700 hover:bg-slate-50"
            >
              {drawerText.close}
            </button>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          <section className="subtle-card p-5">
            <h3 className="text-sm font-semibold text-ink-900">{drawerText.overview}</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <MetaCard label={translate('issues.columns.project')} value={getProjectName(issue.projectId)} />
              <MetaCard label={translate('issues.columns.epic')} value={getEpicName(issue.epicId)} />
              <MetaCard label={translate('issues.columns.sprint')} value={getSprintName(issue.sprintId)} />
              <MetaCard label={translate('issues.columns.team')} value={getTeamName(issue.teamId)} />
              <MetaCard
                label={drawerText.plannedRange}
                value={
                  issue.plannedStartDate || issue.plannedEndDate
                    ? `${issue.plannedStartDate ?? '-'} - ${issue.plannedEndDate ?? '-'}`
                    : translate('common.notSet')
                }
              />
              <MetaCard label={drawerText.progress} value={`${issue.progress}%`} />
              <MetaCard label={drawerText.estimate} value={`${issue.actualHours} / ${issue.estimatedHours} h`} />
              <MetaCard label={drawerText.source} value={issue.sourceType} />
            </div>
            {issue.description && (
              <div className="mt-4 rounded-card border border-border-soft bg-white px-4 py-3 text-sm text-ink-700">
                {issue.description}
              </div>
            )}
          </section>

          <SectionCard title={drawerText.comments}>
            {loading ? (
              <EmptyState label={translate('common.loading')} />
            ) : comments.length === 0 ? (
              <EmptyState label={drawerText.emptyComments} />
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="rounded-card border border-slate-100 bg-surface-soft px-4 py-3">
                    <div className="text-sm text-ink-700">{comment.body}</div>
                    <div className="mt-2 text-xs text-ink-400">
                      #{comment.authorId} · {new Date(comment.createdAt).toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title={drawerText.activity}>
            {loading ? (
              <EmptyState label={translate('common.loading')} />
            ) : activity.length === 0 ? (
              <EmptyState label={drawerText.emptyActivity} />
            ) : (
              <div className="space-y-3">
                {activity.map((event) => (
                  <div key={event.id} className="rounded-card border border-slate-100 bg-surface-soft px-4 py-3">
                    <div className="text-sm font-medium text-ink-900">{event.summary}</div>
                    <div className="mt-1 text-xs text-ink-700">
                      {event.actionType} · {new Date(event.createdAt).toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title={drawerText.docs}>
            {loading ? (
              <EmptyState label={translate('common.loading')} />
            ) : docs.length === 0 ? (
              <EmptyState label={drawerText.emptyDocs} />
            ) : (
              <div className="space-y-3">
                {docs.map((doc) => (
                  <div key={doc.id} className="rounded-card border border-slate-100 bg-surface-soft px-4 py-3">
                    <div className="text-sm font-medium text-ink-900">{doc.title}</div>
                    <div className="mt-1 text-xs text-ink-700">{doc.slug}</div>
                    {doc.currentRevision?.content && (
                      <div className="mt-2 text-sm text-ink-700">{doc.currentRevision.content}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title={drawerText.relations}>
            {loading ? (
              <EmptyState label={translate('common.loading')} />
            ) : relations.length === 0 ? (
              <EmptyState label={drawerText.emptyRelations} />
            ) : (
              <div className="space-y-3">
                {relations.map((relation) => (
                  <div key={relation.id} className="rounded-card border border-slate-100 bg-surface-soft px-4 py-3 text-sm text-ink-700">
                    <div className="font-medium text-ink-900">{relation.relationType}</div>
                    <div className="mt-1 text-xs text-ink-700">
                      {relation.fromIssueId} → {relation.toIssueId}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel-card">
      <div className="border-b border-border-subtle px-5 py-4 text-sm font-semibold text-ink-900">{title}</div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-border-soft bg-white px-4 py-3">
      <div className="meta-label">{label}</div>
      <div className="mt-2 text-sm font-medium text-ink-900">{value}</div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="text-sm text-ink-400">{label}</div>;
}
