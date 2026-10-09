import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, User, Flag, Tag, CheckSquare, Archive } from 'lucide-react';
import { Task, ColumnId, Priority, Subtask } from '../types/kanban';
import { useKanban } from '../context/KanbanContext';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  defaultColumnId?: ColumnId;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  defaultColumnId = 'todo',
}) => {
  const {
    columns,
    assignees,
    createTask,
    updateTask,
    deleteTask,
    archiveTask,
    currentUser,
  } = useKanban();

  const isEditing = !!taskToEdit;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState<ColumnId>(defaultColumnId);
  const [priority, setPriority] = useState<Priority>('medium');
  const [assigneeId, setAssigneeId] = useState<string>(currentUser.id);
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);

  useEffect(() => {
    setIsDeleteConfirming(false);
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setColumnId(taskToEdit.columnId);
      setPriority(taskToEdit.priority);
      setAssigneeId(taskToEdit.assigneeId);
      setDueDate(taskToEdit.dueDate || '');
      setTags(taskToEdit.tags || []);
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setColumnId(defaultColumnId);
      setPriority('medium');
      setAssigneeId(currentUser.id);
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 3);
      setDueDate(defaultDate.toISOString().split('T')[0]);
      setTags(['스프린트']);
      setSubtasks([]);
    }
    setNewTagInput('');
    setNewSubtaskInput('');
  }, [taskToEdit, defaultColumnId, currentUser.id, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSubtask = () => {
    const trimmed = newSubtaskInput.trim();
    if (trimmed) {
      const newSub: Subtask = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: trimmed,
        completed: false,
      };
      setSubtasks([...subtasks, newSub]);
      setNewSubtaskInput('');
    }
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEditing && taskToEdit) {
      updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        columnId,
        priority,
        assigneeId,
        dueDate,
        tags,
        subtasks,
      });
    } else {
      createTask({
        title: title.trim(),
        description: description.trim(),
        columnId,
        priority,
        assigneeId,
        dueDate,
        tags,
        subtasks,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-[#18191c] rounded-2xl shadow-2xl border border-neutral-200/80 dark:border-neutral-800 w-full max-w-lg overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-100">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800/80">
          <span className="text-xs font-medium text-neutral-400">
            {isEditing ? '작업 세부 정보' : '새 작업 만들기'}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[calc(85vh-100px)] overflow-y-auto">
          {/* Title */}
          <div>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="작업 제목을 입력하세요..."
              className="w-full text-base font-semibold text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 bg-transparent border-0 focus:outline-none p-0"
            />
          </div>

          {/* Description */}
          <div>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="세부 내용 또는 메모 추가..."
              className="w-full text-xs text-neutral-700 dark:text-neutral-300 placeholder-neutral-400 bg-transparent border-0 focus:outline-none p-0 resize-none leading-relaxed"
            />
          </div>

          <div className="h-px bg-neutral-100 dark:bg-neutral-800/80 my-2" />

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Status */}
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">상태</label>
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value as ColumnId)}
                className="w-full py-1.5 px-2 bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/80 dark:border-neutral-700/80 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">우선순위</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full py-1.5 px-2 bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/80 dark:border-neutral-700/80 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none"
              >
                <option value="urgent">긴급 (Urgent)</option>
                <option value="high">높음 (High)</option>
                <option value="medium">보통 (Medium)</option>
                <option value="low">낮음 (Low)</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">담당자</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full py-1.5 px-2 bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/80 dark:border-neutral-700/80 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none"
              >
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id === 'user_1' ? '🐶 ' : '🐴 '}
                    {a.name} ({a.role} · {a.id === 'user_1' ? '개띠/대표' : a.id === 'user_2' ? '말띠/기술' : '말띠/재무'})
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">마감 기한</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full py-1.5 px-2 bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/80 dark:border-neutral-700/80 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-neutral-400 font-medium">
                체크리스트 ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
              </span>
            </div>

            <div className="space-y-1 mb-2">
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-xs transition-colors"
                >
                  <label className="flex items-center gap-2 flex-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => handleToggleSubtask(sub.id)}
                      className="w-3.5 h-3.5 rounded text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-700 focus:ring-0"
                    />
                    <span
                      className={`${
                        sub.completed
                          ? 'line-through text-neutral-400'
                          : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {sub.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(sub.id)}
                    className="text-neutral-300 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="+ 세부 작업 입력 후 Enter..."
                className="flex-1 px-2.5 py-1 text-xs bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/80 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="pt-1">
            <span className="block text-[11px] text-neutral-400 mb-1.5 font-medium">태그</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="+ 태그 추가..."
                className="w-24 px-2 py-0.5 text-[11px] bg-transparent border-0 focus:outline-none text-neutral-700 dark:text-neutral-300 placeholder-neutral-400"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
            <div>
              {isEditing && taskToEdit && (
                <div className="flex items-center gap-2">
                  {isDeleteConfirming ? (
                    <div className="flex items-center gap-1.5 p-1 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-lg animate-in fade-in duration-100">
                      <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium px-1">
                        정말 삭제할까요?
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          deleteTask(taskToEdit.id);
                          onClose();
                        }}
                        className="px-2 py-0.5 text-[11px] bg-rose-600 hover:bg-rose-700 text-white font-medium rounded transition-colors shadow-2xs"
                      >
                        삭제 확인
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDeleteConfirming(false)}
                        className="px-1.5 py-0.5 text-[11px] text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsDeleteConfirming(true)}
                      className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2 py-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>작업 삭제</span>
                    </button>
                  )}

                  {taskToEdit.columnId === 'done' && !isDeleteConfirming && (
                    <button
                      type="button"
                      onClick={() => {
                        archiveTask(taskToEdit.id);
                        onClose();
                      }}
                      className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors ml-2"
                    >
                      보관함으로
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-lg shadow-xs transition-colors"
              >
                {isEditing ? '저장' : '작업 생성'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
