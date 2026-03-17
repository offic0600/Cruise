import { z } from 'zod';

export const customFieldOptionSchema = z.object({
  value: z.string().min(1, 'Option value is required'),
  label: z.string().min(1, 'Option label is required'),
  color: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean().default(true),
});

export const customFieldFormSchema = z.object({
  organizationId: z.number().positive(),
  entityType: z.enum(['ISSUE', 'PROJECT', 'EPIC', 'SPRINT']),
  scopeType: z.enum(['GLOBAL', 'TEAM', 'PROJECT']),
  scopeId: z.number().nullable().optional(),
  key: z.string().min(1, 'Key is required').regex(/^[a-z][a-z0-9_]*$/, 'Use snake_case key'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  dataType: z.enum(['TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'DATETIME', 'SINGLE_SELECT', 'MULTI_SELECT', 'BOOLEAN', 'USER', 'TEAM', 'URL']),
  required: z.boolean().default(false),
  multiple: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isVisible: z.boolean().default(true),
  isFilterable: z.boolean().default(false),
  isSortable: z.boolean().default(false),
  showOnCreate: z.boolean().default(true),
  showOnDetail: z.boolean().default(true),
  showOnList: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  options: z.array(customFieldOptionSchema).default([]),
});

export type CustomFieldFormInput = z.input<typeof customFieldFormSchema>;
export type CustomFieldFormValues = z.output<typeof customFieldFormSchema>;
