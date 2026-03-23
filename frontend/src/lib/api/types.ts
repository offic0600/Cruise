export interface RestPageInfo {
  nextCursor: string | null;
  prevCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface RestPageResponse<T> {
  items: T[];
  pageInfo: RestPageInfo;
  totalCount: number;
}

export interface Issue {
  id: number;
  organizationId: number;
  identifier: string;
  type: 'FEATURE' | 'TASK' | 'BUG' | 'TECH_DEBT';
  title: string;
  description: string | null;
  state: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELED';
  stateCategory: 'BACKLOG' | 'ACTIVE' | 'REVIEW' | 'COMPLETED' | 'CANCELED' | string;
  resolution: 'COMPLETED' | 'CANCELED' | 'DUPLICATE' | 'OBSOLETE' | 'WONT_DO' | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectId: number | null;
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
  labels: Label[];
  customFields: Record<string, unknown>;
  customFieldDefinitions?: CustomFieldDefinition[] | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface Label {
  id: number;
  organizationId: number;
  scopeType: 'WORKSPACE' | 'TEAM' | string;
  scopeId: number | null;
  name: string;
  color: string;
  description: string | null;
  sortOrder: number;
  archived: boolean;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface LabelCatalog {
  teamLabels: Label[];
  workspaceLabels: Label[];
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
  entityType: 'ISSUE' | 'PROJECT' | string;
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
  archivedAt: string | null;
}

export interface Initiative {
  id: number;
  organizationId: number;
  parentInitiativeId: number | null;
  name: string;
  description: string | null;
  slugId: string | null;
  status: string;
  health: string | null;
  ownerId: number | null;
  creatorId: number | null;
  targetDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface InitiativeUpdate {
  id: number;
  initiativeId: number;
  title: string;
  body: string | null;
  health: string | null;
  userId: number | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface InitiativeProject {
  id: number;
  initiativeId: number;
  projectId: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface Cycle {
  id: number;
  organizationId: number;
  teamId: number;
  name: string;
  description: string | null;
  number: number;
  startsAt: string | null;
  endsAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface ProjectStatus {
  id: number;
  organizationId: number;
  name: string;
  color: string | null;
  type: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface InitiativeRelation {
  id: number;
  initiativeId: number;
  relatedInitiativeId: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface ProjectMilestone {
  id: number;
  projectId: number;
  name: string;
  description: string | null;
  targetDate: string | null;
  status: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface ProjectUpdate {
  id: number;
  projectId: number;
  title: string;
  body: string | null;
  health: string | null;
  userId: number | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface Roadmap {
  id: number;
  organizationId: number;
  name: string;
  description: string | null;
  color: string | null;
  slugId: string | null;
  sortOrder: number;
  ownerId: number | null;
  creatorId: number | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface RoadmapProject {
  id: number;
  roadmapId: number;
  projectId: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface Customer {
  id: number;
  organizationId: number;
  name: string;
  slugId: string | null;
  ownerId: number | null;
  statusId: number | null;
  tierId: number | null;
  integrationId: number | null;
  domains: string | null;
  externalIds: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface CustomerNeed {
  id: number;
  customerId: number;
  projectId: number | null;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface CustomerStatus {
  id: number;
  organizationId: number;
  name: string;
  color: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface CustomerTier {
  id: number;
  organizationId: number;
  name: string;
  color: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface ExternalEntityInfo {
  id: number;
  service: string;
  entityType: string;
  entityId: number;
  externalId: string;
  externalUrl: string | null;
  metadataJson: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalUser {
  id: number;
  service: string;
  externalId: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EntityExternalLink {
  id: number;
  entityType: string;
  entityId: number;
  title: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentActivity {
  id: number;
  agentSessionId: number;
  type: string;
  content: string | null;
  issueId: number | null;
  commentId: number | null;
  createdAt: string;
}

export interface Reaction {
  id: number;
  userId: number;
  issueId: number | null;
  commentId: number | null;
  projectUpdateId: number | null;
  initiativeUpdateId: number | null;
  emoji: string;
  createdAt: string;
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

export interface Organization {
  id: number;
  name: string;
  slug: string;
  region: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SlugAvailability {
  slug: string;
  available: boolean;
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  region: string;
  /** @deprecated New callers should omit this and let the backend create a same-name default team. */
  initialTeamName?: string;
}

export interface CreateOrganizationResponse {
  organization: Organization;
  initialTeam: Team;
  membership: Membership;
  authSession: {
    token: string;
    userId: number;
    username: string;
    email: string;
    role: string;
    organizationId: number | null;
    providerKey?: string | null;
  };
}

export interface WorkspaceInvite {
  id: number;
  organizationId: number;
  teamId: number | null;
  code: string;
  email: string | null;
  role: string;
  createdBy: number;
  createdAt: string;
  expiresAt: string | null;
  usedAt: string | null;
  inviteUrl: string;
}

export interface CreateWorkspaceInviteRequest {
  teamId?: number | null;
  email?: string | null;
  role?: string;
  expiresInDays?: number | null;
}

export interface CreateWorkspaceInviteResponse extends WorkspaceInvite {}

export interface JoinWorkspaceInviteRequest {
  inviteCodeOrLink: string;
}

export interface JoinWorkspaceInviteResponse {
  organization: Organization;
  team: Team;
  membership: Membership;
  authSession: {
    token: string;
    userId: number;
    username: string;
    email: string;
    role: string;
    organizationId: number | null;
    providerKey?: string | null;
  };
}

export interface View {
  id: number;
  organizationId: number;
  teamId: number | null;
  projectId: number | null;
  name: string;
  description: string | null;
  filterJson: string | null;
  groupBy: string | null;
  sortJson: string | null;
  visibility: string;
  isSystem: boolean;
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
  attachmentType: 'FILE' | 'LINK' | string;
  contentType: string | null;
  size: number;
  externalUrl: string | null;
  linkTitle: string | null;
  metadataJson: string | null;
  uploadedBy: number | null;
  createdAt: string;
}

export interface IssueTemplate {
  id: number;
  organizationId: number;
  teamId: number | null;
  projectId: number | null;
  name: string;
  title: string | null;
  description: string | null;
  type: Issue['type'];
  state: Issue['state'] | null;
  priority: Issue['priority'] | null;
  assigneeId: number | null;
  estimatePoints: number | null;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  labelIds: number[];
  customFields: Record<string, unknown>;
  subIssues: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IssueDraft {
  id: number;
  organizationId: number;
  teamId: number | null;
  projectId: number | null;
  templateId: number | null;
  title: string | null;
  description: string | null;
  type: Issue['type'];
  state: Issue['state'] | null;
  priority: Issue['priority'] | null;
  assigneeId: number | null;
  parentIssueId: number | null;
  estimatePoints: number | null;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  labelIds: number[];
  status: 'LOCAL_DRAFT' | 'SAVED_DRAFT' | string;
  customFields: Record<string, unknown>;
  attachmentsPending: Array<Record<string, unknown>>;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringIssueDefinition {
  id: number;
  organizationId: number;
  teamId: number | null;
  projectId: number;
  templateId: number | null;
  name: string;
  title: string | null;
  description: string | null;
  type: Issue['type'];
  state: Issue['state'] | null;
  priority: Issue['priority'] | null;
  assigneeId: number | null;
  estimatePoints: number | null;
  cadenceType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | string;
  cadenceInterval: number;
  weekdays: string[];
  nextRunAt: string;
  labelIds: number[];
  active: boolean;
  customFields: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface EmailIntakeConfig {
  id: number;
  organizationId: number;
  teamId: number | null;
  projectId: number | null;
  templateId: number | null;
  name: string;
  emailAddress: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentContent {
  id: number;
  documentId: number;
  versionNumber: number;
  content: string;
  authorId: number | null;
  createdAt: string;
}

export interface Doc {
  id: number;
  organizationId: number;
  teamId: number | null;
  projectId: number | null;
  issueId: number | null;
  initiativeId: number | null;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | string;
  authorId: number;
  currentContentId: number | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  currentContent: DocumentContent | null;
  contents: DocumentContent[];
}

export interface Comment {
  id: number;
  targetType: 'ISSUE' | 'DOCUMENT' | 'PROJECT_UPDATE' | 'INITIATIVE_UPDATE' | string;
  targetId: number;
  documentContentId: number | null;
  parentCommentId: number | null;
  authorId: number;
  body: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface ActivityEvent {
  id: number;
  actorId: number | null;
  entityType: 'ISSUE' | 'DOC' | 'COMMENT' | string;
  entityId: number;
  eventType: string;
  payload: Record<string, unknown> | null;
  summary: string | null;
  payloadJson: string | null;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  eventId: number;
  actorId: number | null;
  type: 'ASSIGNMENT' | 'MENTION' | 'COMMENT' | 'STATE_CHANGE' | 'SYSTEM' | string;
  category: string;
  resourceType: string | null;
  resourceId: number | null;
  title: string;
  body: string;
  payloadJson: string | null;
  readAt: string | null;
  updatedAt: string;
  createdAt: string;
  archivedAt: string | null;
}

export interface NotificationSubscription {
  id: number;
  userId: number;
  resourceType: string;
  resourceId: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface NotificationPreference {
  id: number;
  userId: number;
  category: string;
  channel: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

const asNumber = (value: unknown): number | null =>
  typeof value === 'number' ? value : typeof value === 'string' ? Number(value) || null : null;
const asString = (value: unknown): string | null => (typeof value === 'string' ? value : null);

export const mapFeatureIssue = (issue: Issue): FeatureIssue => {
  const payload = issue.customFields ?? {};
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
  const payload = issue.customFields ?? {};
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
