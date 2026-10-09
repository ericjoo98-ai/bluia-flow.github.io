export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type ColumnId = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

export interface Assignee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  columnId: ColumnId;
  priority: Priority;
  assigneeId: string;
  dueDate: string; // ISO format: YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
  tags: string[];
  subtasks: Subtask[];
  archived?: boolean;
  archivedAt?: string;
}

export interface Column {
  id: ColumnId;
  title: string;
  description: string;
  color: string;
  limit?: number; // Optional WIP limit
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: 'create' | 'move' | 'update' | 'archive' | 'restore' | 'delete' | 'complete';
  taskTitle: string;
  details: string;
}

export interface AppNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'due_soon' | 'overdue' | 'assigned' | 'completed' | 'system';
  taskId?: string;
  read: boolean;
}

export interface FilterState {
  searchQuery: string;
  assigneeId: string;
  priority: string;
  dueDateStatus: 'all' | 'overdue' | 'today' | 'week';
  tag: string;
}

export type ActiveView = 'board' | 'dashboard' | 'archive' | 'activity' | 'deploy_guide';
