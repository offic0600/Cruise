'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n } from '@/i18n/useI18n';
import { createSession, getSkillNames, sendQuery, submitFeedback } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  skillName?: string;
}

export default function AgentPage() {
  const { t } = useI18n();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string | null>(() => (typeof window === 'undefined' ? null : localStorage.getItem('ai_session_id')));
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('ai_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [feedbackTarget, setFeedbackTarget] = useState<string | null>(null);

  const skillsQuery = useQuery({
    queryKey: ['agent', 'skills'],
    queryFn: () => getSkillNames(),
  });

  const sessionMutation = useMutation({
    mutationFn: () => {
      const user = getStoredUser();
      return createSession(user?.id, user?.username);
    },
    onSuccess: (session) => {
      setSessionId(session.sessionId);
      setMessages([{ id: 'welcome', role: 'assistant', content: t('agent.welcome') }]);
    },
  });

  const queryMutation = useMutation({
    mutationFn: (query: string) => sendQuery(sessionId!, query),
    onSuccess: (response) => {
      setMessages((current) => [...current, { id: `${Date.now()}-assistant`, role: 'assistant', content: response.message, skillName: response.skillName }]);
    },
    onError: () => {
      setMessages((current) => [...current, { id: `${Date.now()}-assistant`, role: 'assistant', content: t('agent.sendError') }]);
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: ({ skillName, isPositive }: { skillName?: string; isPositive: boolean }) =>
      submitFeedback({
        sessionId: sessionId ?? undefined,
        skillName,
        rating: isPositive ? 5 : 2,
        isPositive,
      }),
  });

  useEffect(() => {
    if (sessionId) localStorage.setItem('ai_session_id', sessionId);
  }, [sessionId]);

  useEffect(() => {
    localStorage.setItem('ai_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!sessionId) {
      sessionMutation.mutate();
    } else if (messages.length === 0) {
      setMessages([{ id: 'welcome', role: 'assistant', content: t('agent.welcome') }]);
    }
  }, [messages.length, sessionId, sessionMutation, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || !sessionId || queryMutation.isPending) return;
    const userMessage: Message = { id: `${Date.now()}-user`, role: 'user', content: input };
    setMessages((current) => [...current, userMessage]);
    const nextInput = input;
    setInput('');
    await queryMutation.mutateAsync(nextInput);
  };

  const sendFeedback = async (message: Message, isPositive: boolean) => {
    await feedbackMutation.mutateAsync({ skillName: message.skillName, isPositive });
    setFeedbackTarget(null);
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <Card className="section-panel overflow-hidden">
          <CardHeader className="border-b border-border-subtle bg-brand-gradient text-white">
            <CardTitle>{t('agent.title')}</CardTitle>
            <div className="text-sm text-blue-100">{t('agent.subtitle')}</div>
          </CardHeader>
          <CardContent className="grid gap-0 p-0 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="border-b border-border-subtle bg-surface-soft p-4 lg:border-b-0 lg:border-r">
              <div className="text-sm font-medium text-ink-900">{t('common.skill')}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(skillsQuery.data ?? []).slice(0, 8).map((name: string) => (
                  <Button key={name} variant="secondary" size="sm" onClick={() => setInput(t(`agent.quickAccess.${name}`))}>
                    {name.replace('Skill', '')}
                  </Button>
                ))}
              </div>
            </aside>

            <div className="flex min-h-[620px] flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-card px-4 py-3 text-sm ${message.role === 'user' ? 'bg-brand-600 text-white shadow-brand' : 'bg-surface-soft text-ink-700'}`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        {message.role === 'assistant' && (
                          <div className="mt-3 border-t border-border-soft pt-3 text-xs">
                            <div className="flex items-center gap-2 text-ink-400">
                              <span>{t('agent.skillLabel')}:</span>
                              <Badge variant="neutral">{message.skillName || 'N/A'}</Badge>
                            </div>
                            {feedbackTarget === message.id ? (
                              <div className="mt-3 flex gap-2">
                                <Button size="sm" onClick={() => void sendFeedback(message, true)}>{t('agent.positive')}</Button>
                                <Button size="sm" variant="secondary" onClick={() => void sendFeedback(message, false)}>{t('agent.negative')}</Button>
                              </div>
                            ) : (
                              <button className="mt-3 text-brand-600 hover:underline" onClick={() => setFeedbackTarget(message.id)}>
                                {t('agent.promptFeedback')}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {(queryMutation.isPending || sessionMutation.isPending) && <div className="text-sm text-ink-400">{t('common.loading')}</div>}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <form onSubmit={submit} className="border-t border-border-subtle p-4">
                <div className="flex gap-3">
                  <Input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={t('agent.inputPlaceholder')}
                    className="flex-1"
                    disabled={queryMutation.isPending}
                  />
                  <Button type="submit" disabled={queryMutation.isPending || !input.trim()}>
                    {t('agent.send')}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
