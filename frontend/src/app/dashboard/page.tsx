'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import ChartRenderer from '@/components/ChartRenderer';
import { Issue, createSession, getIssues, getTeamMembers, sendQuery } from '@/lib/api';

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

const AI_WELCOME = '你好，我是 Cruise 智能助手。你可以直接询问项目进度、风险或当前工作项分布。';

export default function DashboardPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('ai_session_id', sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ai_messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (aiPanelOpen && messages.length === 0) {
      setMessages([{ id: 'welcome', role: 'assistant', content: AI_WELCOME }]);
    }
    if (aiPanelOpen && !sessionId) {
      void initAiSession();
    }
  }, [aiPanelOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiPanelOpen]);

  const loadData = async () => {
    try {
      const [issueList, memberList] = await Promise.all([getIssues(), getTeamMembers()]);
      setIssues(Array.isArray(issueList) ? issueList : []);
      setMembers(Array.isArray(memberList) ? memberList : []);
    } catch (error) {
      console.error('加载仪表盘失败', error);
    } finally {
      setLoading(false);
    }
  };

  const initAiSession = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const session = await createSession(user?.id, user?.username);
      setSessionId(session.sessionId);
    } catch (error) {
      console.error('初始化会话失败', error);
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

  const cleanContent = (content: string) =>
    content.replace(/```chart\n[\s\S]*?\n```/g, '').trim();

  const handleAiSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!sessionId || !aiInput.trim() || aiLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: aiInput,
    };
    setMessages((current) => [...current, userMessage]);
    const query = aiInput;
    setAiInput('');
    setAiLoading(true);

    try {
      const response = await sendQuery(sessionId, query);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: response.message,
          skillName: response.skillName,
          chartConfig: parseChartConfig(response.message),
        },
      ]);
    } catch (error) {
      console.error('发送查询失败', error);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-error`,
          role: 'assistant',
          content: '抱歉，这次处理失败了，请稍后重试。',
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const features = useMemo(() => issues.filter((issue) => issue.type === 'FEATURE'), [issues]);
  const tasks = useMemo(() => issues.filter((issue) => issue.type === 'TASK'), [issues]);
  const bugs = useMemo(() => issues.filter((issue) => issue.type === 'BUG'), [issues]);

  const highPriorityItems = useMemo(
    () => features.filter((issue) => issue.priority === 'HIGH' || issue.priority === 'URGENT'),
    [features]
  );

  const featureStateCounts = {
    BACKLOG: features.filter((item) => item.state === 'BACKLOG').length,
    IN_PROGRESS: features.filter((item) => item.state === 'IN_PROGRESS').length,
    IN_REVIEW: features.filter((item) => item.state === 'IN_REVIEW').length,
    DONE: features.filter((item) => item.state === 'DONE').length,
  };

  const taskStateCounts = {
    TODO: tasks.filter((item) => item.state === 'TODO').length,
    IN_PROGRESS: tasks.filter((item) => item.state === 'IN_PROGRESS').length,
    DONE: tasks.filter((item) => item.state === 'DONE').length,
  };

  const statCards = [
    { title: '总需求数', value: features.length, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/30' },
    { title: '总任务数', value: tasks.length, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/30' },
    { title: '团队成员', value: members.length, color: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/30' },
    { title: '未关闭缺陷', value: bugs.filter((item) => item.state !== 'DONE' && item.state !== 'CANCELED').length, color: 'from-rose-500 to-rose-600', shadow: 'shadow-rose-500/30' },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center text-slate-500">加载中...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <button
        onClick={() => setAiPanelOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/40 transition hover:scale-110"
      >
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {aiPanelOpen && (
        <div className="fixed right-0 top-0 z-50 flex h-full w-96 flex-col bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-cyan-500 p-4 text-white">
            <div>
              <h3 className="font-semibold">智能助手</h3>
              <p className="text-xs text-blue-100">面向项目上下文的分析入口</p>
            </div>
            <button onClick={() => setAiPanelOpen(false)} className="rounded-lg p-2 hover:bg-white/20">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-slate-50 to-white p-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'border border-slate-200 bg-white text-slate-800 shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {message.role === 'assistant' ? cleanContent(message.content) : message.content}
                  </div>
                  {message.role === 'assistant' && message.skillName && (
                    <div className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-400">
                      技能: {message.skillName.replace('Skill', '')}
                    </div>
                  )}
                </div>
                {message.role === 'assistant' && message.chartConfig && <ChartRenderer config={message.chartConfig} />}
              </div>
            ))}
            {aiLoading && (
              <div className="flex items-start">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0.1s' }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleAiSubmit} className="border-t border-slate-200 bg-white p-4">
            <div className="flex gap-2">
              <input
                value={aiInput}
                onChange={(event) => setAiInput(event.target.value)}
                placeholder="输入你的问题"
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                disabled={aiLoading}
              />
              <button
                type="submit"
                disabled={aiLoading || !aiInput.trim()}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2.5 text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                发送
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">仪表盘</h1>
          <p className="mt-1 text-sm text-slate-500">统一 Issue 模型下的项目概览</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-slate-200/50 bg-white p-5 shadow-lg transition hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.title}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-800">{card.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.color} shadow-lg ${card.shadow}`} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <StatusPanel
            title="需求状态分布"
            total={features.length}
            items={[
              { label: '待梳理', count: featureStateCounts.BACKLOG, color: 'bg-slate-500' },
              { label: '进行中', count: featureStateCounts.IN_PROGRESS, color: 'bg-blue-500' },
              { label: '待评审', count: featureStateCounts.IN_REVIEW, color: 'bg-amber-500' },
              { label: '已完成', count: featureStateCounts.DONE, color: 'bg-emerald-500' },
            ]}
          />
          <StatusPanel
            title="任务状态分布"
            total={tasks.length}
            items={[
              { label: '待处理', count: taskStateCounts.TODO, color: 'bg-slate-500' },
              { label: '进行中', count: taskStateCounts.IN_PROGRESS, color: 'bg-blue-500' },
              { label: '已完成', count: taskStateCounts.DONE, color: 'bg-emerald-500' },
            ]}
          />
        </div>

        <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-lg">
          <div className="mb-5 flex items-center gap-2">
            <div className="h-6 w-2 rounded-full bg-amber-500" />
            <h2 className="text-lg font-semibold text-slate-800">高优先级需求</h2>
          </div>
          {highPriorityItems.length > 0 ? (
            <div className="grid gap-3">
              {highPriorityItems.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                  <div>
                    <div className="font-medium text-slate-800">{issue.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{issue.identifier}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${issue.priority === 'URGENT' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'}`}>
                      {issue.priority}
                    </span>
                    <span className="rounded-lg bg-white px-3 py-1 text-sm text-slate-500">{issue.state}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">当前没有高优先级需求</div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function StatusPanel({
  title,
  total,
  items,
}: {
  title: string;
  total: number;
  items: Array<{ label: string; count: number; color: string }>;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-lg">
      <h2 className="mb-5 text-lg font-semibold text-slate-800">{title}</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${item.color}`} />
              <span className="text-slate-600">{item.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-32 rounded-full bg-slate-100">
                <div
                  className={`h-2 rounded-full ${item.color}`}
                  style={{ width: `${total ? (item.count / total) * 100 : 0}%` }}
                />
              </div>
              <span className="w-6 text-right text-sm font-semibold text-slate-700">{item.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
