import React, { useState } from 'react';
import {
  Archive,
  RotateCcw,
  Trash2,
  Search,
  Check,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Inbox,
  FolderArchive,
} from 'lucide-react';
import { useKanban } from '../context/KanbanContext';
import { formatRelativeTime } from '../utils/dateUtils';
import { Task } from '../types/kanban';

export const ArchiveView: React.FC = () => {
  const {
    tasks,
    archivedTasks,
    restoreTask,
    archiveTask,
    archiveAllDoneTasks,
    deleteTask,
    assignees,
    setActiveView,
  } = useKanban();

  // Active sub-tab: 'done' (완료 작업) vs 'archived' (archive 저장)
  const [subTab, setSubTab] = useState<'done' | 'archived'>('done');
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Active completed tasks
  const doneTasks = tasks.filter((t) => t.columnId === 'done');

  // Filter lists based on search
  const filteredDone = doneTasks.filter((task) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      task.title.toLowerCase().includes(q) ||
      (task.description || '').toLowerCase().includes(q) ||
      task.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const filteredArchived = archivedTasks.filter((task) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      task.title.toLowerCase().includes(q) ||
      (task.description || '').toLowerCase().includes(q) ||
      task.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#f9fafb] dark:bg-[#090a0b] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                완료 작업 & 저장
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-medium">
                보관 관리
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              완료된 작업과 별도 보관함(저장) 사이를 자유롭게 전환하며 관리합니다.
            </p>
          </div>

          <button
            onClick={() => setActiveView('board')}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 bg-white dark:bg-[#151619] border border-neutral-200/80 dark:border-neutral-800 rounded-lg shadow-2xs hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>칸반 보드로 돌아가기</span>
          </button>
        </div>

        {/* Dual Tab Switcher: 완료 작업 <> 저장 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#151619] border border-neutral-200/80 dark:border-neutral-800/80 p-2 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-1.5 bg-neutral-200/80 dark:bg-neutral-800 p-1 rounded-xl border border-neutral-300/70 dark:border-neutral-700/70">
            {/* 완료 작업 Tab */}
            <button
              onClick={() => {
                setSubTab('done');
                setConfirmDeleteId(null);
              }}
              className={`h-8 max-h-8 box-border flex items-center gap-1.5 px-3.5 rounded-lg text-xs font-semibold transition-all leading-none ${
                subTab === 'done'
                  ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-neutral-300/80 dark:border-neutral-700'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/60 dark:hover:bg-neutral-700/60'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>완료 작업</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full leading-none ${
                  subTab === 'done'
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {doneTasks.length}
              </span>
            </button>

            {/* 저장 Tab */}
            <button
              onClick={() => {
                setSubTab('archived');
                setConfirmDeleteId(null);
              }}
              className={`h-8 max-h-8 box-border flex items-center gap-1.5 px-3.5 rounded-lg text-xs font-semibold transition-all leading-none ${
                subTab === 'archived'
                  ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-neutral-300/80 dark:border-neutral-700'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/60 dark:hover:bg-neutral-700/60'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>저장</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full leading-none ${
                  subTab === 'archived'
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {archivedTasks.length}
              </span>
            </button>
          </div>

          {/* Quick Action Button for Done Tab */}
          {subTab === 'done' && doneTasks.length > 0 && (
            <button
              onClick={archiveAllDoneTasks}
              className="h-8 max-h-8 box-border flex items-center gap-1.5 px-3 text-xs font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80 rounded-xl transition-colors shadow-2xs self-end sm:self-auto leading-none"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>완료 작업 전체를 저장으로 이동</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              subTab === 'done'
                ? '완료된 작업 제목, 설명, 태그 검색...'
                : '저장된 작업 제목, 설명, 태그 검색...'
            }
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-[#151619] border border-neutral-200/80 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 shadow-2xs"
          />
        </div>

        {/* TAB 1: 완료 작업 목록 */}
        {subTab === 'done' && (
          <div className="space-y-3">
            {filteredDone.length === 0 ? (
              <div className="bg-white dark:bg-[#151619] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-10 text-center">
                <CheckCircle2 className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  완료된 작업이 없습니다
                </h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                  보드에서 업무를 '완료됨' 컬럼으로 옮기면 여기에 표시됩니다.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#151619] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl divide-y divide-neutral-100 dark:divide-neutral-800/60 overflow-hidden shadow-2xs">
                {filteredDone.map((task) => {
                  const assignee = assignees.find((a) => a.id === task.assigneeId);
                  return (
                    <div
                      key={task.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </span>
                          <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 truncate">
                            {task.title}
                          </h4>
                        </div>

                        {task.description && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 pl-7 line-clamp-1">
                            {task.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-neutral-400 pl-7">
                          {assignee && (
                            <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 font-medium">
                              <img
                                src={assignee.avatar}
                                alt={assignee.name}
                                className="w-5 h-5 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700"
                              />
                              <span>{assignee.name}</span>
                              <span className="text-[10px] text-neutral-400">
                                {assignee.id === 'user_1' ? '🐶' : '🐴'}
                              </span>
                            </div>
                          )}

                          <span>·</span>
                          <span>마감: {task.dueDate}</span>

                          {task.tags && task.tags.length > 0 && (
                            <>
                              <span>·</span>
                              <div className="flex items-center gap-1">
                                {task.tags.map((t) => (
                                  <span
                                    key={t}
                                    className="px-1.5 py-0.2 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] text-neutral-500"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions: Archive Save or Delete */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pl-7 sm:pl-0">
                        {/* 1-click Archive Save */}
                        <button
                          onClick={() => archiveTask(task.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200/80 dark:border-indigo-800/80 rounded-xl transition-all shadow-2xs"
                          title="이 작업을 저장함으로 이동"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>저장</span>
                        </button>

                        {/* Delete with inline confirmation */}
                        {confirmDeleteId === task.id ? (
                          <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 p-0.5 rounded-lg animate-in fade-in duration-100">
                            <button
                              onClick={() => {
                                deleteTask(task.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-0.5 text-[11px] bg-rose-600 hover:bg-rose-700 text-white font-medium rounded transition-colors"
                            >
                              삭제 확인
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1.5 text-[11px] text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(task.id)}
                            className="p-1.5 text-neutral-400 hover:text-rose-500 transition-colors rounded-lg"
                            title="작업 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: archive 저장 목록 */}
        {subTab === 'archived' && (
          <div className="space-y-3">
            {filteredArchived.length === 0 ? (
              <div className="bg-white dark:bg-[#151619] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-10 text-center">
                <Archive className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  저장된 작업이 없습니다
                </h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                  완료 작업 탭에서 '저장' 버튼을 누르면 작업이 안전하게 보관됩니다.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#151619] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl divide-y divide-neutral-100 dark:divide-neutral-800/60 overflow-hidden shadow-2xs">
                {filteredArchived.map((task) => {
                  const assignee = assignees.find((a) => a.id === task.assigneeId);
                  return (
                    <div
                      key={task.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <FolderArchive className="w-3 h-3" />
                          </span>
                          <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 truncate">
                            {task.title}
                          </h4>
                        </div>

                        {task.description && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 pl-7 line-clamp-1">
                            {task.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-neutral-400 pl-7">
                          {assignee && (
                            <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 font-medium">
                              <img
                                src={assignee.avatar}
                                alt={assignee.name}
                                className="w-5 h-5 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700"
                              />
                              <span>{assignee.name}</span>
                              <span className="text-[10px] text-neutral-400">
                                {assignee.id === 'user_1' ? '🐶' : '🐴'}
                              </span>
                            </div>
                          )}

                          <span>·</span>
                          <span>마감: {task.dueDate}</span>

                          {task.archivedAt && (
                            <>
                              <span>·</span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                저장됨 {formatRelativeTime(task.archivedAt)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions: Restore to Board or Permanently Delete */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pl-7 sm:pl-0">
                        <button
                          onClick={() => restoreTask(task.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-colors shadow-2xs"
                          title="보드의 완료 컬럼으로 다시 복원"
                        >
                          <RotateCcw className="w-3 h-3 text-neutral-500" />
                          <span>보드로 복원</span>
                        </button>

                        {confirmDeleteId === task.id ? (
                          <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 p-0.5 rounded-lg animate-in fade-in duration-100">
                            <button
                              onClick={() => {
                                deleteTask(task.id, true);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-0.5 text-[11px] bg-rose-600 hover:bg-rose-700 text-white font-medium rounded transition-colors"
                            >
                              영구 삭제
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1 text-[11px] text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(task.id)}
                            className="p-1.5 text-neutral-400 hover:text-rose-500 transition-colors rounded-lg"
                            title="영구 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
