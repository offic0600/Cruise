export const queryKeys = {
  issues: (filters?: Record<string, unknown>) => ['issues', filters ?? {}] as const,
  issue: (id: number) => ['issues', id] as const,
  issueDetail: (id: number) => ['issues', id, 'detail'] as const,
  projects: ['projects'] as const,
  epics: ['epics'] as const,
  sprints: ['sprints'] as const,
  teams: ['teams'] as const,
  docs: (filters?: Record<string, unknown>) => ['docs', filters ?? {}] as const,
  comments: (filters?: Record<string, unknown>) => ['comments', filters ?? {}] as const,
  activity: (filters?: Record<string, unknown>) => ['activity', filters ?? {}] as const,
  relations: (issueId: number) => ['issues', issueId, 'relations'] as const,
} as const;
