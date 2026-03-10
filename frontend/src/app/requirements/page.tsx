'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { getRequirements, createRequirement, updateRequirement, deleteRequirement, getTeamMembers, getRequirementTags } from '@/lib/api';

interface Requirement {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  projectId: number;
  teamId: number | null;
  plannedStartDate: string | null;
  expectedDeliveryDate: string | null;
  requirementOwnerId: number | null;
  productOwnerId: number | null;
  devOwnerId: number | null;
  devParticipants: string | null;
  testOwnerId: number | null;
  progress: number;
  tags: string | null;
  estimatedDays: number | null;
  plannedDays: number | null;
  gapDays: number | null;
  gapBudget: number | null;
  actualDays: number | null;
  applicationCodes: string | null;
  vendors: string | null;
  vendorStaff: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: number;
  name: string;
}

interface RequirementTag {
  id: number;
  name: string;
  color: string;
}

const statusOptions = ['NEW', 'IN_PROGRESS', 'TESTING', 'COMPLETED', 'CANCELLED'];
const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const defaultFormData = {
  title: '',
  description: '',
  status: 'NEW',
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
  estimatedDays: null as number | null,
  plannedDays: null as number | null,
  gapDays: null as number | null,
  gapBudget: null as number | null,
  actualDays: null as number | null,
  applicationCodes: '',
  vendors: '',
  vendorStaff: '',
};

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tags, setTags] = useState<RequirementTag[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Requirement | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reqs, members, tagsData] = await Promise.all([
        getRequirements(),
        getTeamMembers(),
        getRequirementTags(),
      ]);
      setRequirements(Array.isArray(reqs) ? reqs : []);
      setTeamMembers(Array.isArray(members) ? members : []);
      setTags(Array.isArray(tagsData) ? tagsData : []);
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
        expectedDeliveryDate: formData.expectedDeliveryDate || null,
      };
      if (editingItem) {
        await updateRequirement(editingItem.id, data);
      } else {
        await createRequirement(data);
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
      await deleteRequirement(id);
      loadData();
    } catch (err) {
      console.error('删除失败', err);
    }
  };

  const openEdit = (item: Requirement) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      status: item.status,
      priority: item.priority,
      projectId: item.projectId,
      teamId: item.teamId,
      plannedStartDate: item.plannedStartDate || '',
      expectedDeliveryDate: item.expectedDeliveryDate || '',
      requirementOwnerId: item.requirementOwnerId,
      productOwnerId: item.productOwnerId,
      devOwnerId: item.devOwnerId,
      devParticipants: item.devParticipants || '',
      testOwnerId: item.testOwnerId,
      progress: item.progress,
      tags: item.tags || '',
      estimatedDays: item.estimatedDays,
      plannedDays: item.plannedDays,
      gapDays: item.gapDays,
      gapBudget: item.gapBudget,
      actualDays: item.actualDays,
      applicationCodes: item.applicationCodes || '',
      vendors: item.vendors || '',
      vendorStaff: item.vendorStaff || '',
    });
    setShowModal(true);
  };

  // 过滤需求
  const filteredRequirements = React.useMemo(() => {
    if (!searchText) return requirements;
    try {
      const search = searchText.toLowerCase();
      return requirements.filter(req => {
        if (!req) return false;
        const titleMatch = req.title?.toLowerCase().includes(search) ?? false;
        const descMatch = req.description?.toLowerCase().includes(search) ?? false;
        const statusMatch = req.status?.toLowerCase().includes(search) ?? false;
        const priorityMatch = req.priority?.toLowerCase().includes(search) ?? false;
        const tagsMatch = req.tags?.toLowerCase().includes(search) ?? false;
        return titleMatch || descMatch || statusMatch || priorityMatch || tagsMatch;
      });
    } catch (e) {
      console.error('搜索过滤失败:', e);
      return requirements;
    }
  }, [requirements, searchText]);

  const getMemberName = (id: number | null) => {
    if (!id) return '-';
    const member = teamMembers.find((m) => m.id === id);
    return member?.name || '-';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: 'bg-slate-100 text-slate-700 ring-slate-200',
      IN_PROGRESS: 'bg-blue-100 text-blue-700 ring-blue-200',
      TESTING: 'bg-amber-100 text-amber-700 ring-amber-200',
      COMPLETED: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
      CANCELLED: 'bg-rose-100 text-rose-700 ring-rose-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'text-slate-500',
      MEDIUM: 'text-amber-600',
      HIGH: 'text-orange-500',
      CRITICAL: 'text-rose-600',
    };
    return colors[priority] || 'text-slate-500';
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
  const tagOptions = tags.map((t) => ({ value: t.id, label: t.name }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">需求管理</h1>
            <p className="text-slate-500 text-sm mt-1">管理项目需求和优先级</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="搜索需求..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
            <button
              onClick={() => alert('ALM接口待开发')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-5 py-2.5 rounded-xl hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/30 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              拉取ALM需求
            </button>
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
              新建需求
            </button>
          </div>
          </div>
        </div>

        {/* 需求列表 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/50">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">标题</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">优先级</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">需求负责人</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">进度</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">计划开始</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">期望交付</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200/50">
                {filteredRequirements.map((item) => (
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
                    <td className="px-4 py-3">
                      <span className={`font-semibold text-xs ${getPriorityColor(item.priority)}`}>{item.priority}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{getMemberName(item.requirementOwnerId)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${item.progress}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{item.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.plannedStartDate || '-'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.expectedDeliveryDate || '-'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">编辑</button>
                      <button onClick={() => handleDelete(item.id)} className="text-rose-600 hover:text-rose-800 text-sm font-medium">删除</button>
                    </td>
                  </tr>
                ))}
                {filteredRequirements.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <div className="text-slate-400">
                        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p>暂无需求数据</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">{editingItem ? '编辑需求' : '新建需求'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* 基本信息 */}
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">基本信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">需求标题 *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">需求描述</label>
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">优先级</label>
                    {renderSelect('priority', formData.priority, priorityOptions.map(p => ({ value: p, label: p })), '请选择优先级')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">需求标签</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="多个标签用逗号分隔"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">进度 (%)</label>
                    <input
                      type="number"
                      value={formData.progress}
                      onChange={(e) => handleInputChange('progress', parseInt(e.target.value) || 0)}
                      min={0}
                      max={100}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 时间计划 */}
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">时间计划</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">期望交付时间</label>
                    <input
                      type="date"
                      value={formData.expectedDeliveryDate}
                      onChange={(e) => handleInputChange('expectedDeliveryDate', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 人员角色 */}
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">人员角色</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">归属小微</label>
                    {renderSelect('teamId', formData.teamId, memberOptions, '请选择归属小微')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">需求负责人</label>
                    {renderSelect('requirementOwnerId', formData.requirementOwnerId, memberOptions, '请选择需求负责人')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">产品负责人</label>
                    {renderSelect('productOwnerId', formData.productOwnerId, memberOptions, '请选择产品负责人')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">开发负责人</label>
                    {renderSelect('devOwnerId', formData.devOwnerId, memberOptions, '请选择开发负责人')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">测试负责人</label>
                    {renderSelect('testOwnerId', formData.testOwnerId, memberOptions, '请选择测试负责人')}
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">开发参与人</label>
                    <input
                      type="text"
                      value={formData.devParticipants}
                      onChange={(e) => handleInputChange('devParticipants', e.target.value)}
                      placeholder="多个参与人用逗号分隔"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 人天估算 */}
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">人天估算</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">需求评估人天</label>
                    <input
                      type="number"
                      value={formData.estimatedDays ?? ''}
                      onChange={(e) => handleInputChange('estimatedDays', e.target.value ? parseFloat(e.target.value) : null)}
                      step={0.5}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">需求计划人天</label>
                    <input
                      type="number"
                      value={formData.plannedDays ?? ''}
                      onChange={(e) => handleInputChange('plannedDays', e.target.value ? parseFloat(e.target.value) : null)}
                      step={0.5}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">需求交付实际人天</label>
                    <input
                      type="number"
                      value={formData.actualDays ?? ''}
                      onChange={(e) => handleInputChange('actualDays', e.target.value ? parseFloat(e.target.value) : null)}
                      step={0.5}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">需求缺口人天</label>
                    <input
                      type="number"
                      value={formData.gapDays ?? ''}
                      onChange={(e) => handleInputChange('gapDays', e.target.value ? parseFloat(e.target.value) : null)}
                      step={0.5}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">需求缺口预算</label>
                    <input
                      type="number"
                      value={formData.gapBudget ?? ''}
                      onChange={(e) => handleInputChange('gapBudget', e.target.value ? parseFloat(e.target.value) : null)}
                      step={0.01}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 供应商信息 */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">供应商信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">涉及应用S码</label>
                    <input
                      type="text"
                      value={formData.applicationCodes}
                      onChange={(e) => handleInputChange('applicationCodes', e.target.value)}
                      placeholder="多个用逗号分隔"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">参与供应商</label>
                    <input
                      type="text"
                      value={formData.vendors}
                      onChange={(e) => handleInputChange('vendors', e.target.value)}
                      placeholder="多个用逗号分隔"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">参与供应商人员</label>
                    <input
                      type="text"
                      value={formData.vendorStaff}
                      onChange={(e) => handleInputChange('vendorStaff', e.target.value)}
                      placeholder="多个用逗号分隔"
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
    </AppLayout>
  );
}
