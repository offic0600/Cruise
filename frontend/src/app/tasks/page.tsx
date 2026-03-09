'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { getTasks, createTask, updateTask, deleteTask, logTaskHours, getTeamMembers, getRequirements } from '@/lib/api';

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  requirementId: number;
  assigneeId: number | null;
  progress: number;
  teamId: number | null;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  estimatedDays: number | null;
  plannedDays: number | null;
  remainingDays: number | null;
  estimatedHours: number;
  actualHours: number;
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: number;
  name: string;
}

interface Requirement {
  id: number;
  title: string;
}

const statusOptions = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const defaultFormData = {
  title: '',
  description: '',
  status: 'PENDING',
  requirementId: 1,
  assigneeId: null as number | null,
  progress: 0,
  teamId: null as number | null,
  plannedStartDate: '',
  plannedEndDate: '',
  estimatedDays: null as number | null,
  plannedDays: null as number | null,
  remainingDays: null as number | null,
  estimatedHours: 0,
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Task | null>(null);
  const [loggingTask, setLoggingTask] = useState<Task | null>(null);
  const [hours, setHours] = useState(0);
  const [formData, setFormData] = useState(defaultFormData);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksData, membersData, reqsData] = await Promise.all([
        getTasks(),
        getTeamMembers(),
        getRequirements(),
      ]);
      setTasks(tasksData);
      setTeamMembers(membersData);
      setRequirements(reqsData);
    } catch (err) {
      console.error('加载失败', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        plannedStartDate: formData.plannedStartDate || null,
        plannedEndDate: formData.plannedEndDate || null,
      };
      if (editingItem) {
        await updateTask(editingItem.id, data);
      } else {
        await createTask(data);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData(defaultFormData);
      loadData();
    } catch (err) {
      console.error('操作失败', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除？')) return;
    try {
      await deleteTask(id);
      loadData();
    } catch (err) {
      console.error('删除失败', err);
    }
  };

  const handleLogHours = async () => {
    if (!loggingTask) return;
    try {
      await logTaskHours(loggingTask.id, hours);
      setShowHoursModal(false);
      setLoggingTask(null);
      setHours(0);
      loadData();
    } catch (err) {
      console.error('记录工时失败', err);
    }
  };

  const openEdit = (item: Task) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      status: item.status,
      requirementId: item.requirementId,
      assigneeId: item.assigneeId,
      progress: item.progress,
      teamId: item.teamId,
      plannedStartDate: item.plannedStartDate || '',
      plannedEndDate: item.plannedEndDate || '',
      estimatedDays: item.estimatedDays,
      plannedDays: item.plannedDays,
      remainingDays: item.remainingDays,
      estimatedHours: item.estimatedHours,
    });
    setShowModal(true);
  };

  const openLogHours = (item: Task) => {
    setLoggingTask(item);
    setHours(item.actualHours);
    setShowHoursModal(true);
  };

  // 过滤任务
  const filteredTasks = React.useMemo(() => {
    if (!searchText) return tasks;
    try {
      const search = searchText.toLowerCase();
      return tasks.filter(task => {
        if (!task) return false;
        const titleMatch = task.title?.toLowerCase().includes(search) ?? false;
        const descMatch = task.description?.toLowerCase().includes(search) ?? false;
        const statusMatch = task.status?.toLowerCase().includes(search) ?? false;
        return titleMatch || descMatch || statusMatch;
      });
    } catch (e) {
      console.error('搜索过滤失败:', e);
      return tasks;
    }
  }, [tasks, searchText]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-slate-100 text-slate-700 ring-slate-200',
      IN_PROGRESS: 'bg-blue-100 text-blue-700 ring-blue-200',
      COMPLETED: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
      CANCELLED: 'bg-rose-100 text-rose-700 ring-rose-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getMemberName = (id: number | null) => {
    if (!id) return '-';
    const member = teamMembers.find((m) => m.id === id);
    return member?.name || '-';
  };

  const getRequirementTitle = (id: number) => {
    const req = requirements.find((r) => r.id === id);
    return req?.title || `需求 #${id}`;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderSelect = (field: string, value: any, options: { value: any; label: string }[], placeholder = '请选择') => (
    <select
      value={value ?? ''}
      onChange={(e) => handleInputChange(field, e.target.value ? Number(e.target.value) : null)}
      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );

  const memberOptions = teamMembers.map((m) => ({ value: m.id, label: m.name }));
  const requirementOptions = requirements.map((r) => ({ value: r.id, label: r.title }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">任务管理</h1>
            <p className="text-slate-500 text-sm mt-1">跟踪和管理开发任务</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="搜索任务..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setFormData(defaultFormData);
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建任务
            </button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/50">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">任务标题</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">关联需求</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">开发人员</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">进度</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">计划开始</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">计划完成</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200/50">
                {filteredTasks.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-500">{item.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 text-sm max-w-xs truncate">{item.title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">{getRequirementTitle(item.requirementId)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{getMemberName(item.assigneeId)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${item.progress}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{item.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.plannedStartDate || '-'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.plannedEndDate || '-'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">编辑</button>
                      <button onClick={() => handleDelete(item.id)} className="text-rose-600 hover:text-rose-800 text-sm font-medium">删除</button>
                    </td>
                  </tr>
                ))}
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <div className="text-slate-400">
                        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>暂无任务数据</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 新建/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">{editingItem ? '编辑任务' : '新建任务'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* 基本信息 */}
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">基本信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">任务标题 *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">任务描述</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
                    {renderSelect('status', formData.status, statusOptions.map(s => ({ value: s, label: s })), '请选择状态')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">开发进度 (%)</label>
                    <input
                      type="number"
                      value={formData.progress}
                      onChange={(e) => handleInputChange('progress', parseInt(e.target.value) || 0)}
                      min={0}
                      max={100}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">关联需求</label>
                    {renderSelect('requirementId', formData.requirementId, requirementOptions, '请选择关联需求')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">开发人员</label>
                    {renderSelect('assigneeId', formData.assigneeId, memberOptions, '请选择开发人员')}
                  </div>
                </div>
              </div>

              {/* 团队和时间 */}
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">团队与时间</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">所属团队</label>
                    {renderSelect('teamId', formData.teamId, memberOptions.map(m => ({ value: m.value, label: m.label + ' Team' })), '请选择团队')}
                  </div>
                  <div></div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">计划开始时间</label>
                    <input
                      type="date"
                      value={formData.plannedStartDate}
                      onChange={(e) => handleInputChange('plannedStartDate', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">计划完成时间</label>
                    <input
                      type="date"
                      value={formData.plannedEndDate}
                      onChange={(e) => handleInputChange('plannedEndDate', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 人天估算 */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">人天估算</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">任务评估人天</label>
                    <input
                      type="number"
                      value={formData.estimatedDays ?? ''}
                      onChange={(e) => handleInputChange('estimatedDays', e.target.value ? parseFloat(e.target.value) : null)}
                      step={0.5}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">任务计划人天</label>
                    <input
                      type="number"
                      value={formData.plannedDays ?? ''}
                      onChange={(e) => handleInputChange('plannedDays', e.target.value ? parseFloat(e.target.value) : null)}
                      step={0.5}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">剩余人天</label>
                    <input
                      type="number"
                      value={formData.remainingDays ?? ''}
                      onChange={(e) => handleInputChange('remainingDays', e.target.value ? parseFloat(e.target.value) : null)}
                      step={0.5}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                >
                  取消
                </button>
                <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all font-medium shadow-lg shadow-blue-500/30">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 工时弹窗 */}
      {showHoursModal && loggingTask && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white">记录工时</h2>
            </div>
            <div className="p-6">
              <p className="text-slate-600 mb-4">{loggingTask.title}</p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">实际工时（小时）</label>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  min={0}
                  step={0.5}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowHoursModal(false)}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                >
                  取消
                </button>
                <button onClick={handleLogHours} className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all font-medium shadow-lg shadow-amber-500/30">
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
