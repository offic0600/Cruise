'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import ChartRenderer from '@/components/ChartRenderer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n } from '@/i18n/useI18n';
import { Issue } from '@/lib/api';
import { useDashboardAgent, useDashboardData } from '@/lib/query/dashboard';

interface ChartConfig {
  type: 'bar' | 'line' | 'pie';
  title: string;
  data: { name: string; value: number }[];
  description?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  skillName?: string;
  chartConfig?: ChartConfig;
}

export default function DashboardPage() {
  const { t } = useI18n();
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : localStorage.getItem('ai_session_id')
  );
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('ai_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { issuesQuery, membersQuery } = useDashboardData();
  const { sessionMutation, queryMutation } = useDashboardAgent();
  const issues = (issuesQuery.data ?? []) as Issue[];
  const members = Array.isArray(membersQuery.data) ? membersQuery.data : [];

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('ai_session_id', sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    localStorage.setItem('ai_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (aiPanelOpen && messages.length === 0) {
      setMessages([{ id: 'welcome', role: 'assistant', content: t('dashboard.aiWelcome') }]);
    }
    if (aiPanelOpen && !sessionId) {
      void initAiSession();
    }
  }, [aiPanelOpen, messages.length, sessionId, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiPanelOpen]);

  const initAiSession = async () => {
    try {
      const session = await sessionMutation.mutateAsync();
      setSessionId(session.sessionId);
    } catch (error) {
      console.error(t('dashboard.sessionError'), error);
    }
  };

  const parseChartConfig = (content: string): ChartConfig | undefined => {
    const chartMatch = content.match(/```chart\n([\s\S]*?)\n```/);
    if (!chartMatch) return undefined;
    try {
      return JSON.parse(chartMatch[1]) as ChartConfig;
    } catch {
      return undefined;
    }
  };

  const cleanContent = (content: string) => content.replace(/```chart\n[\s\S]*?\n```/g, '').trim();

  const handleAiSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!sessionId || !aiInput.trim() || aiLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: aiInput };
    setMessages((current) => [...current, userMessage]);
    const query = aiInput;
    setAiInput('');
    setAiLoading(true);

    try {
      const response = await queryMutation.mutateAsync({ sessionId, query });
      const chartConfig = parseChartConfig(response.message || '');
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: cleanContent(response.message || ''),
          skillName: response.skillName,
          chartConfig,
        },
      ]);
    } catch (error) {
      console.error(t('dashboard.queryError'), error);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: t('dashboard.queryError'),
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const features = useMemo(() => issues.filter((item) => item.type === 'FEATURE'), [issues]);
  const tasks = useMemo(() => issues.filter((item) => item.type === 'TASK'), [issues]);
  const bugs = useMemo(() => issues.filter((item) => item.type === 'BUG'), [issues]);

  const featureStateCounts = countStates(features);
  const taskStateCounts = countStates(tasks);

  const metrics = [
    { title: t('dashboard.totalRequirements'), value: features.length, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/30' },
    { title: t('dashboard.totalTasks'), value: tasks.length, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/30' },
    { title: t('dashboard.teamMembers'), value: members.length, color: 'from-cyan-500 to-sky-500', shadow: 'shadow-cyan-500/30' },
    {
      title: t('dashboard.openDefects'),
      value: bugs.filter((item) => item.state !== 'DONE' && item.state !== 'CANCELED').length,
      color: 'from-rose-500 to-orange-500',
      shadow: 'shadow-rose-500/30',
    },
  ];

  if (issuesQuery.isLoading || membersQuery.isLoading) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center text-ink-700">{t('common.loading')}</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-ink-900">{t('dashboard.title')}</h1>
            <p className="mt-2 text-ink-700">{t('dashboard.subtitle')}</p>
          </div>
          <Button
            onClick={() => setAiPanelOpen((value) => !value)}
          >
            {t('nav.agent')}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.title} className={`rounded-card bg-gradient-to-br ${metric.color} p-5 text-white shadow-xl ${metric.shadow}`}>
              <div className="text-sm opacity-80">{metric.title}</div>
              <div className="mt-2 text-3xl font-bold">{metric.value}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartRenderer
              config={{
                type: 'pie',
                title: t('dashboard.requirementStatus'),
                data: [
                  { name: t('common.status.BACKLOG'), value: featureStateCounts.BACKLOG },
                  { name: t('common.status.IN_PROGRESS'), value: featureStateCounts.IN_PROGRESS },
                  { name: t('common.status.IN_REVIEW'), value: featureStateCounts.IN_REVIEW },
                  { name: t('common.status.DONE'), value: featureStateCounts.DONE },
                ],
              }}
            />
            <ChartRenderer
              config={{
                type: 'bar',
                title: t('dashboard.taskStatus'),
                data: [
                  { name: t('common.status.TODO'), value: taskStateCounts.TODO },
                  { name: t('common.status.IN_PROGRESS'), value: taskStateCounts.IN_PROGRESS },
                  { name: t('common.status.DONE'), value: taskStateCounts.DONE },
                ],
              }}
            />
          </div>

          <div className="panel-card overflow-hidden">
            <div className="border-b border-border-subtle px-5 py-4">
              <h2 className="font-semibold text-ink-900">{t('nav.agent')}</h2>
            </div>
            <div className="flex h-[460px] flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-card px-4 py-3 text-sm ${message.role === 'user' ? 'bg-brand-600 text-white shadow-brand' : 'bg-surface-soft text-ink-700'}`}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      {message.chartConfig && <ChartRenderer config={message.chartConfig} />}
                      {message.skillName && message.role === 'assistant' && (
                        <div className="mt-2 text-xs text-ink-400">
                          {t('agent.skillLabel')}: {message.skillName}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {aiLoading && <div className="text-sm text-ink-400">{t('common.loading')}</div>}
                <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <form onSubmit={handleAiSubmit} className="border-t border-border-subtle p-4">
                <div className="flex gap-2">
                  <Input
                    value={aiInput}
                    onChange={(event) => setAiInput(event.target.value)}
                    placeholder={t('dashboard.inputPlaceholder')}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={aiLoading || !aiInput.trim()}
                  >
                    {t('agent.send')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function countStates(items: Issue[]) {
  return items.reduce(
    (accumulator, item) => {
      accumulator[item.state] = (accumulator[item.state] ?? 0) + 1;
      return accumulator;
    },
    {
      BACKLOG: 0,
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0,
      CANCELED: 0,
    } as Record<Issue['state'], number>
  );
}
