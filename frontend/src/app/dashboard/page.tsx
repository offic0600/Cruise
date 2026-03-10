'use client';

import { useEffect, useState, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { getRequirements, getTasks, getTeamMembers, createSession, sendQuery } from '@/lib/api';

interface Requirement {
  id: number;
  title: string;
  status: string;
  priority: string;
}

interface Task {
  id: number;
  status: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  skillName?: string;
}

export default function DashboardPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // AI 助手状态
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reqs, tks, mems] = await Promise.all([
        getRequirements(),
        getTasks(),
        getTeamMembers(),
      ]);
      setRequirements(Array.isArray(reqs) ? reqs : []);
      setTasks(Array.isArray(tks) ? tks : []);
      setMembers(Array.isArray(mems) ? mems : []);
    } catch (err) {
      console.error('加载失败', err);
    } finally {
      setLoading(false);
    }
  };

  // AI 助手初始化
  useEffect(() => {
    if (aiPanelOpen && !sessionId) {
      initAiSession();
    }
  }, [aiPanelOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiPanelOpen]);

  const initAiSession = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const session = await createSession(user?.id, user?.username);
      setSessionId(session.sessionId);
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: '您好！我是 Cruise 智能助手。我可以帮您分析看板数据、识别风险、评估进度等。请直接输入您的问题。',
        },
      ]);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || !sessionId || aiLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: aiInput,
    };
    setMessages((prev) => [...prev, userMessage]);
    setAiInput('');
    setAiLoading(true);

    try {
      const response = await sendQuery(sessionId, aiInput);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        skillName: response.skillName,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send query:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '抱歉，处理您的请求时发生错误。请稍后重试。',
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const getStatusCount = (items: any[], status: string) =>
    items.filter((i) => i.status === status).length;

  // 需求统计
  const reqNew = getStatusCount(requirements, 'NEW');
  const reqInProgress = getStatusCount(requirements, 'IN_PROGRESS');
  const reqTesting = getStatusCount(requirements, 'TESTING');
  const reqCompleted = getStatusCount(requirements, 'COMPLETED');

  // 任务统计
  const taskPending = getStatusCount(tasks, 'PENDING');
  const taskInProgress = getStatusCount(tasks, 'IN_PROGRESS');
  const taskCompleted = getStatusCount(tasks, 'COMPLETED');

  // 高优先级需求
  const highPriorityReqs = requirements.filter(
    (r) => r.priority === 'HIGH' || r.priority === 'CRITICAL'
  );

  const statCards = [
    { title: '总需求', value: requirements.length, color: 'from-blue-500 to-blue-600', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', shadow: 'shadow-blue-500/30' },
    { title: '总任务', value: tasks.length, color: 'from-emerald-500 to-emerald-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', shadow: 'shadow-emerald-500/30' },
    { title: '团队成员', value: members.length, color: 'from-purple-500 to-purple-600', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', shadow: 'shadow-purple-500/30' },
    { title: '已完成需求', value: reqCompleted, color: 'from-amber-500 to-amber-600', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', shadow: 'shadow-amber-500/30' },
  ];

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
      {/* AI 助手按钮 */}
      <button
        onClick={() => setAiPanelOpen(true)}
        className="fixed right-6 bottom-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center hover:scale-110 transition-transform z-50"
      >
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* AI 助手侧边面板 */}
      {aiPanelOpen && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
          {/* 面板头部 */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">智能助手</h3>
                <p className="text-xs text-blue-100">基于 SuperAgent</p>
              </div>
            </div>
            <button
              onClick={() => setAiPanelOpen(false)}
              className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 消息区域 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  {message.role === 'assistant' && message.skillName && (
                    <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400">
                      技能: {message.skillName.replace('Skill', '')}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <form onSubmit={handleAiSubmit} className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="输入您的问题..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={aiLoading}
              />
              <button
                type="submit"
                disabled={aiLoading || !aiInput.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6 mr-0 transition-all duration-300">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">仪表盘</h1>
          <p className="text-slate-500 text-sm mt-1">项目概览和数据统计</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, idx) => (
            <div key={idx} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 p-5 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg ${card.shadow}`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 需求和任务状态 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 需求状态分布 */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-5">需求状态分布</h2>
            <div className="space-y-4">
              {[
                { label: '新建', count: reqNew, color: 'bg-slate-500', total: requirements.length },
                { label: '进行中', count: reqInProgress, color: 'bg-blue-500', total: requirements.length },
                { label: '测试中', count: reqTesting, color: 'bg-amber-500', total: requirements.length },
                { label: '已完成', count: reqCompleted, color: 'bg-emerald-500', total: requirements.length },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-slate-600">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-100 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${item.total ? (item.count / item.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 w-6 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 任务状态分布 */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-5">任务状态分布</h2>
            <div className="space-y-4">
              {[
                { label: '待处理', count: taskPending, color: 'bg-slate-500', total: tasks.length },
                { label: '进行中', count: taskInProgress, color: 'bg-blue-500', total: tasks.length },
                { label: '已完成', count: taskCompleted, color: 'bg-emerald-500', total: tasks.length },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-slate-600">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-100 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${item.total ? (item.count / item.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 w-6 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 高优先级需求 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-6 bg-amber-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-slate-800">高优先级需求</h2>
          </div>
          {highPriorityReqs.length > 0 ? (
            <div className="grid gap-3">
              {highPriorityReqs.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100/50">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      req.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {req.priority}
                    </span>
                    <span className="font-medium text-slate-800">{req.title || `需求 #${req.id}`}</span>
                  </div>
                  <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-lg">{req.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>暂无高优先级需求</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
