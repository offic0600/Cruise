import { z } from 'zod';

export const issueFormSchema = z.object({
  type: z.enum(['FEATURE', 'TASK', 'BUG', 'TECH_DEBT']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  projectId: z.number().positive(),
  teamId: z.number().nullable().optional(),
  parentIssueId: z.number().nullable().optional(),
  state: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).nullable().optional(),
  estimatePoints: z.number().nullable().optional(),
  progress: z.number().min(0).max(100),
  plannedStartDate: z.string().nullable().optional(),
  plannedEndDate: z.string().nullable().optional(),
  estimatedHours: z.number().min(0),
  actualHours: z.number().min(0),
});

export type IssueFormValues = z.infer<typeof issueFormSchema>;

export const commentFormSchema = z.object({
  body: z.string().min(1, 'Comment is required'),
});

export type CommentFormValues = z.infer<typeof commentFormSchema>;

export const relationFormSchema = z.object({
  toIssueId: z.number().positive(),
  relationType: z.enum(['BLOCKS', 'BLOCKED_BY', 'RELATES_TO', 'DUPLICATES', 'CAUSED_BY', 'SPLIT_FROM']),
});

export type RelationFormValues = z.infer<typeof relationFormSchema>;

export const docFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
});

export type DocFormValues = z.infer<typeof docFormSchema>;
