import React, { useMemo, useState } from 'react';
import { ColumnId, Task } from '../types/kanban';
import { useKanban } from '../context/KanbanContext';
import { KanbanColumn } from './KanbanColumn';
import { getDueStatus } from '../utils/dateUtils';

interface KanbanBoardProps {
  onOpenNewTaskForColumn: (columnId: ColumnId) => void;
  onEditTask: (task: Task) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  onOpenNewTaskForColumn,
  onEditTask,
}) => {
  const { tasks, columns, filter } = useKanban();
  const [selectedMobileColumn, setSelectedMobileColumn] = useState<ColumnId | 'all'>('all');

  // Filter tasks based on active filter state
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Search Query
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(query);
        const descMatch = (task.description || '').toLowerCase().includes(query);
        const tagMatch = task.tags?.some((t) => t.toLowerCase().includes(query));
        if (!titleMatch && !descMatch && !tagMatch) return false;
      }

      // 2. Assignee Filter
      if (filter.assigneeId !== 'all') {
        if (task.assigneeId !== filter.assigneeId) return false;
      }

      // 3. Priority Filter
      if (filter.priority !== 'all') {
        if (task.priority !== filter.priority) return false;
      }

      // 4. Due Date Status Filter
      if (filter.dueDateStatus !== 'all') {
        const { status } = getDueStatus(task.dueDate);
        if (filter.dueDateStatus === 'overdue' && status !== 'overdue') return false;
        if (filter.dueDateStatus === 'today' && status !== 'today') return false;
        if (filter.dueDateStatus === 'week' && status !== 'today' && status !== 'tomorrow' && status !== 'soon') return false;
      }

      // 5. Tag Filter
      if (filter.tag !== 'all') {
        if (!task.tags?.includes(filter.tag)) return false;
      }

      return true;
    });
  }, [tasks, filter]);

  // Group tasks by column
  const tasksByColumn = useMemo(() => {
    const map: Record<ColumnId, Task[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };

    filteredTasks.forEach((task) => {
      if (map[task.columnId]) {
        map[task.columnId].push(task);
      } else {
        map.backlog.push(task);
      }
    });

    return map;
  }, [filteredTasks]);

  const visibleColumns = selectedMobileColumn === 'all'
    ? columns
    : columns.filter((c) => c.id === selectedMobileColumn);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#f9fafb] dark:bg-[#090a0b]">
      {/* Mobile Column Quick Switcher */}
      <div className="sm:hidden px-4 pt-2.5 pb-1 flex items-center gap-1.5 overflow-x-auto border-b border-neutral-200/50 dark:border-neutral-800/50">
        <button
          onClick={() => setSelectedMobileColumn('all')}
          className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
            selectedMobileColumn === 'all'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          전체 보기
        </button>
        {columns.map((col) => (
          <button
            key={col.id}
            onClick={() => setSelectedMobileColumn(col.id)}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedMobileColumn === col.id
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            {col.title} ({tasksByColumn[col.id]?.length || 0})
          </button>
        ))}
      </div>

      {/* Kanban Board Columns Horizontal Scroll Container */}
      <div className="flex-1 overflow-x-auto p-4 sm:p-6">
        <div className="flex gap-4 min-h-full items-stretch">
          {visibleColumns.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={tasksByColumn[col.id] || []}
              onOpenNewTaskForColumn={onOpenNewTaskForColumn}
              onEditTask={onEditTask}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
