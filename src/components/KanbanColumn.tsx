import React, { useState } from 'react';
import {
  Plus,
  Archive,
  RotateCcw,
  Trash2,
  FolderArchive,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Column, Task, ColumnId } from '../types/kanban';
import { TaskCard } from './TaskCard';
import { useKanban } from '../context/KanbanContext';
import { formatRelativeTime } from '../utils/dateUtils';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onOpenNewTaskForColumn: (columnId: ColumnId) => void;
  onEditTask: (task: Task) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  onOpenNewTaskForColumn,
  onEditTask,
}) => {
  const {
    moveTask,
    archivedTasks,
    restoreTask,
    archiveTask,
    archiveAllDoneTasks,
    deleteTask,
    assignees,
  } = useKanban();

  const [isDragOver, setIsDragOver] = useState(false);
  // For the 'done' column: toggle between 'completed' and 'archived'
  const [doneMode, setDoneMode] = useState<'completed' | 'archived'>('completed');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isDoneColumn = column.id === 'done';

  // Guarantee '백로그 (대기)' is shown
  const displayTitle =
    column.id === 'backlog'
      ? column.title.includes('(대기)')
        ? column.title
        : `${column.title} (대기)`
      : column.title;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);
      if (data?.taskId) {
        moveTask(data.taskId, column.id);
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  // Distinctive header background per column for clear visual distinction
  const getHeaderBgClass = () => {
    if (isDoneColumn) {
      return doneMode === 'archived'
        ? 'bg-indigo-50/80 dark:bg-indigo-950/40'
        : 'bg-emerald-50/80 dark:bg-emerald-950/40';
    }
    switch (column.id) {
      case 'backlog':
        return 'bg-slate-100/90 dark:bg-slate-900/50';
      case 'todo':
        return 'bg-blue-50/80 dark:bg-blue-950/40';
      case 'in_progress':
        return 'bg-amber-50/80 dark:bg-amber-950/40';
      default:
        return 'bg-white dark:bg-[#17181c]';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col w-[305px] sm:w-[330px] shrink-0 bg-neutral-100/70 dark:bg-[#111215]/80 rounded-2xl border transition-all shadow-xs ${
        isDragOver
          ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 ring-2 ring-indigo-400/20'
          : 'border-neutral-200/80 dark:border-neutral-800/80'
      }`}
    >
      {/* Column Header: Uniform h-14 height with distinctive background color across all columns */}
      <div
        className={`h-14 px-3 sm:px-3.5 ${getHeaderBgClass()} border-b border-neutral-200/90 dark:border-neutral-800/90 rounded-t-2xl flex items-center justify-between gap-2 shadow-2xs transition-colors`}
      >
        {isDoneColumn ? (
          /* Done Column: 완료 <> 저장 전환 탭을 헤더에 동일한 높이(h-14)로 통합 */
          <>
            <div className="flex items-center gap-1.5 min-w-0">
              {/* Colored Status Pip */}
              <span
                className="w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-neutral-900 shrink-0 shadow-2xs transition-colors"
                style={{
                  backgroundColor: doneMode === 'archived' ? '#6366F1' : '#10B981',
                }}
              />

              {/* 완료 <> 저장 전환 버튼 세그먼트 */}
              <div className="inline-flex items-center p-0.5 rounded-xl bg-white/90 dark:bg-neutral-900/90 border border-neutral-200/80 dark:border-neutral-700/80 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setDoneMode('completed')}
                  className={`px-2.5 py-1 text-sm sm:text-base font-extrabold tracking-tight rounded-lg transition-all flex items-center gap-1.5 leading-none ${
                    doneMode === 'completed'
                      ? 'bg-emerald-500 text-white shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                  }`}
                  title="완료된 작업 보기"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>완료</span>
                  <span
                    className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded-full ${
                      doneMode === 'completed'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {tasks.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDoneMode('archived')}
                  className={`px-2.5 py-1 text-sm sm:text-base font-extrabold tracking-tight rounded-lg transition-all flex items-center gap-1.5 leading-none ${
                    doneMode === 'archived'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                  }`}
                  title="저장된 작업 보기"
                >
                  <FolderArchive className="w-4 h-4 shrink-0" />
                  <span>저장</span>
                  <span
                    className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded-full ${
                      doneMode === 'archived'
                        ? 'bg-indigo-700 text-white'
                        : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {archivedTasks.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {doneMode === 'completed' && tasks.length > 0 && (
                <button
                  type="button"
                  onClick={archiveAllDoneTasks}
                  className="p-1.5 rounded-lg text-neutral-600 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 hover:bg-white/80 dark:hover:bg-neutral-800/80 transition-colors"
                  title="모든 완료 작업을 저장으로 이동"
                >
                  <Archive className="w-4 h-4" />
                </button>
              )}
              {doneMode === 'completed' && (
                <button
                  onClick={() => onOpenNewTaskForColumn(column.id)}
                  className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-white/80 dark:hover:bg-neutral-800/80 border border-transparent hover:border-neutral-200/80 dark:hover:border-neutral-700/80 transition-all shadow-2xs"
                  title="완료에 작업 추가"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        ) : (
          /* Normal Columns: Backlog, Todo, In Progress */
          <>
            <div className="flex items-center gap-2 min-w-0">
              {/* Colored Status Pip */}
              <span
                className="w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-neutral-900 shrink-0 shadow-2xs"
                style={{ backgroundColor: column.color }}
                title={column.title}
              />

              {/* Title Header Font */}
              <h3 className="text-sm sm:text-base font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight truncate">
                {displayTitle}
              </h3>

              {/* Count Badge */}
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-white/90 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-300 border border-neutral-200/70 dark:border-neutral-700/70 shrink-0 shadow-2xs">
                {tasks.length}
              </span>
            </div>

            {/* Quick Add Button */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onOpenNewTaskForColumn(column.id)}
                className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-white/80 dark:hover:bg-neutral-800/80 border border-transparent hover:border-neutral-200/80 dark:hover:border-neutral-700/80 transition-all shadow-2xs"
                title={`${displayTitle}에 작업 추가`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Cards List */}
      <div className="p-3 flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-[calc(100vh-210px)] min-h-[350px]">
        {/* If done column and archived mode is active, display archived cards */}
        {isDoneColumn && doneMode === 'archived' ? (
          <>
            {archivedTasks.map((task) => {
              const assignee = assignees.find((a) => a.id === task.assigneeId);
              return (
                <div
                  key={task.id}
                  className="bg-white dark:bg-[#151619] border border-indigo-200/60 dark:border-indigo-900/40 rounded-xl p-3 shadow-2xs space-y-2 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-1.5 py-0.2 rounded-md flex items-center gap-1">
                      <FolderArchive className="w-2.5 h-2.5" />
                      <span>저장됨</span>
                    </span>
                    {task.archivedAt && (
                      <span className="text-[10px] text-neutral-400">
                        {formatRelativeTime(task.archivedAt)}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 line-clamp-2">
                    {task.title}
                  </h4>

                  {task.description && (
                    <p className="text-[11px] text-neutral-500 line-clamp-1">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1.5 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                    {assignee ? (
                      <div className="flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-300 font-medium">
                        <img
                          src={assignee.avatar}
                          alt={assignee.name}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span>{assignee.name}</span>
                        <span className="text-[10px]">
                          {assignee.id === 'user_1' ? '🐶' : '🐴'}
                        </span>
                      </div>
                    ) : (
                      <span />
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => restoreTask(task.id)}
                        className="px-2 py-0.5 text-[11px] font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors flex items-center gap-1"
                        title="보드로 복원"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>복원</span>
                      </button>

                      {confirmDeleteId === task.id ? (
                        <div className="flex items-center gap-0.5 bg-rose-50 dark:bg-rose-950 p-0.5 rounded">
                          <button
                            onClick={() => {
                              deleteTask(task.id, true);
                              setConfirmDeleteId(null);
                            }}
                            className="px-1.5 py-0.5 text-[10px] bg-rose-600 text-white font-medium rounded"
                          >
                            삭제
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[10px] text-neutral-500 px-1"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(task.id)}
                          className="p-1 text-neutral-400 hover:text-rose-500 transition-colors"
                          title="영구 삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {archivedTasks.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-neutral-200/70 dark:border-neutral-800/70 rounded-xl my-1 bg-white/40 dark:bg-neutral-900/40">
                <Archive className="w-6 h-6 text-neutral-300 dark:text-neutral-600 mb-1.5" />
                <span className="text-xs text-neutral-400 mb-1 font-medium">
                  저장된 작업이 없습니다
                </span>
                <button
                  onClick={() => setDoneMode('completed')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  완료 작업 보기로 전환
                </button>
              </div>
            )}
          </>
        ) : (
          /* Normal Column / Completed Mode */
          <>
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={onEditTask}
              />
            ))}

            {tasks.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-neutral-200/70 dark:border-neutral-800/70 rounded-xl my-1 bg-white/40 dark:bg-neutral-900/40">
                <span className="text-xs text-neutral-400 mb-2">작업이 없습니다</span>
                <button
                  onClick={() => onOpenNewTaskForColumn(column.id)}
                  className="text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors px-2.5 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  + {displayTitle}에 작업 추가
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Column bottom quick action button (always present to preserve exact same height) */}
      <div className="p-2.5 pt-0">
        {!isDoneColumn || doneMode === 'completed' ? (
          <button
            onClick={() => onOpenNewTaskForColumn(column.id)}
            className="w-full py-2 px-3 flex items-center justify-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-white dark:hover:bg-neutral-800 border border-transparent hover:border-neutral-200/80 dark:hover:border-neutral-700/80 rounded-xl transition-all shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isDoneColumn ? '완료' : displayTitle}에 작업 추가</span>
          </button>
        ) : (
          <button
            onClick={() => setDoneMode('completed')}
            className="w-full py-2 px-3 flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-white dark:hover:bg-neutral-800 border border-transparent hover:border-neutral-200/80 dark:hover:border-neutral-700/80 rounded-xl transition-all shadow-2xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>완료 작업 보기로 전환</span>
          </button>
        )}
      </div>
    </div>
  );
};
