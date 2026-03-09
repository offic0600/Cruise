'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { getRequirements, getTasks, getTeamMembers } from '@/lib/api';

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

export default function DashboardPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      setRequirements(reqs);
      setTasks(tks);
      setMembers(mems);
    } catch (err) {
      console.error('加载失败', err);
    } finally {
      setLoading(false);
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
      <div className="space-y-6">
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
