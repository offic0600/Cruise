'use client';

import { useState, useEffect } from 'react';
import { getSkills, getSkillAnalytics, createSkill, updateSkill, deleteSkill, addExternalSkill } from '@/lib/api';

interface Skill {
  id: number;
  name: string;
  description: string;
  category: string;
  status: string;
  intentPatterns?: string;
  parameters?: string;
  outputSchema?: string;
  executionCount: number;
  successRate: number;
  avgExecutionTimeMs: number;
  version?: string;
}

interface Analytics {
  name: string;
  executionCount: number;
  successRate: number;
  avgExecutionTimeMs: number;
  totalExecutions: number;
  successCount: number;
}

const CATEGORIES = [
  { value: 'ANALYSIS', label: '数据分析' },
  { value: 'TASK_MANAGEMENT', label: '任务管理' },
  { value: 'RISK_MANAGEMENT', label: '风险管理' },
  { value: 'TEAM_MANAGEMENT', label: '团队管理' },
  { value: 'EVOLUTION', label: '持续进化' },
  { value: 'VISUALIZATION', label: '可视化' },
  { value: 'HELPER', label: '助手' },
  { value: 'GENERAL', label: '通用' },
  { value: 'EXTERNAL', label: '外部' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: '启用' },
  { value: 'INACTIVE', label: '禁用' },
];

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState<'create' | 'edit' | 'external' | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'GENERAL',
    intentPatterns: '',
    parameters: '',
    outputSchema: '',
    externalUrl: '',
    apiKey: '',
  });

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const data = await getSkills();
      setSkills(data);
    } catch (err) {
      console.error('Failed to load skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillClick = async (skill: Skill) => {
    setSelectedSkill(skill);
    try {
      const data = await getSkillAnalytics(skill.name);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setAnalytics(null);
    }
  };

  const openCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      category: 'GENERAL',
      intentPatterns: '',
      parameters: '',
      outputSchema: '',
      externalUrl: '',
      apiKey: '',
    });
    setError('');
    setShowModal('create');
  };

  const openEditModal = () => {
    if (!selectedSkill) return;
    setFormData({
      name: selectedSkill.name,
      description: selectedSkill.description || '',
      category: selectedSkill.category || 'GENERAL',
      intentPatterns: selectedSkill.intentPatterns || '',
      parameters: selectedSkill.parameters || '',
      outputSchema: selectedSkill.outputSchema || '',
      externalUrl: '',
      apiKey: '',
    });
    setError('');
    setShowModal('edit');
  };

  const openExternalModal = () => {
    setFormData({
      name: '',
      description: '',
      category: 'EXTERNAL',
      intentPatterns: '',
      parameters: '',
      outputSchema: '',
      externalUrl: '',
      apiKey: '',
    });
    setError('');
    setShowModal('external');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setError('');

    try {
      if (showModal === 'create') {
        await createSkill({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          intentPatterns: formData.intentPatterns,
          parameters: formData.parameters || undefined,
          outputSchema: formData.outputSchema || undefined,
        });
      } else if (showModal === 'edit' && selectedSkill) {
        await updateSkill(selectedSkill.name, {
          description: formData.description,
          category: formData.category,
          intentPatterns: formData.intentPatterns,
          parameters: formData.parameters || undefined,
          outputSchema: formData.outputSchema || undefined,
        });
      } else if (showModal === 'external') {
        await addExternalSkill({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          externalUrl: formData.externalUrl,
          apiKey: formData.apiKey || undefined,
        });
      }
      await loadSkills();
      setShowModal(null);
    } catch (err: any) {
      setError(err.response?.data?.message || '操作失败');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSkill || !confirm(`确定要删除技能 "${selectedSkill.name}" 吗？`)) return;

    try {
      await deleteSkill(selectedSkill.name);
      await loadSkills();
      setSelectedSkill(null);
      setAnalytics(null);
    } catch (err) {
      alert('删除失败');
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      ANALYSIS: 'bg-blue-100 text-blue-800',
      TASK_MANAGEMENT: 'bg-green-100 text-green-800',
      RISK_MANAGEMENT: 'bg-red-100 text-red-800',
      TEAM_MANAGEMENT: 'bg-purple-100 text-purple-800',
      EVOLUTION: 'bg-yellow-100 text-yellow-800',
      VISUALIZATION: 'bg-cyan-100 text-cyan-800',
      HELPER: 'bg-gray-100 text-gray-800',
      GENERAL: 'bg-gray-100 text-gray-800',
      EXTERNAL: 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string): string => {
    return status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">技能管理</h1>
          <div className="flex gap-2">
            <button
              onClick={openExternalModal}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              添加外部技能
            </button>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              添加自定义技能
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skills List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">可用技能 ({skills.length})</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  onClick={() => handleSkillClick(skill)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedSkill?.id === skill.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{skill.name}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{skill.description}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <span className={`px-2 py-0.5 text-xs rounded ${getCategoryColor(skill.category || '')}`}>
                      {skill.category}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(skill.status)}`}>
                      {skill.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Details */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            {selectedSkill ? (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedSkill.name}</h2>
                    <p className="text-gray-500 mt-1">{selectedSkill.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={openEditModal}
                      className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      编辑
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      删除
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">分类</label>
                    <p className="text-gray-800">{selectedSkill.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">状态</label>
                    <p className="text-gray-800">{selectedSkill.status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">版本</label>
                    <p className="text-gray-800">{selectedSkill.version || '1.0.0'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">执行次数</label>
                    <p className="text-gray-800">{selectedSkill.executionCount}</p>
                  </div>
                </div>

                {/* 详细信息 */}
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">意图模式</label>
                    <pre className="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-700 overflow-x-auto">
                      {selectedSkill.intentPatterns || '无'}
                    </pre>
                  </div>
                  {selectedSkill.parameters && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">参数</label>
                      <pre className="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-700 overflow-x-auto">
                        {selectedSkill.parameters}
                      </pre>
                    </div>
                  )}
                  {selectedSkill.outputSchema && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">输出模式</label>
                      <pre className="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-700 overflow-x-auto">
                        {selectedSkill.outputSchema}
                      </pre>
                    </div>
                  )}
                </div>

                {/* 执行统计 */}
                {analytics && (
                  <div className="border-t pt-4 mt-6">
                    <h3 className="font-medium mb-3">执行统计</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-2xl font-bold text-blue-600">{analytics.executionCount}</div>
                        <div className="text-sm text-gray-500">总执行次数</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-2xl font-bold text-green-600">{(analytics.successRate * 100).toFixed(0)}%</div>
                        <div className="text-sm text-gray-500">成功率</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-2xl font-bold text-purple-600">{analytics.avgExecutionTimeMs}ms</div>
                        <div className="text-sm text-gray-500">平均执行时间</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-2xl font-bold text-orange-600">{analytics.successCount}</div>
                        <div className="text-sm text-gray-500">成功次数</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 py-12">
                点击左侧技能查看详情
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {showModal === 'create' && '添加自定义技能'}
              {showModal === 'edit' && '编辑技能'}
              {showModal === 'external' && '添加外部技能'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {showModal !== 'edit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">技能名称</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!!showModal && showModal !== 'create' && showModal !== 'external'}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {showModal !== 'external' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">意图模式 (逗号分隔)</label>
                    <input
                      type="text"
                      value={formData.intentPatterns}
                      onChange={(e) => setFormData({ ...formData, intentPatterns: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="查询,搜索,query"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">参数 (JSON)</label>
                    <textarea
                      value={formData.parameters}
                      onChange={(e) => setFormData({ ...formData, parameters: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      rows={3}
                      placeholder='{"param1": "type"}'
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">输出模式 (JSON)</label>
                    <textarea
                      value={formData.outputSchema}
                      onChange={(e) => setFormData({ ...formData, outputSchema: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      rows={3}
                      placeholder='{"output": "type"}'
                    />
                  </div>
                </>
              )}

              {showModal === 'external' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">外部 API URL</label>
                    <input
                      type="url"
                      value={formData.externalUrl}
                      onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://api.example.com/skill"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key (可选)</label>
                    <input
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="可选"
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {modalLoading ? '提交中...' : '提交'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
