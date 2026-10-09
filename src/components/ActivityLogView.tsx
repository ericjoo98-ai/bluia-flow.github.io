import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Check,
  Archive,
  RotateCcw,
  Trash2,
  Edit2,
} from 'lucide-react';
import { useKanban } from '../context/KanbanContext';
import { formatRelativeTime, formatTimeKorean } from '../utils/dateUtils';
import { ActivityLog } from '../types/kanban';

export const ActivityLogView: React.FC = () => {
  const { activities, assignees, setActiveView } = useKanban();
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');

  const filteredActivities = activities.filter((act) => {
    if (selectedUserId !== 'all' && act.userId !== selectedUserId) return false;
    if (selectedAction !== 'all' && act.action !== selectedAction) return false;
    return true;
  });

  const getActionLabel = (action: ActivityLog['action']) => {
    switch (action) {
      case 'create':
        return '생성';
      case 'move':
        return '이동';
      case 'complete':
        return '완료';
      case 'archive':
        return '보관';
      case 'restore':
        return '복원';
      case 'delete':
        return '삭제';
      case 'update':
      default:
        return '수정';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f9fafb] dark:bg-[#090a0b] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60 dark:border-neutral-800/60">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              활동 내역
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              팀원들이 수행한 작업의 이동, 수정 및 보관 이력입니다.
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

        {/* Filter Bar */}
        <div className="flex items-center gap-2">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="py-1 px-2.5 text-xs bg-white dark:bg-[#151619] border border-neutral-200/80 dark:border-neutral-800 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none"
          >
            <option value="all">전체 팀원</option>
            {assignees.map((user) => (
              <option key={user.id} value={user.id}>
                {user.id === 'user_1' ? '🐶 ' : '🐴 '}
                {user.name} ({user.role})
              </option>
            ))}
          </select>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="py-1 px-2.5 text-xs bg-white dark:bg-[#151619] border border-neutral-200/80 dark:border-neutral-800 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none"
          >
            <option value="all">전체 유형</option>
            <option value="create">생성</option>
            <option value="move">이동</option>
            <option value="complete">완료</option>
            <option value="update">수정</option>
            <option value="archive">보관</option>
            <option value="restore">복원</option>
            <option value="delete">삭제</option>
          </select>

          <span className="text-xs text-neutral-400 font-mono ml-auto">
            {filteredActivities.length}개 기록
          </span>
        </div>

        {/* Timeline list */}
        <div className="bg-white dark:bg-[#151619] border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl divide-y divide-neutral-100 dark:divide-neutral-800/60 overflow-hidden shadow-2xs">
          {filteredActivities.length === 0 ? (
            <div className="py-10 text-center text-xs text-neutral-400">
              해당 조건의 활동 내역이 없습니다.
            </div>
          ) : (
            filteredActivities.map((act) => (
              <div key={act.id} className="p-3.5 flex items-start gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                <img
                  src={act.userAvatar}
                  alt={act.userName}
                  className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-neutral-200 dark:ring-neutral-700"
                />

                <div className="flex-1 min-w-0 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                        <span>{act.userName}</span>
                        <span className="text-[10px]">{act.userId === 'user_1' ? '🐶' : '🐴'}</span>
                      </span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-neutral-500 font-medium">
                        {getActionLabel(act.action)}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {formatRelativeTime(act.timestamp)}
                    </span>
                  </div>

                  <div className="mt-0.5 text-neutral-700 dark:text-neutral-300">
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      "{act.taskTitle}"
                    </span>
                    <span className="text-neutral-500 ml-1.5">{act.details}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
