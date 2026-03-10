'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from '@/lib/api';

interface TeamMember {
  id: number;
  name: string;
  email: string | null;
  role: string;
  skills: string | null;
  teamId: number | null;
  createdAt: string;
}

const roleOptions = ['DEVELOPER', 'TESTER', 'PM', 'LEAD', 'ARCHITECT'];

const roleColors: Record<string, string> = {
  DEVELOPER: 'from-blue-500 to-blue-600',
  TESTER: 'from-emerald-500 to-emerald-600',
  PM: 'from-purple-500 to-purple-600',
  LEAD: 'from-amber-500 to-amber-600',
  ARCHITECT: 'from-rose-500 to-rose-600',
};

export default function TeamMembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'DEVELOPER',
    skills: '',
    teamId: null as number | null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getTeamMembers();
      setMembers(data);
    } catch (err) {
      console.error('加载失败', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        email: formData.email || undefined,
        role: formData.role,
        skills: formData.skills || undefined,
        teamId: formData.teamId != null ? formData.teamId : undefined,
      };
      if (editingItem) {
        await updateTeamMember(editingItem.id, data);
      } else {
        await createTeamMember(data);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({ name: '', email: '', role: 'DEVELOPER', skills: '', teamId: null });
      loadData();
    } catch (err) {
      console.error('操作失败', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除？')) return;
    try {
      await deleteTeamMember(id);
      loadData();
    } catch (err) {
      console.error('删除失败', err);
    }
  };

  const openEdit = (item: TeamMember) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      email: item.email || '',
      role: item.role,
      skills: item.skills || '',
      teamId: item.teamId,
    });
    setShowModal(true);
  };

  const getRoleGradient = (role: string) => roleColors[role] || roleColors.DEVELOPER;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">人员管理</h1>
            <p className="text-slate-500 text-sm mt-1">管理团队成员和角色</p>
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              setFormData({ name: '', email: '', role: 'DEVELOPER', skills: '', teamId: null });
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            新建成员
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {members.map((item) => (
            <div key={item.id} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 p-5 hover:shadow-xl transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRoleGradient(item.role)} flex items-center justify-center text-white text-lg font-bold shadow-lg`}>
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{item.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gradient-to-r ${getRoleGradient(item.role)} text-white`}>
                      {item.role}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              {item.email && (
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {item.email}
                </div>
              )}
              {item.skills && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.skills.split(',').map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {members.length === 0 && (
            <div className="col-span-full">
              <div className="bg-white/50 backdrop-blur-xl rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                <div className="text-slate-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-lg">暂无团队成员</p>
                  <p className="text-sm mt-1">点击上方按钮添加第一个成员</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white">{editingItem ? '编辑成员' : '新建成员'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">姓名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">邮箱</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">角色</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">技能</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="如：Kotlin, React, PostgreSQL"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
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
