export interface Issue {
  id: number;
  organizationId: number;
  epicId: number | null;
  sprintId: number | null;
  identifier: string;
  type: 'FEATURE' | 'TASK' | 'BUG' | 'TECH_DEBT';
  title: string;
  description: string | null;
  state: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectId: number;
  teamId: number | null;
  parentIssueId: number | null;
  assigneeId: number | null;
  reporterId: number | null;
  estimatePoints: number | null;
  progress: number;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  estimatedHours: number;
  actualHours: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
  sourceType: string;
  sourceId: number | null;
  legacyPayload: string | null;
  customFields: Record<string, unknown>;
  customFieldDefinitions?: CustomFieldDefinition[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomFieldOption {
  id: number;
  value: string;
  label: string;
  color: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface CustomFieldDefinition {
  id: number;
  organizationId: number;
  entityType: 'ISSUE' | 'PROJECT' | 'EPIC' | 'SPRINT' | string;
  scopeType: 'GLOBAL' | 'TEAM' | 'PROJECT' | string;
  scopeId: number | null;
  key: string;
  name: string;
  description: string | null;
  dataType: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'DATE' | 'DATETIME' | 'SINGLE_SELECT' | 'MULTI_SELECT' | 'BOOLEAN' | 'USER' | 'TEAM' | 'URL' | string;
  required: boolean;
  multiple: boolean;
  isActive: boolean;
  isVisible: boolean;
  isFilterable: boolean;
  isSortable: boolean;
  showOnCreate: boolean;
  showOnDetail: boolean;
  showOnList: boolean;
  sortOrder: number;
  config: Record<string, unknown>;
  options: CustomFieldOption[];
  createdAt: string;
  updatedAt: string;
}

export interface ImportFieldMappingTemplate {
  id: number;
  organizationId: number;
  entityType: string;
  name: string;
  sourceType: 'EXCEL' | 'CSV' | string;
  mapping: Record<string, unknown>;
  isDefault: boolean;
  createdAt: string;
}

type JsonRecord = Record<string, unknown>;

export interface FeatureIssue extends Issue {
  type: 'FEATURE';
  expectedDeliveryDate: string | null;
  requirementOwnerId: number | null;
  productOwnerId: number | null;
  devOwnerId: number | null;
  devParticipants: string | null;
  testOwnerId: number | null;
  tags: string | null;
  estimatedDays: number | null;
  plannedDays: number | null;
  gapDays: number | null;
  gapBudget: number | null;
  actualDays: number | null;
  applicationCodes: string | null;
  vendors: string | null;
  vendorStaff: string | null;
  createdBy: string | null;
}

export interface TaskIssue extends Issue {
  type: 'TASK';
  requirementId: number | null;
  estimatedDays: number | null;
  plannedDays: number | null;
  remainingDays: number | null;
}

export interface BugIssue extends Issue {
  type: 'BUG';
  taskId: number | null;
}

export interface Project {
  id: number;
  organizationId: number;
  teamId: number | null;
  key: string | null;
  name: string;
  description: string | null;
  status: 'PLANNED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED' | string;
  ownerId: number | null;
  startDate: string | null;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: number;
  organizationId: number;
  key: string;
  name: string;
  description: string | null;
  defaultWorkflowId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: number;
  organizationId: number;
  teamId: number;
  userId: number;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' | string;
  title: string | null;
  joinedAt: string;
  active: boolean;
}

export interface WorkflowState {
  id: number;
  key: string;
  label: string;
  category: 'BACKLOG' | 'ACTIVE' | 'REVIEW' | 'COMPLETED' | 'CANCELED' | string;
  sortOrder: number;
}

export interface WorkflowTransition {
  id: number;
  fromStateKey: string;
  toStateKey: string;
}

export interface Workflow {
  id: number;
  teamId: number;
  name: string;
  appliesToType: 'FEATURE' | 'TASK' | 'BUG' | 'ALL' | string;
  isDefault: boolean;
  createdAt: string;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}

export interface Epic {
  id: number;
  organizationId: number;
  teamId: number;
  projectId: number | null;
  identifier: string;
  title: string;
  description: string | null;
  state: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELED' | string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | string;
  ownerId: number | null;
  reporterId: number | null;
  startDate: string | null;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Sprint {
  id: number;
  teamId: number;
  projectId: number | null;
  name: string;
  goal: string | null;
  sequenceNumber: number;
  status: 'PLANNED' | 'ACTIVE' | 'CLOSED' | 'CANCELED' | string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface IssueRelation {
  id: number;
  fromIssueId: number;
  toIssueId: number;
  relationType: 'BLOCKS' | 'BLOCKED_BY' | 'RELATES_TO' | 'DUPLICATES' | 'CAUSED_BY' | 'SPLIT_FROM' | string;
  createdAt: string;
}

export interface IssueAttachment {
  id: number;
  issueId: number;
  filename: string;
  contentType: string | null;
  size: number;
  uploadedBy: number | null;
  createdAt: string;
}

export interface DocRevision {
  id: number;
  docId: number;
  versionNumber: number;
  content: string;
  authorId: number;
  createdAt: string;
}

export interface Doc {
  id: number;
  organizationId: number;
  teamId: number | null;
  projectId: number | null;
  epicId: number | null;
  issueId: number | null;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | string;
  authorId: number;
  currentRevisionId: number | null;
  createdAt: string;
  updatedAt: string;
  currentRevision: DocRevision | null;
  revisions: DocRevision[];
}

export interface Comment {
  id: number;
  issueId: number | null;
  epicId: number | null;
  docId: number | null;
  parentCommentId: number | null;
  authorId: number;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityEvent {
  id: number;
  actorId: number | null;
  entityType: 'ISSUE' | 'EPIC' | 'SPRINT' | 'DOC' | 'COMMENT' | string;
  entityId: number;
  actionType: string;
  summary: string;
  payloadJson: string | null;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  eventId: number;
  type: 'ASSIGNMENT' | 'MENTION' | 'COMMENT' | 'STATE_CHANGE' | 'SYSTEM' | string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export const parseLegacyPayload = (legacyPayload: string | null | undefined): JsonRecord => {
  if (!legacyPayload) return {};
  try {
    return JSON.parse(legacyPayload) as JsonRecord;
  } catch {
    return {};
  }
};

export const stringifyLegacyPayload = (payload: JsonRecord): string =>
  JSON.stringify(Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)));

const asNumber = (value: unknown): number | null => (typeof value === 'number' ? value : null);
const asString = (value: unknown): string | null => (typeof value === 'string' ? value : null);

export const mapFeatureIssue = (issue: Issue): FeatureIssue => {
  const payload = parseLegacyPayload(issue.legacyPayload);
  return {
    ...issue,
    type: 'FEATURE',
    expectedDeliveryDate: issue.plannedEndDate,
    requirementOwnerId: issue.assigneeId,
    productOwnerId: asNumber(payload.productOwnerId),
    devOwnerId: asNumber(payload.devOwnerId),
    devParticipants: asString(payload.devParticipants),
    testOwnerId: asNumber(payload.testOwnerId),
    tags: asString(payload.tags),
    estimatedDays: asNumber(payload.estimatedDays),
    plannedDays: asNumber(payload.plannedDays),
    gapDays: asNumber(payload.gapDays),
    gapBudget: asNumber(payload.gapBudget),
    actualDays: asNumber(payload.actualDays),
    applicationCodes: asString(payload.applicationCodes),
    vendors: asString(payload.vendors),
    vendorStaff: asString(payload.vendorStaff),
    createdBy: asString(payload.createdBy),
  };
};

export const mapTaskIssue = (issue: Issue): TaskIssue => {
  const payload = parseLegacyPayload(issue.legacyPayload);
  return {
    ...issue,
    type: 'TASK',
    requirementId: issue.parentIssueId,
    estimatedDays: asNumber(payload.estimatedDays),
    plannedDays: asNumber(payload.plannedDays),
    remainingDays: asNumber(payload.remainingDays),
  };
};

export const mapBugIssue = (issue: Issue): BugIssue => ({
  ...issue,
  type: 'BUG',
  taskId: issue.parentIssueId,
});
