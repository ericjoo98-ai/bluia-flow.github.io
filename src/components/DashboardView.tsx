import React from 'react';
import {
  TrendingUp,
  Layers,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  User,
} from 'lucide-react';
import { useKanban } from '../context/KanbanContext';
import { getDueStatus } from '../utils/dateUtils';
import { Priority } from '../types/kanban';

export const DashboardView: React.FC = () => {
  const { tasks, archivedTasks, columns, assignees, setActiveView } = useKanban();

  const totalActiveTasks = tasks.length;
  const totalAllTasks = tasks.length + archivedTasks.length;
  const doneTasks = tasks.filter((t) => t.columnId === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.columnId === 'in_progress').length;

  const totalCompleted = doneTasks + archivedTasks.length;
  const completionRate = totalAllTasks > 0 ? Math.round((totalCompleted / totalAllTasks) * 100) : 0;

  const overdueTasks = tasks.filter((t) => getDueStatus(t.dueDate).status === 'overdue');
  const dueTodayTasks = tasks.filter((t) => getDueStatus(t.dueDate).status === 'today');

  // Distribution by Column
  const columnStats = columns.map((col) => {
    const count = tasks.filter((t) => t.columnId === col.id).length;
    const percentage = totalActiveTasks > 0 ? Math.round((count / totalActiveTasks) * 100) : 0;
    return {
      ...col,
      count,
      percentage,
    };
  });

  // Priorities
  const priorities: Priority[] = ['urgent', 'high', 'medium', 'low'];
  const priorityLabels: Record<Priority, { label: string; dot: string }> = {
    urgent: { label: '긴급', dot: 'bg-rose-500' },
    high: { label: '높음', dot: 'bg-amber-500' },
    medium: { label: '보통', dot: 'bg-blue-500' },
    low: { label: '낮음', dot: 'bg-neutral-400' },
  };

  const priorityStats = priorities.map((p) => {
    const count = tasks.filter((t) => t.priority === p).length;
    const percentage = totalActiveTasks > 0 ? Math.round((count / totalActiveTasks) * 100) : 0;
    return {
      priority: p,
      ...priorityLabels[p],
      count,
      percentage,
    };
  });

  // Assignee stats
  const assigneeStats = assignees.map((user) => {
    const userTasks = tasks.filter((t) => t.assigneeId === user.id);
    const userDone = userTasks.filter((t) => t.columnId === 'done').length;
    const userInProgress = userTasks.filter((t) => t.columnId === 'in_progress').length;
    const completionPercent = userTasks.length > 0 ? Math.round((userDone / userTasks.length) * 100) : 0;

    return {
      user,
      total: userTasks.length,
      done: userDone,
      inProgress: userInProgress,
      completionPercent,
    };
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#f9fafb] dark:bg-[#090a0b] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60 dark:border-neutral-800/60">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              프로젝트 현황 및 통계
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              스프린트 진행률, 상태별 분포 및 팀 작업 현황을 한눈에 확인합니다.
            </p>
          </div>
          <button
            onClick={() => setActiveView('board')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-white dark:bg-[#151619] border border-neutral-200/80 dark:border-neutral-800 rounded-lg shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>보드로 돌아가기</span>
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Completion */}
          <div className="bg-white dark:bg-[#151619] border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl p-4 shadow-2xs">
            <span className="text-[11px] font-medium text-neutral-400">전체 완료율</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
                {completionRate}%
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                ({totalCompleted}/{totalAllTasks})
              </span>
            </div>
            <div className="mt-3 w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          {/* Active Tasks */}
          <div className="bg-white dark:bg-[#151619] border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl p-4 shadow-2xs">
            <span className="text-[11px] font-medium text-neutral-400">진행 중인 작업</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
                {inProgressTasks}
              </span>
              <span className="text-xs text-neutral-400">
                / 활성 {totalActiveTasks}개
              </span>
            </div>
            <div className="mt-3 text-[11px] text-neutral-400">
              보관된 작업: <span className="font-mono text-neutral-700 dark:text-neutral-300">{archivedTasks.length}건</span>
            </div>
          </div>

          {/* Overdue */}
          <div className="bg-white dark:bg-[#151619] border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl p-4 shadow-2xs">
            <span className="text-[11px] font-medium text-neutral-400">기한 초과</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono tabular-nums ${overdueTasks.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
                {overdueTasks.length}
              </span>
              <span className="text-xs text-neutral-400">건</span>
            </div>
            <div className="mt-3 text-[11px] text-neutral-400">
              오늘 마감: <span className="font-mono text-neutral-700 dark:text-neutral-300">{dueTodayTasks.length}건</span>
            </div>
          </div>

          {/* Done count */}
          <div className="bg-white dark:bg-[#151619] border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl p-4 shadow-2xs">
            <span className="text-[11px] font-medium text-neutral-400">완료된 작업</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
                {doneTasks}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                (+보관 {archivedTasks.length})
              </span>
            </div>
            <div className="mt-3 text-[11px] text-neutral-400">
              스프린트 목표 순항 중
            </div>
          </div>
        </div>

        {/* 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Column Distribution */}
          <div className="bg-white dark:bg-[#151619] border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                파이프라인 단계별 현황
              </h3>
              <span className="text-xs font-mono text-neutral-400">{totalActiveTasks}개</span>
            </div>

            <div className="space-y-3">
              {columnStats.map((col) => (
                <div key={col.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                      {col.title}
                    </span>
                    <span className="font-mono text-neutral-500 text-[11px]">
                      {col.count}건 ({col.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-300"
                      style={{ width: `${col.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-white dark:bg-[#151619] border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                우선순위 분포
              </h3>
            </div>

            <div className="space-y-3">
              {priorityStats.map((p) => (
                <div key={p.priority} className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-100 dark:border-neutral-800/60 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${p.dot}`} />
                    <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                      {p.label}
                    </span>
                  </div>
                  <div className="font-mono text-neutral-500 text-[11px]">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 mr-1">{p.count}</span>
                    <span>({p.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Workload Table */}
        <div className="bg-white dark:bg-[#151619] border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl p-4 sm:p-5 shadow-2xs">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
            팀원별 작업 현황
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800/80 text-neutral-400 text-[11px]">
                  <th className="py-2 px-2 font-medium">담당자</th>
                  <th className="py-2 px-2 text-right font-medium">할당 작업</th>
                  <th className="py-2 px-2 text-right font-medium">진행 중</th>
                  <th className="py-2 px-2 text-right font-medium">완료</th>
                  <th className="py-2 px-2 w-36 text-right font-medium">달성률</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {assigneeStats.map(({ user, total, inProgress, done, completionPercent }) => (
                  <tr key={user.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700"
                        />
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                          <span>{user.name}</span>
                          <span className="text-[11px]">
                            {user.id === 'user_1' ? '🐶' : '🐴'}
                          </span>
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
                          ({user.role} · {user.id === 'user_1' ? '개띠/대표' : user.id === 'user_2' ? '말띠/기술' : '말띠/재무'})
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-700 dark:text-neutral-300">
                      {total}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-700 dark:text-neutral-300">
                      {inProgress}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-700 dark:text-neutral-300">
                      {done}
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-neutral-900 dark:bg-white rounded-full"
                            style={{ width: `${completionPercent}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-neutral-500 w-7 text-right">
                          {completionPercent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
