'use client';

import { ReactNode, useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  BugIssue,
  TaskIssue,
  createBugIssue,
  deleteIssue,
  getBugIssues,
  getTaskIssues,
  updateBugIssue,
  updateIssueState,
} from '@/lib/api';

const stateOptions = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELED'] as const;
const severityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export default function DefectsPage() {
  const [defects, setDefects] = useState<BugIssue[]>([]);
  const [tasks, setTasks] = useState<TaskIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDefect, setEditingDefect] = useState<BugIssue | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM',
    projectId: 1,
    taskId: '' as string | number,
  });

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bugList, taskList] = await Promise.all([getBugIssues(), getTaskIssues()]);
      setDefects(Array.isArray(bugList) ? bugList : []);
      setTasks(Array.isArray(taskList) ? taskList : []);
    } catch (error) {
      console.error('加载缺陷失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        severity: formData.severity,
        projectId: formData.projectId,
        taskId: formData.taskId ? Number(formData.taskId) : null,
      };

      if (editingDefect) {
        await updateBugIssue(editingDefect.id, payload);
      } else {
        await createBugIssue(payload);
      }

      setShowModal(false);
      setEditingDefect(null);
      setFormData({ title: '', description: '', severity: 'MEDIUM', projectId: 1, taskId: '' });
      await loadData();
    } catch (error) {
      console.error('保存缺陷失败', error);
    }
  };

  const handleStateChange = async (id: number, state: string) => {
    try {
      await updateIssueState(id, state);
      await loadData();
    } catch (error) {
      console.error('更新缺陷状态失败', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确认删除这条缺陷吗？')) return;
    try {
      await deleteIssue(id);
      await loadData();
    } catch (error) {
      console.error('删除缺陷失败', error);
    }
  };

  const getTaskTitle = (taskId: number | null) =>
    tasks.find((task) => task.id === taskId)?.title || '-';

  const severityClasses: Record<string, string> = {
    CRITICAL: 'bg-rose-100 text-rose-700',
    HIGH: 'bg-orange-100 text-orange-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    LOW: 'bg-emerald-100 text-emerald-700',
  };

  const stateClasses: Record<string, string> = {
    TODO: 'bg-slate-100 text-slate-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    IN_REVIEW: 'bg-amber-100 text-amber-700',
    DONE: 'bg-emerald-100 text-emerald-700',
    CANCELED: 'bg-rose-100 text-rose-700',
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center text-slate-500">加载中...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">缺陷视图</h1>
            <p className="mt-1 text-sm text-slate-500">基于统一 Issue 模型的 BUG 视图</p>
          </div>
          <button
            onClick={() => {
              setEditingDefect(null);
              setFormData({ title: '', description: '', severity: 'MEDIUM', projectId: 1, taskId: '' });
              setShowModal(true);
            }}
            className="rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-rose-500/30 transition hover:opacity-90"
          >
            新建缺陷
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <SummaryCard title="总缺陷" value={defects.length} />
          <SummaryCard title="待处理" value={defects.filter((item) => item.state === 'TODO').length} />
          <SummaryCard title="处理中" value={defects.filter((item) => item.state === 'IN_PROGRESS').length} />
          <SummaryCard title="待评审" value={defects.filter((item) => item.state === 'IN_REVIEW').length} />
          <SummaryCard title="严重" value={defects.filter((item) => item.severity === 'CRITICAL').length} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-lg">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-sm text-slate-600">
                <th className="px-6 py-4">缺陷</th>
                <th className="px-6 py-4">关联任务</th>
                <th className="px-6 py-4">严重级别</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4">创建时间</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {defects.map((defect) => (
                <tr key={defect.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{defect.title}</div>
                    {defect.description && <div className="mt-1 text-sm text-slate-500">{defect.description}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{getTaskTitle(defect.taskId)}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${severityClasses[defect.severity || 'MEDIUM']}`}>
                      {defect.severity || 'MEDIUM'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={defect.state}
                      onChange={(event) => void handleStateChange(defect.id, event.target.value)}
                      className={`rounded-lg border-0 px-2.5 py-1 text-xs font-semibold ${stateClasses[defect.state] || stateClasses.TODO}`}
                    >
                      {stateOptions.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(defect.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => {
                        setEditingDefect(defect);
                        setFormData({
                          title: defect.title,
                          description: defect.description || '',
                          severity: defect.severity || 'MEDIUM',
                          projectId: defect.projectId,
                          taskId: defect.taskId || '',
                        });
                        setShowModal(true);
                      }}
                      className="mr-3 text-blue-600 hover:text-blue-800"
                    >
                      编辑
                    </button>
                    <button onClick={() => void handleDelete(defect.id)} className="text-rose-600 hover:text-rose-800">
                      删除
                    </button>
                  </td>
                </tr>
              ))}
              {defects.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    暂无缺陷数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-800">{editingDefect ? '编辑缺陷' : '新建缺陷'}</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 p-6">
                <Field label="标题">
                  <input
                    required
                    value={formData.title}
                    onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                    className={inputClass()}
                  />
                </Field>
                <Field label="描述">
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                    className={inputClass()}
                  />
                </Field>
                <Field label="严重级别">
                  <select
                    value={formData.severity}
                    onChange={(event) => setFormData({ ...formData, severity: event.target.value })}
                    className={inputClass()}
                  >
                    {severityOptions.map((severity) => (
                      <option key={severity} value={severity}>
                        {severity}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="项目 ID">
                  <input
                    type="number"
                    value={formData.projectId}
                    onChange={(event) => setFormData({ ...formData, projectId: Number(event.target.value) || 1 })}
                    className={inputClass()}
                  />
                </Field>
                <Field label="关联任务">
                  <select
                    value={formData.taskId}
                    onChange={(event) => setFormData({ ...formData, taskId: event.target.value })}
                    className={inputClass()}
                  >
                    <option value="">未关联</option>
                    {tasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-slate-600">
                    取消
                  </button>
                  <button type="submit" className="rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-5 py-2.5 font-medium text-white">
                    {editingDefect ? '保存' : '创建'}
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

function inputClass() {
  return 'w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20';
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      {children}
    </label>
  );
}
