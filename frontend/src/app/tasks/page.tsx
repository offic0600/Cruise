'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  FeatureIssue,
  TaskIssue,
  createTaskIssue,
  deleteIssue,
  getFeatureIssues,
  getTaskIssues,
  getTeamMembers,
  logTaskIssueHours,
  updateTaskIssue,
} from '@/lib/api';

interface TeamMember {
  id: number;
  name: string;
}

const stateOptions = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELED'] as const;

const defaultFormData = {
  title: '',
  description: '',
  state: 'TODO',
  requirementId: 0,
  assigneeId: null as number | null,
  progress: 0,
  teamId: null as number | null,
  plannedStartDate: '',
  plannedEndDate: '',
  estimatedDays: '' as number | '',
  plannedDays: '' as number | '',
  remainingDays: '' as number | '',
  estimatedHours: 0,
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskIssue[]>([]);
  const [features, setFeatures] = useState<FeatureIssue[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TaskIssue | null>(null);
  const [loggingTask, setLoggingTask] = useState<TaskIssue | null>(null);
  const [hours, setHours] = useState(0);
  const [formData, setFormData] = useState(defaultFormData);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    try {
      const [taskList, featureList, members] = await Promise.all([
        getTaskIssues(),
        getFeatureIssues(),
        getTeamMembers(),
      ]);
      setTasks(Array.isArray(taskList) ? taskList : []);
      setFeatures(Array.isArray(featureList) ? featureList : []);
      setTeamMembers(Array.isArray(members) ? members : []);
      if (!editingItem && featureList.length > 0 && !formData.requirementId) {
        setFormData((current) => ({ ...current, requirementId: featureList[0].id }));
      }
    } catch (error) {
      console.error('加载任务失败', error);
    }
  };

  const filteredTasks = useMemo(() => {
    if (!searchText.trim()) return tasks;
    const keyword = searchText.toLowerCase();
    return tasks.filter((task) =>
      [task.title, task.description, task.state]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(keyword))
    );
  }, [tasks, searchText]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.requirementId) return;

    const payload = {
      title: formData.title,
      description: formData.description || undefined,
      status: formData.state,
      requirementId: formData.requirementId,
      assigneeId: formData.assigneeId,
      progress: formData.progress,
      teamId: formData.teamId,
      plannedStartDate: formData.plannedStartDate || null,
      plannedEndDate: formData.plannedEndDate || null,
      estimatedDays: formData.estimatedDays === '' ? null : Number(formData.estimatedDays),
      plannedDays: formData.plannedDays === '' ? null : Number(formData.plannedDays),
      remainingDays: formData.remainingDays === '' ? null : Number(formData.remainingDays),
      estimatedHours: Number(formData.estimatedHours) || 0,
    };

    try {
      if (editingItem) {
        await updateTaskIssue(editingItem.id, payload);
      } else {
        await createTaskIssue(payload);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({
        ...defaultFormData,
        requirementId: features[0]?.id || 0,
      });
      await loadData();
    } catch (error) {
      console.error('保存任务失败', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确认删除这条任务吗？')) return;
    try {
      await deleteIssue(id);
      await loadData();
    } catch (error) {
      console.error('删除任务失败', error);
    }
  };

  const handleLogHours = async () => {
    if (!loggingTask || hours <= 0) return;
    try {
      await logTaskIssueHours(loggingTask.id, hours);
      setShowHoursModal(false);
      setLoggingTask(null);
      setHours(0);
      await loadData();
    } catch (error) {
      console.error('记录工时失败', error);
    }
  };

  const openEdit = (task: TaskIssue) => {
    setEditingItem(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      state: task.state,
      requirementId: task.requirementId || features[0]?.id || 0,
      assigneeId: task.assigneeId,
      progress: task.progress,
      teamId: task.teamId,
      plannedStartDate: task.plannedStartDate || '',
      plannedEndDate: task.plannedEndDate || '',
      estimatedDays: task.estimatedDays ?? '',
      plannedDays: task.plannedDays ?? '',
      remainingDays: task.remainingDays ?? '',
      estimatedHours: task.estimatedHours,
    });
    setShowModal(true);
  };

  const openLogHours = (task: TaskIssue) => {
    setLoggingTask(task);
    setHours(0);
    setShowHoursModal(true);
  };

  const getFeatureTitle = (id: number | null) =>
    features.find((item) => item.id === id)?.title || '-';

  const getMemberName = (id: number | null) =>
    teamMembers.find((member) => member.id === id)?.name || '-';

  const statusClasses: Record<string, string> = {
    TODO: 'bg-slate-100 text-slate-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    IN_REVIEW: 'bg-amber-100 text-amber-700',
    DONE: 'bg-emerald-100 text-emerald-700',
    CANCELED: 'bg-rose-100 text-rose-700',
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">任务视图</h1>
            <p className="mt-1 text-sm text-slate-500">基于统一 Issue 模型的 TASK 视图</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="搜索任务"
              className="w-64 rounded-xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              onClick={() => {
                setEditingItem(null);
                setFormData({
                  ...defaultFormData,
                  requirementId: features[0]?.id || 0,
                });
                setShowModal(true);
              }}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-600 hover:to-cyan-600"
            >
              新建任务
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <SummaryCard title="总任务数" value={tasks.length} />
          <SummaryCard title="待处理" value={tasks.filter((item) => item.state === 'TODO').length} />
          <SummaryCard title="进行中" value={tasks.filter((item) => item.state === 'IN_PROGRESS').length} />
          <SummaryCard title="已完成" value={tasks.filter((item) => item.state === 'DONE').length} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-lg">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-sm text-slate-600">
                <th className="px-6 py-4">任务</th>
                <th className="px-6 py-4">所属需求</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4">负责人</th>
                <th className="px-6 py-4">进度</th>
                <th className="px-6 py-4">工时</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{task.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{task.identifier}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{getFeatureTitle(task.requirementId)}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${statusClasses[task.state] || statusClasses.TODO}`}>
                      {task.state}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{getMemberName(task.assigneeId)}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{task.progress}%</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {task.actualHours} / {task.estimatedHours} h
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button onClick={() => openLogHours(task)} className="mr-3 text-amber-600 hover:text-amber-800">
                      记工时
                    </button>
                    <button onClick={() => openEdit(task)} className="mr-3 text-blue-600 hover:text-blue-800">
                      编辑
                    </button>
                    <button onClick={() => void handleDelete(task.id)} className="text-rose-600 hover:text-rose-800">
                      删除
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    暂无任务数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-800">{editingItem ? '编辑任务' : '新建任务'}</h2>
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
                <SelectNumberField
                  label="所属需求"
                  value={formData.requirementId}
                  onChange={(value) => setFormData({ ...formData, requirementId: value || 0 })}
                  options={features.map((item) => ({ value: item.id, label: item.title }))}
                />
                <SelectNumberField
                  label="负责人"
                  value={formData.assigneeId}
                  onChange={(value) => setFormData({ ...formData, assigneeId: value })}
                  options={teamMembers.map((member) => ({ value: member.id, label: member.name }))}
                  allowEmpty
                />
                <NumberField label="进度" value={formData.progress} onChange={(value) => setFormData({ ...formData, progress: Number(value) || 0 })} />
                <NumberField label="团队 ID" value={formData.teamId ?? ''} onChange={(value) => setFormData({ ...formData, teamId: value === '' ? null : Number(value) })} />
                <DateField label="计划开始" value={formData.plannedStartDate} onChange={(value) => setFormData({ ...formData, plannedStartDate: value })} />
                <DateField label="计划完成" value={formData.plannedEndDate} onChange={(value) => setFormData({ ...formData, plannedEndDate: value })} />
                <NumberField label="预计天数" value={formData.estimatedDays} onChange={(value) => setFormData({ ...formData, estimatedDays: value })} />
                <NumberField label="计划天数" value={formData.plannedDays} onChange={(value) => setFormData({ ...formData, plannedDays: value })} />
                <NumberField label="剩余天数" value={formData.remainingDays} onChange={(value) => setFormData({ ...formData, remainingDays: value })} />
                <NumberField label="预估工时" value={formData.estimatedHours} onChange={(value) => setFormData({ ...formData, estimatedHours: Number(value) || 0 })} />
                <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-slate-600">
                    取消
                  </button>
                  <button type="submit" className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-2.5 font-medium text-white">
                    {editingItem ? '保存' : '创建'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showHoursModal && loggingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-800">记录工时</h2>
              </div>
              <div className="space-y-4 p-6">
                <div className="text-sm text-slate-600">
                  <div className="font-medium text-slate-800">{loggingTask.title}</div>
                  <div className="mt-1">当前已记录 {loggingTask.actualHours} 小时</div>
                </div>
                <NumberField label="新增工时" value={hours} onChange={(value) => setHours(Number(value) || 0)} />
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowHoursModal(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-slate-600">
                    取消
                  </button>
                  <button type="button" onClick={() => void handleLogHours()} className="rounded-xl bg-amber-500 px-5 py-2.5 font-medium text-white">
                    保存
                  </button>
                </div>
              </div>
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

function inputClass() {
  return 'w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';
}

function TextField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      <input value={value} onChange={(event) => onChange(event.target.value)} required={required} className={inputClass()} />
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
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className={inputClass()} />
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
        className={inputClass()}
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
      <input type="date" value={value} onChange={(event) => onChange(event.target.value)} className={inputClass()} />
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
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass()}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SelectNumberField({
  label,
  value,
  onChange,
  options,
  allowEmpty,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  options: Array<{ value: number; label: string }>;
  allowEmpty?: boolean;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
        className={inputClass()}
      >
        {allowEmpty && <option value="">未设置</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
