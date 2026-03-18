'use client';

import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDismissButton, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/i18n/useI18n';
import type { CustomFieldDefinition } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { customFieldFormSchema, type CustomFieldFormInput, type CustomFieldFormValues } from '@/lib/forms/custom-field';
import { useCustomFieldMutations, useCustomFieldsWorkspace } from '@/lib/query/custom-fields';

const EMPTY = '__empty__';
const ENTITY_TYPES = ['ISSUE', 'PROJECT', 'EPIC', 'SPRINT'] as const;
const SCOPE_TYPES = ['GLOBAL', 'TEAM', 'PROJECT'] as const;
const DATA_TYPES = ['TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'DATETIME', 'SINGLE_SELECT', 'MULTI_SELECT', 'BOOLEAN', 'USER', 'TEAM', 'URL'] as const;

export default function CustomFieldsPage() {
  const { t } = useI18n();
  const organizationId = getStoredUser()?.organizationId ?? 1;
  const [q, setQ] = useState('');
  const [entityType, setEntityType] = useState<(typeof ENTITY_TYPES)[number]>('ISSUE');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const params = { organizationId, entityType, includeInactive };
  const { customFieldsQuery, teamsQuery, projectsQuery } = useCustomFieldsWorkspace(params);
  const { createCustomFieldMutation, updateCustomFieldMutation, deleteCustomFieldMutation } = useCustomFieldMutations(params);

  const teams = teamsQuery.data ?? [];
  const projects = projectsQuery.data ?? [];
  const customFields = useMemo<CustomFieldDefinition[]>(
    () => (customFieldsQuery.data ?? []).filter((field) => !q || field.name.toLowerCase().includes(q.toLowerCase()) || field.key.toLowerCase().includes(q.toLowerCase())),
    [customFieldsQuery.data, q]
  );
  const selectedField = customFields.find((field) => field.id === selectedId) ?? customFields[0] ?? null;

  const form = useForm<CustomFieldFormInput, unknown, CustomFieldFormValues>({
    resolver: zodResolver(customFieldFormSchema),
    defaultValues: buildFormValues(null, organizationId, entityType, customFields.length),
  });

  const watchScopeType = form.watch('scopeType');
  const watchDataType = form.watch('dataType');
  const watchOptions = form.watch('options') ?? [];

  const submit = form.handleSubmit(async (values) => {
    const payload = {
      organizationId: values.organizationId,
      entityType: values.entityType,
      scopeType: values.scopeType,
      scopeId: values.scopeType === 'GLOBAL' ? null : values.scopeId ?? null,
      key: values.key,
      name: values.name,
      description: values.description || null,
      dataType: values.dataType,
      required: values.required,
      multiple: values.multiple,
      isActive: values.isActive,
      isVisible: values.isVisible,
      isFilterable: values.isFilterable,
      isSortable: values.isSortable,
      showOnCreate: values.showOnCreate,
      showOnDetail: values.showOnDetail,
      showOnList: values.showOnList,
      sortOrder: values.sortOrder,
      config: compactConfig({
        placeholder: values.placeholder,
        helpText: values.helpText,
      }),
      options: isSelectType(values.dataType)
        ? values.options.map((option, index) => ({
            ...option,
            color: option.color || null,
            sortOrder: option.sortOrder ?? index,
          }))
        : [],
    };

    if (editingField) {
      await updateCustomFieldMutation.mutateAsync({ id: editingField.id, data: payload });
    } else {
      await createCustomFieldMutation.mutateAsync(payload);
    }
    setEditorOpen(false);
    setEditingField(null);
  });

  const openCreateEditor = () => {
    setEditingField(null);
    form.reset(buildFormValues(null, organizationId, entityType, customFields.length));
    setEditorOpen(true);
  };

  const openEditEditor = (field: CustomFieldDefinition) => {
    setEditingField(field);
    form.reset(buildFormValues(field, organizationId, entityType, customFields.length));
    setEditorOpen(true);
  };

  const closeEditor = (open: boolean) => {
    setEditorOpen(open);
    if (!open) {
      setEditingField(null);
      form.reset(buildFormValues(null, organizationId, entityType, customFields.length));
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-ink-900">{t('customFields.title')}</h1>
            <p className="mt-2 text-sm text-ink-700">{t('customFields.subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder={t('customFields.searchPlaceholder')} className="w-72" />
            <div className="control-surface flex items-center gap-2 px-3 py-2 text-sm text-ink-700">
              <input type="checkbox" checked={includeInactive} onChange={(event) => setIncludeInactive(event.target.checked)} />
              <span>{t('customFields.filters.includeInactive')}</span>
            </div>
            <Button className="gap-2" onClick={openCreateEditor}>
              <Plus className="h-4 w-4" />
              {t('customFields.actions.new')}
            </Button>
          </div>
        </div>

        <Card className="filter-bar">
          <CardContent className="grid gap-3 p-0 md:grid-cols-3">
            <Field label={t('customFields.fields.entityType')}>
              <Select value={entityType} onValueChange={(value) => { setEntityType(value as (typeof ENTITY_TYPES)[number]); setSelectedId(null); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ENTITY_TYPES.map((value) => <SelectItem key={value} value={value}>{t(`customFields.entityType.${value}`)}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Metric label={t('customFields.metrics.total')} value={customFields.length} />
            <Metric label={t('customFields.metrics.filterable')} value={customFields.filter((field) => field.isFilterable).length} />
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <section className="space-y-3">
            {customFields.length ? customFields.map((field) => (
              <button key={field.id} onClick={() => setSelectedId(field.id)} className={`w-full rounded-panel border p-5 text-left transition ${selectedField?.id === field.id ? 'border-ink-900 bg-ink-900 text-white shadow-nav' : 'border-border-subtle bg-surface-raised text-ink-900 shadow-card hover:bg-slate-50'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={`text-xs uppercase tracking-[0.18em] ${selectedField?.id === field.id ? 'text-slate-300' : 'text-ink-400'}`}>{field.key}</div>
                    <div className="mt-2 text-lg font-semibold">{field.name}</div>
                    <div className={`mt-2 text-sm ${selectedField?.id === field.id ? 'text-slate-300' : 'text-ink-700'}`}>{field.description ?? t('common.empty')}</div>
                  </div>
                  <Badge variant={field.isActive ? 'brand' : 'neutral'}>{field.isActive ? t('customFields.status.active') : t('customFields.status.inactive')}</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge>{t(`customFields.dataType.${field.dataType}`)}</Badge>
                  <Badge>{t(`customFields.scopeType.${field.scopeType}`)}</Badge>
                  {field.isFilterable && <Badge variant="warning">{t('customFields.badges.filterable')}</Badge>}
                </div>
              </button>
            )) : <Card className="section-panel p-10 text-center text-ink-400">{t('customFields.empty')}</Card>}
          </section>

          <section className="space-y-6">
            {selectedField ? (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <Metric label={t('customFields.metrics.options')} value={selectedField.options.length} />
                  <Metric label={t('customFields.metrics.visible')} value={Number(selectedField.isVisible)} />
                  <Metric label={t('customFields.metrics.listed')} value={Number(selectedField.showOnList)} />
                </div>
                <Card className="section-panel">
                  <CardHeader className="p-0 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle>{selectedField.name}</CardTitle>
                        <div className="mt-2 text-sm text-ink-700">{selectedField.description ?? t('common.empty')}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => openEditEditor(selectedField)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          {t('common.edit')}
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => deleteCustomFieldMutation.mutate(selectedField.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('common.delete')}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4 p-0 md:grid-cols-2">
                    <Meta label={t('customFields.fields.entityType')} value={t(`customFields.entityType.${selectedField.entityType}`)} />
                    <Meta label={t('customFields.fields.scopeType')} value={t(`customFields.scopeType.${selectedField.scopeType}`)} />
                    <Meta label={t('customFields.fields.dataType')} value={t(`customFields.dataType.${selectedField.dataType}`)} />
                    <Meta label={t('customFields.fields.sortOrder')} value={String(selectedField.sortOrder)} />
                    <Meta label={t('customFields.fields.visibility')} value={formatFlags(selectedField, t)} />
                    <Meta label={t('customFields.fields.scopeTarget')} value={scopeTargetName(selectedField, teams, projects, t)} />
                  </CardContent>
                </Card>

                <Card className="section-panel">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle>{t('customFields.optionsTitle')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-0">
                    {selectedField.options.length ? selectedField.options.map((option) => (
                      <div key={option.id} className="drawer-panel">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-medium text-ink-900">{option.label}</div>
                            <div className="mt-1 text-xs text-ink-400">{option.value}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {option.color && <span className="h-3 w-3 rounded-full" style={{ backgroundColor: option.color }} />}
                            <Badge variant={option.isActive ? 'brand' : 'neutral'}>{option.isActive ? t('customFields.status.active') : t('customFields.status.inactive')}</Badge>
                          </div>
                        </div>
                      </div>
                    )) : <Empty label={t('customFields.emptyOptions')} />}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="section-panel p-10 text-center text-ink-400">{t('customFields.emptySelection')}</Card>
            )}
          </section>
        </div>
      </div>

      <Sheet open={editorOpen} onOpenChange={closeEditor}>
        <SheetContent className="max-w-2xl">
          <SheetHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-ink-400">{editingField?.key ?? t('customFields.actions.new')}</div>
                <SheetTitle className="mt-2">{editingField ? t('customFields.actions.edit') : t('customFields.actions.new')}</SheetTitle>
              </div>
              <SheetDismissButton aria-label={t('common.cancel')} />
            </div>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)]">
            <form className="space-y-4 px-6 py-6" onSubmit={submit}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t('customFields.fields.entityType')}>
                  <Select value={form.watch('entityType')} onValueChange={(value) => form.setValue('entityType', value as CustomFieldFormValues['entityType'])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ENTITY_TYPES.map((value) => <SelectItem key={value} value={value}>{t(`customFields.entityType.${value}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label={t('customFields.fields.dataType')}>
                  <Select value={watchDataType} onValueChange={(value) => form.setValue('dataType', value as CustomFieldFormValues['dataType'])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DATA_TYPES.map((value) => <SelectItem key={value} value={value}>{t(`customFields.dataType.${value}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t('customFields.fields.key')}><Input {...form.register('key')} disabled={!!editingField} /></Field>
                <Field label={t('customFields.fields.name')}><Input {...form.register('name')} /></Field>
              </div>
              <Field label={t('customFields.fields.description')}><Textarea {...form.register('description')} /></Field>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label={t('customFields.fields.scopeType')}>
                  <Select value={watchScopeType} onValueChange={(value) => form.setValue('scopeType', value as CustomFieldFormValues['scopeType'])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SCOPE_TYPES.map((value) => <SelectItem key={value} value={value}>{t(`customFields.scopeType.${value}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label={t('customFields.fields.scopeTarget')}>
                  {watchScopeType === 'GLOBAL' ? (
                    <Input value={t('customFields.scopeTarget.global')} disabled />
                  ) : (
                    <Select value={form.watch('scopeId') == null ? EMPTY : String(form.watch('scopeId'))} onValueChange={(value) => form.setValue('scopeId', value === EMPTY ? null : Number(value))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={EMPTY}>{t('common.notSet')}</SelectItem>
                        {(watchScopeType === 'TEAM' ? teams : projects).map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </Field>
                <Field label={t('customFields.fields.sortOrder')}><Input type="number" min={0} {...form.register('sortOrder', { valueAsNumber: true })} /></Field>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t('customFields.fields.placeholder')}><Input {...form.register('placeholder')} /></Field>
                <Field label={t('customFields.fields.helpText')}><Input {...form.register('helpText')} /></Field>
              </div>

              <Card className="section-panel">
                <CardHeader className="p-0 pb-4">
                  <CardTitle>{t('customFields.flagsTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 p-0 md:grid-cols-2">
                  {[
                    ['required', 'customFields.flags.required'],
                    ['multiple', 'customFields.flags.multiple'],
                    ['isActive', 'customFields.flags.active'],
                    ['isVisible', 'customFields.flags.visible'],
                    ['isFilterable', 'customFields.flags.filterable'],
                    ['isSortable', 'customFields.flags.sortable'],
                    ['showOnCreate', 'customFields.flags.showOnCreate'],
                    ['showOnDetail', 'customFields.flags.showOnDetail'],
                    ['showOnList', 'customFields.flags.showOnList'],
                  ].map(([key, label]) => (
                    <label key={key} className="control-surface flex items-center gap-3 px-4 py-3 text-sm text-ink-700">
                      <input type="checkbox" checked={Boolean(form.watch(key as keyof CustomFieldFormValues))} onChange={(event) => form.setValue(key as keyof CustomFieldFormValues, event.target.checked as never)} />
                      <span>{t(label)}</span>
                    </label>
                  ))}
                </CardContent>
              </Card>

              {isSelectType(watchDataType) && (
                <Card className="section-panel">
                  <CardHeader className="flex-row items-center justify-between p-0 pb-4">
                    <CardTitle>{t('customFields.optionsTitle')}</CardTitle>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        form.setValue('options', [
                          ...watchOptions,
                          { value: '', label: '', color: '', sortOrder: watchOptions.length, isActive: true },
                        ])
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t('customFields.actions.addOption')}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3 p-0">
                    {watchOptions.length ? watchOptions.map((option, index) => (
                      <div key={`${option.value}-${index}`} className="drawer-panel space-y-3">
                        <div className="grid gap-3 md:grid-cols-3">
                          <Input value={option.label} onChange={(event) => updateOption(form, index, { label: event.target.value })} placeholder={t('customFields.fields.optionLabel')} />
                          <Input value={option.value} onChange={(event) => updateOption(form, index, { value: event.target.value })} placeholder={t('customFields.fields.optionValue')} />
                          <Input value={option.color ?? ''} onChange={(event) => updateOption(form, index, { color: event.target.value })} placeholder="#2563EB" />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-sm text-ink-700">
                            <input type="checkbox" checked={option.isActive} onChange={(event) => updateOption(form, index, { isActive: event.target.checked })} />
                            {t('customFields.flags.active')}
                          </label>
                          <Button type="button" variant="ghost" size="icon" onClick={() => form.setValue('options', watchOptions.filter((_, optionIndex) => optionIndex !== index))}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )) : <Empty label={t('customFields.emptyOptions')} />}
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setEditorOpen(false)}>{t('common.cancel')}</Button>
                <Button type="submit" disabled={createCustomFieldMutation.isPending || updateCustomFieldMutation.isPending}>{t('common.save')}</Button>
              </div>
            </form>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="mb-1.5 text-sm font-medium text-ink-700">{label}</div>{children}</label>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <Card className="metric-card"><CardContent className="p-0"><div className="text-sm text-ink-700">{label}</div><div className="mt-3 text-3xl font-semibold text-ink-900">{value}</div></CardContent></Card>;
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div className="drawer-panel"><div className="meta-label">{label}</div><div className="mt-2 text-sm font-medium text-ink-900">{value}</div></div>;
}

function Empty({ label }: { label: string }) {
  return <div className="text-sm text-ink-400">{label}</div>;
}

function normalizeEntityType(value: string): CustomFieldFormValues['entityType'] {
  return ENTITY_TYPES.includes(value as CustomFieldFormValues['entityType']) ? (value as CustomFieldFormValues['entityType']) : 'ISSUE';
}

function normalizeScopeType(value: string): CustomFieldFormValues['scopeType'] {
  return SCOPE_TYPES.includes(value as CustomFieldFormValues['scopeType']) ? (value as CustomFieldFormValues['scopeType']) : 'GLOBAL';
}

function normalizeDataType(value: string): CustomFieldFormValues['dataType'] {
  return DATA_TYPES.includes(value as CustomFieldFormValues['dataType']) ? (value as CustomFieldFormValues['dataType']) : 'TEXT';
}

function buildFormValues(
  field: CustomFieldDefinition | null,
  organizationId: number,
  entityType: (typeof ENTITY_TYPES)[number],
  sortOrder: number
): CustomFieldFormInput {
  if (field) {
    return {
      organizationId: field.organizationId,
      entityType: normalizeEntityType(field.entityType),
      scopeType: normalizeScopeType(field.scopeType),
      scopeId: field.scopeId,
      key: field.key,
      name: field.name,
      description: field.description ?? '',
      dataType: normalizeDataType(field.dataType),
      required: field.required,
      multiple: field.multiple,
      isActive: field.isActive,
      isVisible: field.isVisible,
      isFilterable: field.isFilterable,
      isSortable: field.isSortable,
      showOnCreate: field.showOnCreate,
      showOnDetail: field.showOnDetail,
      showOnList: field.showOnList,
      sortOrder: field.sortOrder,
      placeholder: String(field.config.placeholder ?? ''),
      helpText: String(field.config.helpText ?? ''),
      options: field.options.map((option) => ({
        value: option.value,
        label: option.label,
        color: option.color,
        sortOrder: option.sortOrder,
        isActive: option.isActive,
      })),
    };
  }

  return {
    organizationId,
    entityType,
    scopeType: 'GLOBAL',
    scopeId: null,
    key: '',
    name: '',
    description: '',
    dataType: 'TEXT',
    required: false,
    multiple: false,
    isActive: true,
    isVisible: true,
    isFilterable: false,
    isSortable: false,
    showOnCreate: true,
    showOnDetail: true,
    showOnList: false,
    sortOrder,
    placeholder: '',
    helpText: '',
    options: [],
  };
}

function isSelectType(dataType: string) {
  return dataType === 'SINGLE_SELECT' || dataType === 'MULTI_SELECT';
}

function compactConfig(config: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(config).filter(([, value]) => value !== '' && value != null));
}

function scopeTargetName(
  field: CustomFieldDefinition,
  teams: Array<{ id: number; name: string }>,
  projects: Array<{ id: number; name: string }>,
  t: (key: string) => string
) {
  if (field.scopeType === 'GLOBAL') return t('customFields.scopeTarget.global');
  if (field.scopeType === 'TEAM') return teams.find((team) => team.id === field.scopeId)?.name ?? `#${field.scopeId}`;
  if (field.scopeType === 'PROJECT') return projects.find((project) => project.id === field.scopeId)?.name ?? `#${field.scopeId}`;
  return t('common.notSet');
}

function formatFlags(field: CustomFieldDefinition, t: (key: string) => string) {
  const flags = [];
  if (field.required) flags.push(t('customFields.flags.required'));
  if (field.isFilterable) flags.push(t('customFields.flags.filterable'));
  if (field.showOnList) flags.push(t('customFields.flags.showOnList'));
  return flags.join(' / ') || t('common.notSet');
}

function updateOption(
  form: ReturnType<typeof useForm<CustomFieldFormInput, unknown, CustomFieldFormValues>>,
  index: number,
  patch: Partial<CustomFieldFormValues['options'][number]>
) {
  const current = form.getValues('options') ?? [];
  form.setValue(
    'options',
    current.map((option, optionIndex) => (optionIndex === index ? { ...option, ...patch } : option))
  );
}
