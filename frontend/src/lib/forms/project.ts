import { z } from 'zod';

export const projectFormSchema = z.object({
  organizationId: z.number().positive(),
  teamId: z.number().nullable().optional(),
  key: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['PLANNED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']),
  ownerId: z.number().nullable().optional(),
  startDate: z.string().nullable().optional(),
  targetDate: z.string().nullable().optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
