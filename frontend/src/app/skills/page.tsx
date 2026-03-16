'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useI18n } from '@/i18n/useI18n';
import { addExternalSkill, createSkill, deleteSkill, getSkillAnalytics, getSkills, updateSkill } from '@/lib/api';

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
  executionCount: number;
  successRate: number;
  avgExecutionTimeMs: number;
  successCount: number;
}

const categories = ['ANALYSIS', 'TASK_MANAGEMENT', 'RISK_MANAGEMENT', 'TEAM_MANAGEMENT', 'EVOLUTION', 'VISUALIZATION', 'HELPER', 'GENERAL', 'EXTERNAL'];

export default function SkillsPage() {
  const { t } = useI18n();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState<'create' | 'edit' | 'external' | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '', category: 'GENERAL', intentPatterns: '', parameters: '', outputSchema: '', externalUrl: '', apiKey: '' });

  useEffect(() => { void loadSkills(); }, []);

  const loadSkills = async () => {
    try {
      const data = await getSkills();
      setSkills(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(t('skills.loadError'), error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode: 'create' | 'edit' | 'external') => {
    if (mode === 'edit' && selectedSkill) {
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
    } else {
      setFormData({ name: '', description: '', category: mode === 'external' ? 'EXTERNAL' : 'GENERAL', intentPatterns: '', parameters: '', outputSchema: '', externalUrl: '', apiKey: '' });
    }
    setError('');
    setShowModal(mode);
  };

  const handleSkillClick = async (skill: Skill) => {
    setSelectedSkill(skill);
    try {
      const data = await getSkillAnalytics(skill.name);
      setAnalytics(data);
    } catch (error) {
      console.error(t('skills.analyticsError'), error);
      setAnalytics(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setModalLoading(true);
    setError('');

    try {
      if (showModal === 'create') {
        await createSkill({ name: formData.name, description: formData.description, category: formData.category, intentPatterns: formData.intentPatterns, parameters: formData.parameters || undefined, outputSchema: formData.outputSchema || undefined });
      } else if (showModal === 'edit' && selectedSkill) {
        await updateSkill(selectedSkill.name, { description: formData.description, category: formData.category, intentPatterns: formData.intentPatterns, parameters: formData.parameters || undefined, outputSchema: formData.outputSchema || undefined });
      } else if (showModal === 'external') {
        await addExternalSkill({ name: formData.name, description: formData.description, category: formData.category, externalUrl: formData.externalUrl, apiKey: formData.apiKey || undefined });
      }
      await loadSkills();
      setShowModal(null);
    } catch (err: any) {
      setError(err.response?.data?.message || t('skills.submitError'));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSkill || !window.confirm(`${t('common.delete')} "${selectedSkill.name}"?`)) return;
    try {
      await deleteSkill(selectedSkill.name);
      await loadSkills();
      setSelectedSkill(null);
      setAnalytics(null);
    } catch (error) {
      alert(t('skills.deleteError'));
    }
  };

  if (loading) {
    return <AppLayout><div className="flex h-64 items-center justify-center text-slate-500">{t('common.loading')}</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{t('skills.title')}</h1>
          <div className="flex gap-2">
            <button onClick={() => openModal('external')} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">{t('skills.addExternal')}</button>
            <button onClick={() => openModal('create')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">{t('skills.addCustom')}</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">{t('skills.available', { count: skills.length })}</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {skills.map((skill) => (
                <div key={skill.id} onClick={() => void handleSkillClick(skill)} className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedSkill?.id === skill.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <h3 className="font-medium text-gray-800">{skill.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{skill.description}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="px-2 py-0.5 text-xs rounded bg-slate-100 text-slate-700">{t(`skills.categories.${skill.category}`)}</span>
                    <span className="px-2 py-0.5 text-xs rounded bg-slate-100 text-slate-700">{t(`skills.statuses.${skill.status}`)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            {selectedSkill ? (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedSkill.name}</h2>
                    <p className="text-gray-500 mt-1">{selectedSkill.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openModal('edit')} className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">{t('common.edit')}</button>
                    <button onClick={() => void handleDelete()} className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600">{t('common.delete')}</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Info label={t('skills.fields.category')} value={t(`skills.categories.${selectedSkill.category}`)} />
                  <Info label={t('skills.fields.status')} value={t(`skills.statuses.${selectedSkill.status}`)} />
                  <Info label={t('skills.fields.version')} value={selectedSkill.version || '1.0.0'} />
                  <Info label={t('skills.fields.executions')} value={String(selectedSkill.executionCount)} />
                </div>

                <div className="space-y-4 border-t pt-4">
                  <InfoBlock label={t('skills.fields.intentPatterns')} value={selectedSkill.intentPatterns || '-'} />
                  {selectedSkill.parameters && <InfoBlock label={t('skills.fields.parameters')} value={selectedSkill.parameters} />}
                  {selectedSkill.outputSchema && <InfoBlock label={t('skills.fields.outputSchema')} value={selectedSkill.outputSchema} />}
                </div>

                {analytics && (
                  <div className="border-t pt-4 mt-6">
                    <h3 className="font-medium mb-3">{t('skills.analytics.title')}</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <Metric value={analytics.executionCount} label={t('skills.analytics.totalExecutions')} />
                      <Metric value={`${(analytics.successRate * 100).toFixed(0)}%`} label={t('skills.analytics.successRate')} />
                      <Metric value={`${analytics.avgExecutionTimeMs}ms`} label={t('skills.analytics.avgExecutionTime')} />
                      <Metric value={analytics.successCount} label={t('skills.analytics.successCount')} />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 py-12">{t('skills.emptySelection')}</div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{t(`skills.modal.${showModal}`)}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {showModal !== 'edit' && <Field label={t('skills.fields.name')}><input type="text" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className={inputClass()} required /></Field>}
              <Field label={t('skills.fields.description')}><textarea value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} className={inputClass()} rows={3} required /></Field>
              <Field label={t('skills.fields.category')}><select value={formData.category} onChange={(event) => setFormData({ ...formData, category: event.target.value })} className={inputClass()}>{categories.map((category) => <option key={category} value={category}>{t(`skills.categories.${category}`)}</option>)}</select></Field>
              {showModal !== 'external' ? (
                <>
                  <Field label={t('skills.fields.intentPatterns')}><input type="text" value={formData.intentPatterns} onChange={(event) => setFormData({ ...formData, intentPatterns: event.target.value })} className={inputClass()} placeholder={t('skills.fields.intentPatternsPlaceholder')} /></Field>
                  <Field label={t('skills.fields.parameters')}><textarea value={formData.parameters} onChange={(event) => setFormData({ ...formData, parameters: event.target.value })} className={inputClass()} rows={3} /></Field>
                  <Field label={t('skills.fields.outputSchema')}><textarea value={formData.outputSchema} onChange={(event) => setFormData({ ...formData, outputSchema: event.target.value })} className={inputClass()} rows={3} /></Field>
                </>
              ) : (
                <>
                  <Field label={t('skills.fields.externalUrl')}><input type="url" value={formData.externalUrl} onChange={(event) => setFormData({ ...formData, externalUrl: event.target.value })} className={inputClass()} required /></Field>
                  <Field label={t('skills.fields.apiKey')}><input type="password" value={formData.apiKey} onChange={(event) => setFormData({ ...formData, apiKey: event.target.value })} className={inputClass()} placeholder={t('skills.fields.apiKeyPlaceholder')} /></Field>
                </>
              )}
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">{t('common.cancel')}</button>
                <button type="submit" disabled={modalLoading} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">{modalLoading ? t('skills.modal.submitting') : t('common.submit')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-medium text-gray-700 mb-1">{label}{children}</label>; }
function inputClass() { return 'mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'; }
function Info({ label, value }: { label: string; value: string }) { return <div><label className="text-sm font-medium text-gray-500">{label}</label><p className="text-gray-800">{value}</p></div>; }
function InfoBlock({ label, value }: { label: string; value: string }) { return <div><label className="text-sm font-medium text-gray-500">{label}</label><pre className="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-700 overflow-x-auto whitespace-pre-wrap">{value}</pre></div>; }
function Metric({ value, label }: { value: string | number; label: string }) { return <div className="bg-gray-50 p-3 rounded"><div className="text-2xl font-bold text-blue-600">{value}</div><div className="text-sm text-gray-500">{label}</div></div>; }
