'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useI18n } from '@/i18n/useI18n';
import { createTeamMember, deleteTeamMember, getTeamMembers, updateTeamMember } from '@/lib/api';

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

export default function TeamMembersPage() {
  const { t } = useI18n();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'DEVELOPER', skills: '', teamId: null as number | null });

  useEffect(() => { void loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await getTeamMembers();
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(t('teamMembers.loadError'), error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email || undefined,
        role: formData.role,
        skills: formData.skills || undefined,
        teamId: formData.teamId != null ? formData.teamId : undefined,
      };
      if (editingItem) {
        await updateTeamMember(editingItem.id, payload);
      } else {
        await createTeamMember(payload);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({ name: '', email: '', role: 'DEVELOPER', skills: '', teamId: null });
      await loadData();
    } catch (error) {
      console.error(t('teamMembers.submitError'), error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('teamMembers.deleteConfirm'))) return;
    try {
      await deleteTeamMember(id);
      await loadData();
    } catch (error) {
      console.error(t('teamMembers.deleteError'), error);
    }
  };

  const openEdit = (item: TeamMember) => {
    setEditingItem(item);
    setFormData({ name: item.name, email: item.email || '', role: item.role, skills: item.skills || '', teamId: item.teamId });
    setShowModal(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{t('teamMembers.title')}</h1>
            <p className="text-slate-500 text-sm mt-1">{t('teamMembers.subtitle')}</p>
          </div>
          <button onClick={() => { setEditingItem(null); setFormData({ name: '', email: '', role: 'DEVELOPER', skills: '', teamId: null }); setShowModal(true); }} className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30 transition-all">{t('teamMembers.newItem')}</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {members.map((item) => (
            <div key={item.id} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 p-5 hover:shadow-xl transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{item.name}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                      {t(`teamMembers.roleLabel.${item.role}`)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">{t('common.edit')}</button>
                  <button onClick={() => void handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">{t('common.delete')}</button>
                </div>
              </div>
              {item.email && <div className="text-sm text-slate-500 mb-2">{item.email}</div>}
              {item.skills && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.skills.split(',').map((skill, index) => (
                    <span key={index} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs">{skill.trim()}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {members.length === 0 && (
            <div className="col-span-full">
              <div className="bg-white/50 backdrop-blur-xl rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                <p className="text-lg text-slate-500">{t('teamMembers.empty')}</p>
                <p className="text-sm mt-1 text-slate-400">{t('teamMembers.emptyHint')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white">{editingItem ? t('teamMembers.editItem') : t('teamMembers.newItem')}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Field label={t('teamMembers.fields.name')}><input type="text" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className={inputClass()} required /></Field>
              <Field label={t('teamMembers.fields.email')}><input type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className={inputClass()} /></Field>
              <Field label={t('teamMembers.fields.role')}><select value={formData.role} onChange={(event) => setFormData({ ...formData, role: event.target.value })} className={inputClass()}>{roleOptions.map((role) => <option key={role} value={role}>{t(`teamMembers.roleLabel.${role}`)}</option>)}</select></Field>
              <Field label={t('teamMembers.fields.skills')}><input type="text" value={formData.skills} onChange={(event) => setFormData({ ...formData, skills: event.target.value })} className={inputClass()} placeholder={t('teamMembers.fields.skillsPlaceholder')} /></Field>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50">{t('common.cancel')}</button>
                <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600">{t('common.save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="block text-sm font-medium text-slate-700 mb-1.5">{label}</div>{children}</label>;
}

function inputClass() {
  return 'w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
}
