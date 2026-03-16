'use client';

import { useEffect, useRef, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useI18n } from '@/i18n/useI18n';
import { createSession, getSkillNames, sendQuery, submitFeedback } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  skillName?: string;
}

interface SkillInfo {
  name: string;
  description: string;
}

export default function AgentPage() {
  const { t } = useI18n();
  const [sessionId, setSessionId] = useState<string | null>(() => (typeof window === 'undefined' ? null : localStorage.getItem('ai_session_id')));
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('ai_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<SkillInfo[]>([]);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [feedbackRating] = useState(5);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (sessionId) localStorage.setItem('ai_session_id', sessionId); }, [sessionId]);
  useEffect(() => { localStorage.setItem('ai_messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { if (!sessionId) { void initSession(); } else if (messages.length === 0) { setMessages([{ id: 'welcome', role: 'assistant', content: t('agent.welcome') }]); } void loadSkills(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const initSession = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const session = await createSession(user?.id, user?.username);
      setSessionId(session.sessionId);
      setMessages([{ id: 'welcome', role: 'assistant', content: t('agent.welcome') }]);
    } catch (error) {
      console.error(t('agent.createSessionError'), error);
    }
  };

  const loadSkills = async () => {
    try {
      const names = await getSkillNames();
      setSkills(
        names.map((name: string) => ({
          name,
          description: t(`agent.quickAccess.${name}`),
        }))
      );
    } catch (error) {
      console.error(t('agent.loadSkillsError'), error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || !sessionId || loading) return;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendQuery(sessionId, input);
      setMessages((prev) => [...prev, { id: `${Date.now()}-assistant`, role: 'assistant', content: response.message, skillName: response.skillName }]);
    } catch (error) {
      console.error(t('agent.sendError'), error);
      setMessages((prev) => [...prev, { id: `${Date.now()}-assistant`, role: 'assistant', content: t('agent.sendError') }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (messageId: string, isPositive: boolean) => {
    const message = messages.find((item) => item.id === messageId);
    if (!message || !sessionId) return;
    try {
      await submitFeedback({ sessionId, skillName: message.skillName, rating: feedbackRating, isPositive });
      setShowFeedback(null);
      alert(t('agent.feedbackSuccess'));
    } catch (error) {
      console.error(t('agent.feedbackSuccess'), error);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl space-y-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 text-white p-4">
            <h1 className="text-xl font-bold">{t('agent.title')}</h1>
            <p className="text-sm text-blue-100">{t('agent.subtitle')}</p>
          </div>

          <div className="bg-gray-50 p-3 border-b">
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 6).map((skill) => (
                <button key={skill.name} onClick={() => setInput(skill.description)} className="text-xs px-2 py-1 bg-white border rounded hover:bg-blue-50 transition-colors">
                  {skill.name.replace('Skill', '')}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.role === 'assistant' && (
                    <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                      <span>{t('agent.skillLabel')}: {message.skillName || 'N/A'}</span>
                      {showFeedback === message.id ? (
                        <div className="mt-2 flex gap-2">
                          <button onClick={() => void handleFeedback(message.id, true)} className="px-2 py-1 bg-green-500 text-white rounded">{t('agent.positive')}</button>
                          <button onClick={() => void handleFeedback(message.id, false)} className="px-2 py-1 bg-red-500 text-white rounded">{t('agent.negative')}</button>
                        </div>
                      ) : (
                        <button onClick={() => setShowFeedback(message.id)} className="ml-2 text-blue-500 hover:underline">{t('agent.promptFeedback')}</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && <div className="text-sm text-gray-500">{t('common.loading')}</div>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t p-4">
            <div className="flex gap-2">
              <input type="text" value={input} onChange={(event) => setInput(event.target.value)} placeholder={t('agent.inputPlaceholder')} className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={loading} />
              <button type="submit" disabled={loading || !input.trim()} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">{t('agent.send')}</button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
