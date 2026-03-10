'use client';

import { useState, useEffect, useRef } from 'react';
import { createSession, sendQuery, submitFeedback, getSkillNames } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  skillName?: string;
  intent?: string;
}

interface SkillInfo {
  name: string;
  description: string;
}

export default function AgentPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<SkillInfo[]>([]);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initSession();
    loadSkills();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initSession = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const session = await createSession(user?.id, user?.username);
      setSessionId(session.sessionId);
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: '您好！我是 Cruise 智能助手。我可以帮助您分析需求、管理任务、评估进度、识别风险等。请直接输入您的问题，我会尽力为您提供帮助。',
        },
      ]);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const loadSkills = async () => {
    try {
      const names = await getSkillNames();
      setSkills(
        names.map((name: string) => ({
          name,
          description: getSkillDescription(name),
        }))
      );
    } catch (error) {
      console.error('Failed to load skills:', error);
    }
  };

  const getSkillDescription = (name: string): string => {
    const descriptions: Record<string, string> = {
      RequirementAnalysisSkill: '分析需求完整性、优先级、依赖关系',
      TaskAssignmentSkill: '根据团队负载和技能匹配推荐最佳人选',
      RiskAlertSkill: '识别项目中的潜在风险并提供预警',
      ProgressAssessmentSkill: '评估项目整体进度并提供趋势分析',
      TeamOptimizationSkill: '分析团队负载并提供优化建议',
      DataAggregationSkill: '汇总多数据源信息提供全景视图',
      EvolutionSkill: '分析系统性能并提供优化建议',
      HelpSkill: '提供系统功能说明和操作指引',
      GeneralQuerySkill: '处理一般性查询',
    };
    return descriptions[name] || '未知技能';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendQuery(sessionId, input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        skillName: response.skillName,
        intent: response.intent,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send query:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，处理您的请求时发生错误。请稍后重试。',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (messageId: string, isPositive: boolean) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message || !sessionId) return;

    try {
      await submitFeedback({
        sessionId,
        skillName: message.skillName,
        rating: feedbackRating,
        isPositive,
      });
      setShowFeedback(null);
      alert('感谢您的反馈！');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4">
            <h1 className="text-xl font-bold">Cruise 智能助手</h1>
            <p className="text-sm text-blue-100">基于 SuperAgent + Skill 架构</p>
          </div>

          {/* Skills Quick Access */}
          <div className="bg-gray-50 p-3 border-b">
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 6).map((skill) => (
                <button
                  key={skill.name}
                  onClick={() => setInput(skill.description)}
                  className="text-xs px-2 py-1 bg-white border rounded hover:bg-blue-50 transition-colors"
                >
                  {skill.name.replace('Skill', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.role === 'assistant' && (
                    <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                      <span>技能: {message.skillName || 'N/A'}</span>
                      {showFeedback === message.id ? (
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => handleFeedback(message.id, true)}
                            className="px-2 py-1 bg-green-500 text-white rounded"
                          >
                            满意
                          </button>
                          <button
                            onClick={() => handleFeedback(message.id, false)}
                            className="px-2 py-1 bg-red-500 text-white rounded"
                          >
                            不满意
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowFeedback(message.id)}
                          className="ml-2 text-blue-500 hover:underline"
                        >
                          反馈
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
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

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入您的问题..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                发送
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
