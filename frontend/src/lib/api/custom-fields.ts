import apiClient from './client';
import type { CustomFieldDefinition, ImportFieldMappingTemplate } from './types';

export const getCustomFieldDefinitions = (params: {
  organizationId: number;
  entityType: 'ISSUE' | 'PROJECT' | 'EPIC' | 'SPRINT' | string;
  includeInactive?: boolean;
}) => apiClient.get<CustomFieldDefinition[]>('/custom-fields', { params }).then((r) => r.data);

export const createCustomFieldDefinition = (data: {
  organizationId: number;
  entityType: string;
  scopeType?: string;
  scopeId?: number | null;
  key: string;
  name: string;
  description?: string | null;
  dataType: string;
  required?: boolean;
  multiple?: boolean;
  isActive?: boolean;
  isVisible?: boolean;
  isFilterable?: boolean;
  isSortable?: boolean;
  showOnCreate?: boolean;
  showOnDetail?: boolean;
  showOnList?: boolean;
  sortOrder?: number;
  config?: Record<string, unknown>;
  options?: Array<{ value: string; label: string; color?: string | null; sortOrder?: number; isActive?: boolean }>;
}) => apiClient.post<CustomFieldDefinition>('/custom-fields', data).then((r) => r.data);

export const updateCustomFieldDefinition = (
  id: number,
  data: Partial<{
    scopeType: string;
    scopeId: number | null;
    name: string;
    description: string | null;
    dataType: string;
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
    options: Array<{ value: string; label: string; color?: string | null; sortOrder?: number; isActive?: boolean }>;
  }>
) => apiClient.put<CustomFieldDefinition>(`/custom-fields/${id}`, data).then((r) => r.data);

export const deleteCustomFieldDefinition = (id: number) => apiClient.delete(`/custom-fields/${id}`);

export const getImportFieldMappings = (params: { organizationId: number; entityType: string }) =>
  apiClient.get<ImportFieldMappingTemplate[]>('/import-field-mappings', { params }).then((r) => r.data);
