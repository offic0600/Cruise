import type { Issue, IssueDraft, IssueTemplate, Project, Team } from '@/lib/api';
import { parseLegacyPayload, stringifyLegacyPayload } from '@/lib/api';

export type IssueComposerDraft = {
  templateId: string;
  title: string;
  description: string;
  type: Issue['type'];
  state: Issue['state'];
  priority: Issue['priority'];
  teamId: string;
  projectId: string;
  assigneeId: string;
  parentIssueId: string;
  estimatePoints: string;
  plannedStartDate: string;
  plannedEndDate: string;
  labelIds: string[];
  linksText: string;
  customFields: Record<string, unknown>;
};

export const ISSUE_TYPES: Issue['type'][] = ['TASK', 'FEATURE', 'BUG', 'TECH_DEBT'];
export const ISSUE_STATES: Issue['state'][] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELED'];
export const ISSUE_PRIORITIES: Issue['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export function createEmptyIssueComposerDraft(
  projects: Project[],
  params?: Partial<IssueComposerDraft>
): IssueComposerDraft {
  return {
    templateId: '',
    title: '',
    description: '',
    type: 'TASK',
    state: 'TODO',
    priority: 'MEDIUM',
    teamId: '',
    projectId: projects[0] ? String(projects[0].id) : '',
    assigneeId: '',
    parentIssueId: '',
    estimatePoints: '',
    plannedStartDate: '',
    plannedEndDate: '',
    labelIds: [],
    linksText: '',
    customFields: {},
    ...params,
  };
}

export function applyTemplateToDraft(
  draft: IssueComposerDraft,
  template: IssueTemplate | undefined | null
): IssueComposerDraft {
  if (!template) return draft;
  return {
    ...draft,
    templateId: String(template.id),
    title: template.title ?? draft.title,
    description: template.description ?? draft.description,
    type: template.type,
    state: template.state ?? draft.state,
    priority: template.priority ?? draft.priority,
    teamId: template.teamId ? String(template.teamId) : draft.teamId,
    projectId: template.projectId ? String(template.projectId) : draft.projectId,
    assigneeId: template.assigneeId ? String(template.assigneeId) : draft.assigneeId,
    estimatePoints: template.estimatePoints != null ? String(template.estimatePoints) : draft.estimatePoints,
    plannedStartDate: template.plannedStartDate ?? draft.plannedStartDate,
    plannedEndDate: template.plannedEndDate ?? draft.plannedEndDate,
    labelIds: template.labelIds.map(String),
    customFields: { ...draft.customFields, ...template.customFields },
  };
}

export function applySavedDraftToComposer(
  current: IssueComposerDraft,
  draft: IssueDraft | null | undefined
): IssueComposerDraft {
  if (!draft) return current;
  const legacy = parseLegacyPayload(draft.legacyPayload);
  return {
    ...current,
    templateId: draft.templateId ? String(draft.templateId) : current.templateId,
    title: draft.title ?? current.title,
    description: draft.description ?? current.description,
    type: draft.type,
    state: (draft.state as Issue['state'] | null) ?? current.state,
    priority: (draft.priority as Issue['priority'] | null) ?? current.priority,
    teamId: draft.teamId ? String(draft.teamId) : current.teamId,
    projectId: draft.projectId ? String(draft.projectId) : current.projectId,
    assigneeId: draft.assigneeId ? String(draft.assigneeId) : current.assigneeId,
    parentIssueId: draft.parentIssueId ? String(draft.parentIssueId) : current.parentIssueId,
    estimatePoints: draft.estimatePoints != null ? String(draft.estimatePoints) : current.estimatePoints,
    plannedStartDate: draft.plannedStartDate ?? current.plannedStartDate,
    plannedEndDate: draft.plannedEndDate ?? current.plannedEndDate,
    labelIds: draft.labelIds.map(String),
    linksText: Array.isArray(legacy.links) ? legacy.links.join('\n') : current.linksText,
    customFields: { ...current.customFields, ...draft.customFields },
  };
}

export function parseIssueCreateParams(
  searchParams: URLSearchParams,
  projects: Project[],
  templates: IssueTemplate[]
): IssueComposerDraft {
  let draft = createEmptyIssueComposerDraft(projects, {
    title: searchParams.get('title') ?? '',
    description: searchParams.get('description') ?? '',
    type: ((searchParams.get('type') ?? 'TASK').toUpperCase() as Issue['type']) ?? 'TASK',
    state: ((searchParams.get('state') ?? 'TODO').toUpperCase() as Issue['state']) ?? 'TODO',
    priority: ((searchParams.get('priority') ?? 'MEDIUM').toUpperCase() as Issue['priority']) ?? 'MEDIUM',
    projectId: searchParams.get('projectId') ?? (projects[0] ? String(projects[0].id) : ''),
    teamId: searchParams.get('teamId') ?? '',
    assigneeId: searchParams.get('assigneeId') ?? '',
    parentIssueId: searchParams.get('parentIssueId') ?? '',
    estimatePoints: searchParams.get('estimatePoints') ?? '',
    plannedStartDate: searchParams.get('plannedStartDate') ?? '',
    plannedEndDate: searchParams.get('plannedEndDate') ?? '',
    templateId: searchParams.get('templateId') ?? '',
  });
  const templateId = searchParams.get('templateId');
  if (templateId) {
    draft = applyTemplateToDraft(draft, templates.find((item) => String(item.id) === templateId));
  }
  return draft;
}

export function serializeDraftToQuery(draft: IssueComposerDraft): string {
  const params = new URLSearchParams();
  setIfPresent(params, 'title', draft.title);
  setIfPresent(params, 'description', draft.description);
  setIfPresent(params, 'type', draft.type);
  setIfPresent(params, 'state', draft.state);
  setIfPresent(params, 'priority', draft.priority);
  setIfPresent(params, 'projectId', draft.projectId);
  setIfPresent(params, 'teamId', draft.teamId);
  setIfPresent(params, 'assigneeId', draft.assigneeId);
  setIfPresent(params, 'parentIssueId', draft.parentIssueId);
  setIfPresent(params, 'estimatePoints', draft.estimatePoints);
  setIfPresent(params, 'plannedStartDate', draft.plannedStartDate);
  setIfPresent(params, 'plannedEndDate', draft.plannedEndDate);
  setIfPresent(params, 'templateId', draft.templateId);
  return params.toString();
}

export function buildLegacyPayloadFromDraft(draft: IssueComposerDraft, existingPayload?: string | null) {
  const payload = parseLegacyPayload(existingPayload);
  const links = draft.linksText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return stringifyLegacyPayload({
    ...payload,
    links,
  });
}

export function localDraftStorageKey(userId: number | undefined, localeScope: string) {
  return `issue-composer:${userId ?? 'anonymous'}:${localeScope}`;
}

export function teamLabel(teamId: number | null | undefined, teams: Team[]) {
  return teams.find((item) => item.id === teamId)?.name ?? '';
}

function setIfPresent(params: URLSearchParams, key: string, value: string) {
  if (value.trim()) params.set(key, value.trim());
}
