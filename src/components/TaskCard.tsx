import React, { useState } from 'react';
import {
  Calendar,
  CheckSquare,
  MoreHorizontal,
  Archive,
  Trash2,
  Edit2,
  ArrowRight,
  Flame,
  AlertCircle,
} from 'lucide-react';
import { Task, ColumnId, Priority } from '../types/kanban';
import { useKanban } from '../context/KanbanContext';
import { getDueStatus } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  index: number;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, index }) => {
  const { assignees, columns, moveTask, archiveTask, deleteTask } = useKanban();
  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const assignee = assignees.find((a) => a.id === task.assigneeId);
  const dueInfo = getDueStatus(task.dueDate);

  // Subtasks progress
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;

  // HTML5 Drag Handlers
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', JSON.stringify({ taskId: task.id, sourceColumnId: task.columnId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Minimal priority dots & labels
  const priorityConfig: Record<Priority, { dotColor: string; label: string }> = {
    urgent: { dotColor: 'bg-rose-500', label: '긴급' },
    high: { dotColor: 'bg-amber-500', label: '높음' },
    medium: { dotColor: 'bg-blue-500', label: '보통' },
    low: { dotColor: 'bg-neutral-400', label: '낮음' },
  };

  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const isDone = task.columnId === 'done';
  const showImminentAlert = !isDone && dueInfo.isImminent;

  // Imminent deadline card border highlight
  const imminentBorderClass = showImminentAlert
    ? dueInfo.isOverdue
      ? 'border-rose-400/90 dark:border-rose-600 ring-2 ring-rose-200/80 dark:ring-rose-950/80 bg-rose-50/20 dark:bg-rose-950/15'
      : dueInfo.status === 'today'
      ? 'border-rose-400 dark:border-rose-600 ring-2 ring-rose-200/70 dark:ring-rose-950/70 bg-rose-50/15 dark:bg-rose-950/10'
      : 'border-amber-400/80 dark:border-amber-600/80 ring-1 ring-amber-200 dark:ring-amber-950/60 bg-amber-50/10 dark:bg-amber-950/10'
    : 'border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#151619]';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onEdit(task)}
      className={`group relative ${imminentBorderClass} rounded-xl p-3.5 shadow-2xs hover:shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer select-none ${
        isDragging ? 'opacity-30 scale-[0.98]' : ''
      }`}
    >
      {/* Top Meta Line: Priority dot & Action Menu */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          <span className={`w-1.5 h-1.5 rounded-full ${priority.dotColor}`} />
          <span>{priority.label}</span>
          {task.tags && task.tags.length > 0 && (
            <>
              <span className="text-neutral-300 dark:text-neutral-700">·</span>
              <span className="text-neutral-400 dark:text-neutral-500">#{task.tags[0]}</span>
            </>
          )}
        </div>

        {/* Options Trigger (Reveals on card hover) */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="옵션"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-5 w-40 bg-white dark:bg-[#1c1d21] rounded-lg shadow-xl border border-neutral-200/80 dark:border-neutral-800 py-1 z-40 text-xs animate-in fade-in zoom-in-95 duration-75"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onEdit(task);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/70"
              >
                <Edit2 className="w-3 h-3 text-neutral-400" />
                <span>수정하기</span>
              </button>

              <div className="px-3 py-1 text-[10px] text-neutral-400 font-medium border-t border-neutral-100 dark:border-neutral-800 mt-1">
                컬럼 이동
              </div>
              {columns
                .filter((c) => c.id !== task.columnId)
                .map((col) => (
                  <button
                    key={col.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveTask(task.id, col.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/70"
                  >
                    <span>{col.title}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-neutral-400" />
                  </button>
                ))}

              <div className="border-t border-neutral-100 dark:border-neutral-800 my-1"></div>

              {task.columnId === 'done' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    archiveTask(task.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/70"
                >
                  <Archive className="w-3 h-3 text-neutral-400" />
                  <span>보관하기</span>
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(task.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/70"
              >
                <Trash2 className="w-3 h-3" />
                <span>삭제하기</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Title */}
      <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 leading-snug mb-1 line-clamp-2">
        {task.title}
      </h4>

      {/* Optional short description */}
      {task.description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mb-2.5 leading-relaxed font-normal">
          {task.description}
        </p>
      )}

      {/* Footer Metadata: Checklist, Due Date, Assignee Avatar */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 text-xs">
        {/* Left indicators: Due date & subtask count */}
        <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
          {/* Due date */}
          <div className="flex items-center gap-1">
            {showImminentAlert ? (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] leading-tight shadow-2xs ${dueInfo.badgeClass}`}
                title={`마감일: ${task.dueDate}`}
              >
                {dueInfo.isOverdue ? (
                  <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                ) : (
                  <Flame className="w-2.5 h-2.5 shrink-0 animate-bounce" />
                )}
                <span>{dueInfo.label}</span>
              </span>
            ) : (
              <>
                <Calendar className="w-3 h-3 text-neutral-400" />
                <span
                  className={
                    dueInfo.status === 'overdue'
                      ? 'text-rose-600 dark:text-rose-400 font-medium'
                      : dueInfo.status === 'today'
                      ? 'text-amber-600 dark:text-amber-400 font-medium'
                      : ''
                  }
                >
                  {dueInfo.label}
                </span>
              </>
            )}
          </div>

          {/* Subtasks */}
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-1 font-mono text-[10px]">
              <CheckSquare className="w-3 h-3 text-neutral-400" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          )}
        </div>

        {/* Assignee Avatar & Name */}
        {assignee && (
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neutral-100/90 dark:bg-neutral-800/90 border border-neutral-200/60 dark:border-neutral-700/60 shrink-0"
            title={`${assignee.name} (${assignee.role} · ${assignee.id === 'user_1' ? '개띠' : '말띠'})`}
          >
            <img
              src={assignee.avatar}
              alt={assignee.name}
              className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-white dark:ring-neutral-900"
            />
            <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 whitespace-nowrap flex items-center gap-0.5">
              <span>{assignee.name}</span>
              <span className="text-[10px]">{assignee.id === 'user_1' ? '🐶' : '🐴'}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
