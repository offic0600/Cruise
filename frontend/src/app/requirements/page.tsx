'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  FeatureIssue,
  createFeatureIssue,
  deleteIssue,
  getFeatureIssues,
  getIssueTags,
  getTeamMembers,
  updateFeatureIssue,
} from '@/lib/api';

interface TeamMember {
  id: number;
  name: string;
}

interface IssueTag {
  id: number;
  name: string;
  color: string;
}

const stateOptions = ['BACKLOG', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELED'] as const;
const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

const defaultFormData = {
  title: '',
  description: '',
  state: 'BACKLOG',
  priority: 'MEDIUM',
  projectId: 1,
  teamId: null as number | null,
  plannedStartDate: '',
  expectedDeliveryDate: '',
  requirementOwnerId: null as number | null,
  productOwnerId: null as number | null,
  devOwnerId: null as number | null,
  devParticipants: '',
  testOwnerId: null as number | null,
  progress: 0,
  tags: '',
  estimatedDays: '' as number | '',
  plannedDays: '' as number | '',
  gapDays: '' as number | '',
  gapBudget: '' as number | '',
  actualDays: '' as number | '',
  applicationCodes: '',
  vendors: '',
  vendorStaff: '',
};

const toNullableNumber = (value: number | '' | null) =>
  value === '' || value === null ? null : Number(value);

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<FeatureIssue[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tags, setTags] = useState<IssueTag[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FeatureIssue | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    try {
      const [issues, members, tagList] = await Promise.all([
        getFeatureIssues(),
        getTeamMembers(),
        getIssueTags(),
      ]);
      setRequirements(Array.isArray(issues) ? issues : []);
      setTeamMembers(Array.isArray(members) ? members : []);
      setTags(Array.isArray(tagList) ? tagList : []);
    } catch (error) {
      console.error('加载需求失败', error);
    }
  };

  const filteredRequirements = useMemo(() => {
    if (!searchText.trim()) return requirements;
    const keyword = searchText.toLowerCase();
    return requirements.filter((issue) =>
      [issue.title, issue.description, issue.state, issue.priority, issue.tags]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(keyword))
    );
  }, [requirements, searchText]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      title: formData.title,
      description: formData.description || undefined,
      status: formData.state,
      priority: formData.priority,
      projectId: formData.projectId,
      teamId: formData.teamId,
      plannedStartDate: formData.plannedStartDate || null,
      expectedDeliveryDate: formData.expectedDeliveryDate || null,
      requirementOwnerId: formData.requirementOwnerId,
      productOwnerId: formData.productOwnerId,
      devOwnerId: formData.devOwnerId,
      devParticipants: formData.devParticipants || null,
      testOwnerId: formData.testOwnerId,
      progress: Number(formData.progress) || 0,
      tags: formData.tags || null,
      estimatedDays: toNullableNumber(formData.estimatedDays),
      plannedDays: toNullableNumber(formData.plannedDays),
      gapDays: toNullableNumber(formData.gapDays),
      gapBudget: toNullableNumber(formData.gapBudget),
      actualDays: toNullableNumber(formData.actualDays),
      applicationCodes: formData.applicationCodes || null,
      vendors: formData.vendors || null,
      vendorStaff: formData.vendorStaff || null,
    };

    try {
      if (editingItem) {
        await updateFeatureIssue(editingItem.id, payload);
      } else {
        await createFeatureIssue(payload);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData(defaultFormData);
      await loadData();
    } catch (error) {
      console.error('保存需求失败', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确认删除这条需求吗？')) return;
    try {
      await deleteIssue(id);
      await loadData();
    } catch (error) {
      console.error('删除需求失败', error);
    }
  };

  const openEdit = (issue: FeatureIssue) => {
    setEditingItem(issue);
    setFormData({
      title: issue.title,
      description: issue.description || '',
      state: issue.state,
      priority: issue.priority,
      projectId: issue.projectId,
      teamId: issue.teamId,
      plannedStartDate: issue.plannedStartDate || '',
      expectedDeliveryDate: issue.expectedDeliveryDate || '',
      requirementOwnerId: issue.requirementOwnerId,
      productOwnerId: issue.productOwnerId,
      devOwnerId: issue.devOwnerId,
      devParticipants: issue.devParticipants || '',
      testOwnerId: issue.testOwnerId,
      progress: issue.progress,
      tags: issue.tags || '',
      estimatedDays: issue.estimatedDays ?? '',
      plannedDays: issue.plannedDays ?? '',
      gapDays: issue.gapDays ?? '',
      gapBudget: issue.gapBudget ?? '',
      actualDays: issue.actualDays ?? '',
      applicationCodes: issue.applicationCodes || '',
      vendors: issue.vendors || '',
      vendorStaff: issue.vendorStaff || '',
    });
    setShowModal(true);
  };

  const getMemberName = (id: number | null) =>
    teamMembers.find((member) => member.id === id)?.name || '-';

  const statusClasses: Record<string, string> = {
    BACKLOG: 'bg-slate-100 text-slate-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    IN_REVIEW: 'bg-amber-100 text-amber-700',
    DONE: 'bg-emerald-100 text-emerald-700',
    CANCELED: 'bg-rose-100 text-rose-700',
  };

  const priorityClasses: Record<string, string> = {
    LOW: 'text-slate-500',
    MEDIUM: 'text-amber-600',
    HIGH: 'text-orange-500',
    URGENT: 'text-rose-600',
  };

  const memberOptions = teamMembers.map((member) => ({ value: member.id, label: member.name }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">需求视图</h1>
            <p className="mt-1 text-sm text-slate-500">基于统一 Issue 模型的 FEATURE 视图</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="搜索需求"
              className="w-64 rounded-xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              onClick={() => {
                setEditingItem(null);
                setFormData(defaultFormData);
                setShowModal(true);
              }}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-600 hover:to-cyan-600"
            >
              新建需求
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <SummaryCard title="总需求数" value={requirements.length} />
          <SummaryCard title="进行中" value={requirements.filter((item) => item.state === 'IN_PROGRESS').length} />
          <SummaryCard title="待评审" value={requirements.filter((item) => item.state === 'IN_REVIEW').length} />
          <SummaryCard title="已完成" value={requirements.filter((item) => item.state === 'DONE').length} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-lg">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-sm text-slate-600">
                <th className="px-6 py-4">需求</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4">优先级</th>
                <th className="px-6 py-4">负责人</th>
                <th className="px-6 py-4">进度</th>
                <th className="px-6 py-4">计划完成</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequirements.map((issue) => (
                <tr key={issue.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{issue.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{issue.identifier}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${statusClasses[issue.state] || statusClasses.BACKLOG}`}>
                      {issue.state}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-semibold ${priorityClasses[issue.priority] || priorityClasses.MEDIUM}`}>
                    {issue.priority}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{getMemberName(issue.requirementOwnerId)}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{issue.progress}%</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{issue.expectedDeliveryDate || '-'}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button onClick={() => openEdit(issue)} className="mr-3 text-blue-600 hover:text-blue-800">
                      编辑
                    </button>
                    <button onClick={() => void handleDelete(issue.id)} className="text-rose-600 hover:text-rose-800">
                      删除
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRequirements.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    暂无需求数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  {editingItem ? '编辑需求' : '新建需求'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="grid gap-4 p-6 md:grid-cols-2">
                <TextField label="标题" value={formData.title} onChange={(value) => setFormData({ ...formData, title: value })} required />
                <SelectField
                  label="状态"
                  value={formData.state}
                  onChange={(value) => setFormData({ ...formData, state: value })}
                  options={stateOptions}
                />
                <TextAreaField
                  label="描述"
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  className="md:col-span-2"
                />
                <SelectField
                  label="优先级"
                  value={formData.priority}
                  onChange={(value) => setFormData({ ...formData, priority: value })}
                  options={priorityOptions}
                />
                <NumberField label="项目 ID" value={formData.projectId} onChange={(value) => setFormData({ ...formData, projectId: Number(value) || 1 })} />
                <MemberSelect
                  label="需求负责人"
                  value={formData.requirementOwnerId}
                  onChange={(value) => setFormData({ ...formData, requirementOwnerId: value })}
                  options={memberOptions}
                />
                <MemberSelect
                  label="产品负责人"
                  value={formData.productOwnerId}
                  onChange={(value) => setFormData({ ...formData, productOwnerId: value })}
                  options={memberOptions}
                />
                <MemberSelect
                  label="开发负责人"
                  value={formData.devOwnerId}
                  onChange={(value) => setFormData({ ...formData, devOwnerId: value })}
                  options={memberOptions}
                />
                <MemberSelect
                  label="测试负责人"
                  value={formData.testOwnerId}
                  onChange={(value) => setFormData({ ...formData, testOwnerId: value })}
                  options={memberOptions}
                />
                <TextField label="协作者" value={formData.devParticipants} onChange={(value) => setFormData({ ...formData, devParticipants: value })} />
                <TextField label="标签" value={formData.tags} onChange={(value) => setFormData({ ...formData, tags: value })} placeholder={tags.map((tag) => tag.name).join(', ')} />
                <TextField label="应用编码" value={formData.applicationCodes} onChange={(value) => setFormData({ ...formData, applicationCodes: value })} />
                <TextField label="供应商" value={formData.vendors} onChange={(value) => setFormData({ ...formData, vendors: value })} />
                <TextField label="供应商人员" value={formData.vendorStaff} onChange={(value) => setFormData({ ...formData, vendorStaff: value })} />
                <DateField label="计划开始" value={formData.plannedStartDate} onChange={(value) => setFormData({ ...formData, plannedStartDate: value })} />
                <DateField label="计划完成" value={formData.expectedDeliveryDate} onChange={(value) => setFormData({ ...formData, expectedDeliveryDate: value })} />
                <NumberField label="进度" value={formData.progress} onChange={(value) => setFormData({ ...formData, progress: Number(value) || 0 })} />
                <NumberField label="预计天数" value={formData.estimatedDays} onChange={(value) => setFormData({ ...formData, estimatedDays: value })} />
                <NumberField label="计划天数" value={formData.plannedDays} onChange={(value) => setFormData({ ...formData, plannedDays: value })} />
                <NumberField label="偏差天数" value={formData.gapDays} onChange={(value) => setFormData({ ...formData, gapDays: value })} />
                <NumberField label="偏差预算" value={formData.gapBudget} onChange={(value) => setFormData({ ...formData, gapBudget: value })} />
                <NumberField label="实际天数" value={formData.actualDays} onChange={(value) => setFormData({ ...formData, actualDays: value })} />
                <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                    }}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-slate-600"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-2.5 font-medium text-white"
                  >
                    {editingItem ? '保存' : '创建'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200/50 bg-white p-5 shadow-lg">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-bold text-slate-800">{value}</div>
    </div>
  );
}

function baseInputClass(className?: string) {
  return `w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${className || ''}`;
}

function TextField({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        className={baseInputClass()}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={className}>
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className={baseInputClass()}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | '';
  onChange: (value: number | '') => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value === '' ? '' : Number(event.target.value))}
        className={baseInputClass()}
      />
    </label>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      <input type="date" value={value} onChange={(event) => onChange(event.target.value)} className={baseInputClass()} />
    </label>
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
  onChange: (value: any) => void;
  options: readonly string[];
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={baseInputClass()}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function MemberSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  options: Array<{ value: number; label: string }>;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
        className={baseInputClass()}
      >
        <option value="">未设置</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
