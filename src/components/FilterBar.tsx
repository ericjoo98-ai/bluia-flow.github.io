import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, SlidersHorizontal, Archive, Check } from 'lucide-react';
import { useKanban } from '../context/KanbanContext';
import { Priority, FilterState } from '../types/kanban';
import { getDueStatus } from '../utils/dateUtils';

export const FilterBar: React.FC = () => {
  const {
    filter,
    setFilter,
    resetFilter,
    assignees,
    tasks,
    currentUser,
    archiveAllDoneTasks,
  } = useKanban();

  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowFilterPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const doneTasksCount = tasks.filter((t) => t.columnId === 'done').length;

  const filteredTasksCount = useMemo(() => {
    return tasks.filter((task) => {
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(query);
        const descMatch = (task.description || '').toLowerCase().includes(query);
        const tagMatch = task.tags?.some((t) => t.toLowerCase().includes(query));
        if (!titleMatch && !descMatch && !tagMatch) return false;
      }
      if (filter.assigneeId !== 'all' && task.assigneeId !== filter.assigneeId) return false;
      if (filter.priority !== 'all' && task.priority !== filter.priority) return false;
      if (filter.dueDateStatus !== 'all') {
        const { status } = getDueStatus(task.dueDate);
        if (filter.dueDateStatus === 'overdue' && status !== 'overdue') return false;
        if (filter.dueDateStatus === 'today' && status !== 'today') return false;
        if (filter.dueDateStatus === 'week' && status !== 'today' && status !== 'tomorrow' && status !== 'soon') return false;
      }
      if (filter.tag !== 'all' && !task.tags?.includes(filter.tag)) return false;
      return true;
    }).length;
  }, [tasks, filter]);

  const isMyTasksOnly = filter.assigneeId === currentUser.id;

  const hasAdvancedFilters =
    (filter.assigneeId !== 'all' && !isMyTasksOnly) ||
    filter.priority !== 'all' ||
    filter.dueDateStatus !== 'all' ||
    filter.tag !== 'all';

  const isAnyFilterActive =
    filter.searchQuery.trim() !== '' ||
    filter.assigneeId !== 'all' ||
    filter.priority !== 'all' ||
    filter.dueDateStatus !== 'all' ||
    filter.tag !== 'all';

  const allTags = Array.from(new Set(tasks.flatMap((t) => t.tags || [])));

  return (
    <div className="bg-white/50 dark:bg-[#0c0d0e]/50 border-b border-neutral-200/60 dark:border-neutral-800/60 py-2 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Search & Clean Filters */}
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          {/* Minimal Search Input */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filter.searchQuery}
              onChange={(e) => setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="작업 검색..."
              className="w-full pl-8 pr-7 py-1 text-xs bg-neutral-100/70 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none transition-all"
            />
            {filter.searchQuery && (
              <button
                onClick={() => setFilter((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick "My Tasks" Toggle Button */}
          <button
            onClick={() =>
              setFilter((prev) => ({
                ...prev,
                assigneeId: isMyTasksOnly ? 'all' : currentUser.id,
              }))
            }
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
              isMyTasksOnly
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs'
                : 'bg-transparent text-neutral-600 dark:text-neutral-400 border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
          >
            내 작업
          </button>

          {/* Filter Popover Button */}
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => setShowFilterPopover(!showFilterPopover)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                hasAdvancedFilters
                  ? 'bg-neutral-150 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700'
                  : 'bg-transparent text-neutral-600 dark:text-neutral-400 border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3 text-neutral-400" />
              <span>필터</span>
              {hasAdvancedFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white" />
              )}
            </button>

            {/* Filter Dropdown Popover */}
            {showFilterPopover && (
              <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-[#18191c] rounded-xl shadow-xl border border-neutral-200/80 dark:border-neutral-800 p-3 z-40 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-1 border-b border-neutral-100 dark:border-neutral-800/80 font-medium text-neutral-900 dark:text-neutral-100">
                  <span>상세 필터</span>
                  {hasAdvancedFilters && (
                    <button
                      onClick={() =>
                        setFilter((prev) => ({
                          ...prev,
                          priority: 'all',
                          dueDateStatus: 'all',
                          tag: 'all',
                          assigneeId: isMyTasksOnly ? currentUser.id : 'all',
                        }))
                      }
                      className="text-[11px] text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                    >
                      초기화
                    </button>
                  )}
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">담당자</label>
                  <select
                    value={filter.assigneeId}
                    onChange={(e) => setFilter((prev) => ({ ...prev, assigneeId: e.target.value }))}
                    className="w-full py-1 px-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  >
                    <option value="all">전체 팀원</option>
                    {assignees.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id === 'user_1' ? '🦊 ' : a.id === 'user_2' ? '🐻 ' : '🐰 '}
                        {a.name} ({a.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">우선순위</label>
                  <select
                    value={filter.priority}
                    onChange={(e) => setFilter((prev) => ({ ...prev, priority: e.target.value }))}
                    className="w-full py-1 px-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  >
                    <option value="all">전체</option>
                    <option value="urgent">긴급 (Urgent)</option>
                    <option value="high">높음 (High)</option>
                    <option value="medium">보통 (Medium)</option>
                    <option value="low">낮음 (Low)</option>
                  </select>
                </div>

                {/* Due Date Status */}
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">마감 기한</label>
                  <select
                    value={filter.dueDateStatus}
                    onChange={(e) =>
                      setFilter((prev) => ({
                        ...prev,
                        dueDateStatus: e.target.value as FilterState['dueDateStatus'],
                      }))
                    }
                    className="w-full py-1 px-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  >
                    <option value="all">전체</option>
                    <option value="overdue">기한 초과</option>
                    <option value="today">오늘 마감</option>
                    <option value="week">이번 주</option>
                  </select>
                </div>

                {/* Tag */}
                {allTags.length > 0 && (
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">태그</label>
                    <select
                      value={filter.tag}
                      onChange={(e) => setFilter((prev) => ({ ...prev, tag: e.target.value }))}
                      className="w-full py-1 px-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none"
                    >
                      <option value="all">전체</option>
                      {allTags.map((tag) => (
                        <option key={tag} value={tag}>
                          #{tag}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reset All Filters button */}
          {isAnyFilterActive && (
            <button
              onClick={resetFilter}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-xs transition-colors ml-1"
            >
              초기화
            </button>
          )}
        </div>

        {/* Right: Task Count & Batch Action */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-neutral-400 font-mono text-[11px]">
            {filteredTasksCount}개의 작업
          </span>

          {doneTasksCount > 0 && (
            <button
              onClick={archiveAllDoneTasks}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rounded-lg transition-colors border border-neutral-200/80 dark:border-neutral-800"
              title="완료 컬럼의 작업을 모두 보관함으로 옮깁니다."
            >
              <Archive className="w-3 h-3 text-neutral-400" />
              <span>완료 보관 ({doneTasksCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
