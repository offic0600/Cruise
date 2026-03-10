'use client';

import { useState, useEffect } from 'react';
import { getSkills, getSkillAnalytics, getSkill } from '@/lib/api';

interface Skill {
  id: number;
  name: string;
  description: string;
  category: string;
  status: string;
  executionCount: number;
  successRate: number;
  avgExecutionTimeMs: number;
}

interface Analytics {
  name: string;
  executionCount: number;
  successRate: number;
  avgExecutionTimeMs: number;
  totalExecutions: number;
  successCount: number;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const data = await getSkills();
      setSkills(data);
    } catch (error) {
      console.error('Failed to load skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillClick = async (skill: Skill) => {
    setSelectedSkill(skill);
    try {
      const data = await getSkillAnalytics(skill.name);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setAnalytics(null);
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      ANALYSIS: 'bg-blue-100 text-blue-800',
      TASK_MANAGEMENT: 'bg-green-100 text-green-800',
      RISK_MANAGEMENT: 'bg-red-100 text-red-800',
      TEAM_MANAGEMENT: 'bg-purple-100 text-purple-800',
      EVOLUTION: 'bg-yellow-100 text-yellow-800',
      HELPER: 'bg-gray-100 text-gray-800',
      GENERAL: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Skill 管理</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skills List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">可用技能 ({skills.length})</h2>
            <div className="space-y-3">
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
                    <div>
                      <h3 className="font-medium text-gray-800">{skill.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{skill.description}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${getCategoryColor(
                        skill.category || ''
                      )}`}
                    >
                      {skill.category}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-gray-500">
                    <span>执行次数: {skill.executionCount}</span>
                    <span>成功率: {(skill.successRate * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {selectedSkill ? (
              <>
                <h2 className="text-lg font-semibold mb-4">{selectedSkill.name}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">描述</label>
                    <p className="text-gray-800">{selectedSkill.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">分类</label>
                      <p className="text-gray-800">{selectedSkill.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">状态</label>
                      <p className="text-gray-800">{selectedSkill.status}</p>
                    </div>
                  </div>
                  {analytics && (
                    <>
                      <div className="border-t pt-4">
                        <h3 className="font-medium mb-3">执行统计</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="text-2xl font-bold text-blue-600">
                              {analytics.executionCount}
                            </div>
                            <div className="text-sm text-gray-500">总执行次数</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="text-2xl font-bold text-green-600">
                              {(analytics.successRate * 100).toFixed(0)}%
                            </div>
                            <div className="text-sm text-gray-500">成功率</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="text-2xl font-bold text-purple-600">
                              {analytics.avgExecutionTimeMs}ms
                            </div>
                            <div className="text-sm text-gray-500">平均执行时间</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="text-2xl font-bold text-orange-600">
                              {analytics.successCount}
                            </div>
                            <div className="text-sm text-gray-500">成功次数</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-12">
                点击左侧技能查看详情
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
