'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { getDefects, createDefect, updateDefect, updateDefectStatus, deleteDefect } from '@/lib/api';

interface Defect {
  id: number;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  projectId: number;
  taskId: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function DefectsPage() {
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDefect, setEditingDefect] = useState<Defect | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM',
    projectId: 1,
    taskId: '' as string | number
  });

  useEffect(() => {
    loadDefects();
  }, []);

  const loadDefects = async () => {
    try {
      const data = await getDefects();
      setDefects(data);
    } catch (err) {
      console.error('加载失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        taskId: formData.taskId ? Number(formData.taskId) : undefined
      };
      if (editingDefect) {
        await updateDefect(editingDefect.id, data);
      } else {
        await createDefect(data);
      }
      setShowModal(false);
      setEditingDefect(null);
      setFormData({ title: '', description: '', severity: 'MEDIUM', projectId: 1, taskId: '' });
      loadDefects();
    } catch (err) {
      console.error('操作失败', err);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateDefectStatus(id, status);
      loadDefects();
    } catch (err) {
      console.error('更新状态失败', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个缺陷吗？')) return;
    try {
      await deleteDefect(id);
      loadDefects();
    } catch (err) {
      console.error('删除失败', err);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-rose-100 text-rose-700';
      case 'HIGH': return 'bg-orange-100 text-orange-700';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700';
      case 'LOW': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-slate-100 text-slate-700';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
      case 'RESOLVED': return 'bg-amber-100 text-amber-700';
      case 'CLOSED': return 'bg-emerald-100 text-emerald-700';
      case 'REOPENED': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // 统计数据
  const total = defects.length;
  const open = defects.filter(d => d.status === 'OPEN').length;
  const inProgress = defects.filter(d => d.status === 'IN_PROGRESS').length;
  const resolved = defects.filter(d => d.status === 'RESOLVED').length;
  const closed = defects.filter(d => d.status === 'CLOSED').length;
  const critical = defects.filter(d => d.severity === 'CRITICAL').length;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">加载中...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">缺陷管理</h1>
            <p className="text-slate-500 text-sm mt-1">质量管理 - 缺陷追踪</p>
          </div>
          <button
            onClick={() => { setShowModal(true); setEditingDefect(null); setFormData({ title: '', description: '', severity: 'MEDIUM', projectId: 1, taskId: '' }); }}
            className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新增缺陷
          </button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-sm border border-slate-200/50 p-4">
            <p className="text-sm text-slate-500">总缺陷</p>
            <p className="text-2xl font-bold text-slate-800">{total}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-sm border border-slate-200/50 p-4">
            <p className="text-sm text-slate-500">待处理</p>
            <p className="text-2xl font-bold text-slate-700">{open}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-sm border border-slate-200/50 p-4">
            <p className="text-sm text-slate-500">处理中</p>
            <p className="text-2xl font-bold text-blue-600">{inProgress}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-sm border border-slate-200/50 p-4">
            <p className="text-sm text-slate-500">已解决</p>
            <p className="text-2xl font-bold text-amber-600">{resolved}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-sm border border-slate-200/50 p-4">
            <p className="text-sm text-slate-500">已关闭</p>
            <p className="text-2xl font-bold text-emerald-600">{closed}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-sm border border-slate-200/50 p-4">
            <p className="text-sm text-slate-500">严重</p>
            <p className="text-2xl font-bold text-rose-600">{critical}</p>
          </div>
        </div>

        {/* 缺陷列表 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">缺陷</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">严重程度</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">状态</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">创建时间</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {defects.map((defect) => (
                <tr key={defect.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{defect.title}</div>
                    {defect.description && (
                      <div className="text-sm text-slate-500 mt-0.5 line-clamp-1">{defect.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getSeverityColor(defect.severity)}`}>
                      {defect.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={defect.status}
                      onChange={(e) => handleStatusChange(defect.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border-0 cursor-pointer ${getStatusColor(defect.status)}`}
                    >
                      <option value="OPEN">待处理</option>
                      <option value="IN_PROGRESS">处理中</option>
                      <option value="RESOLVED">已解决</option>
                      <option value="CLOSED">已关闭</option>
                      <option value="REOPENED">重新打开</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(defect.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => { setEditingDefect(defect); setFormData({ title: defect.title, description: defect.description || '', severity: defect.severity, projectId: defect.projectId, taskId: defect.taskId || '' }); setShowModal(true); }}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(defect.id)}
                      className="text-rose-600 hover:text-rose-800"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
              {defects.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    暂无缺陷数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 弹窗 */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">
                  {editingDefect ? '编辑缺陷' : '新增缺陷'}
                </h3>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">标题</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">严重程度</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    <option value="LOW">低 (LOW)</option>
                    <option value="MEDIUM">中 (MEDIUM)</option>
                    <option value="HIGH">高 (HIGH)</option>
                    <option value="CRITICAL">严重 (CRITICAL)</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingDefect(null); }}
                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:opacity-90"
                  >
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
