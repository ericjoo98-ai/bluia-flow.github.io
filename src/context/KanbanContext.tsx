import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Task,
  Column,
  Assignee,
  ActivityLog,
  AppNotification,
  FilterState,
  ActiveView,
  ColumnId,
  Priority,
} from '../types/kanban';
import {
  INITIAL_TASKS,
  INITIAL_COLUMNS,
  INITIAL_ASSIGNEES,
  INITIAL_ARCHIVED_TASKS,
  INITIAL_ACTIVITIES,
} from '../data/initialData';
import {
  getSupabaseClient,
  getStoredSupabaseConfig,
  taskToDb,
  dbToTask,
  archivedTaskToDb,
  dbToArchivedTask,
  activityToDb,
  dbToActivity,
  sendHeartbeatPing,
  getLastHeartbeat,
  getHeartbeatHistory,
  HeartbeatLog,
} from '../lib/supabase';

interface KanbanContextType {
  tasks: Task[];
  archivedTasks: Task[];
  columns: Column[];
  assignees: Assignee[];
  currentUser: Assignee;
  activities: ActivityLog[];
  notifications: AppNotification[];
  unreadNotificationCount: number;
  filter: FilterState;
  isDarkMode: boolean;
  activeView: ActiveView;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  liveSimulationActive: boolean;
  isAuthenticated: boolean;
  isSupabaseActive: boolean;

  // Supabase & Heartbeat
  uploadLocalDataToSupabase: () => Promise<number>;
  refreshFromSupabase: () => Promise<void>;
  lastHeartbeat: HeartbeatLog | null;
  heartbeatLogs: HeartbeatLog[];
  isHeartbeatRunning: boolean;
  triggerHeartbeat: () => Promise<HeartbeatLog>;

  // Actions
  login: (userId: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  createTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  moveTask: (id: string, targetColumnId: ColumnId, targetIndex?: number) => void;
  deleteTask: (id: string, isArchived?: boolean) => void;
  archiveTask: (id: string) => void;
  archiveAllDoneTasks: () => void;
  restoreTask: (id: string) => void;
  setCurrentUser: (user: Assignee) => void;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilter: () => void;
  toggleDarkMode: () => void;
  setActiveView: (view: ActiveView) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  exportBoardData: () => void;
  importBoardData: (jsonString: string) => { success: boolean; error?: string };
  resetToSampleData: () => void;
  toggleLiveSimulation: () => void;
}

const STORAGE_KEYS = {
  TASKS: 'sync_kanban_tasks_v2',
  ARCHIVED: 'sync_kanban_archived_v2',
  ACTIVITIES: 'sync_kanban_activities_v2',
  NOTIFICATIONS: 'sync_kanban_notifications_v2',
  THEME: 'sync_kanban_theme_v2',
  CURRENT_USER: 'sync_kanban_user_v2',
};

const KanbanContext = createContext<KanbanContextType | null>(null);

const DEFAULT_FILTER: FilterState = {
  searchQuery: '',
  assigneeId: 'all',
  priority: 'all',
  dueDateStatus: 'all',
  tag: 'all',
};

export const KanbanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Tab ID for distinguishing local vs remote broadcast
  const tabId = useMemo(() => `tab_${Math.random().toString(36).substring(2, 9)}`, []);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved !== null) {
      return saved === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Current User
  const [currentUser, setCurrentUserState] = useState<Assignee>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        let userId = saved;
        if (saved.startsWith('{')) {
          const parsed = JSON.parse(saved);
          userId = parsed.id || 'user_1';
        }
        const found = INITIAL_ASSIGNEES.find((a) => a.id === userId);
        if (found) return found;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ASSIGNEES[0];
  });

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((t: any) =>
            t.columnId === 'review' ? { ...t, columnId: 'in_progress' } : t
          );
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TASKS;
  });

  // Archived Tasks
  const [archivedTasks, setArchivedTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ARCHIVED);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ARCHIVED_TASKS;
  });

  // Activities
  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ACTIVITIES;
  });

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'notif_init_1',
        timestamp: new Date().toISOString(),
        title: '스프린트 마감일 점검',
        message: '"다크 모드 고대비 색상 체계 점검" 작업이 오늘 마감 예정입니다.',
        type: 'due_soon',
        taskId: 'task_2',
        read: false,
      },
      {
        id: 'notif_init_2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        title: '새로운 작업 할당',
        message: '주현우 님이 "실시간 Supabase DB 연동" 작업을 할당했습니다.',
        type: 'assigned',
        taskId: 'task_1',
        read: false,
      },
    ];
  });

  const [columns] = useState<Column[]>(() =>
    INITIAL_COLUMNS.filter((c) => (c.id as string) !== 'review')
  );
  const [assignees] = useState<Assignee[]>(INITIAL_ASSIGNEES);
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [activeView, setActiveView] = useState<ActiveView>('board');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());
  const [liveSimulationActive, setLiveSimulationActive] = useState<boolean>(false);
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(() => {
    return getStoredSupabaseConfig().isValid;
  });

  // Broadcast channel ref
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Apply dark mode class to <html> and <body>
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('dark');
      body.classList.remove('light');
      root.style.colorScheme = 'dark';
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      body.classList.remove('dark');
      body.classList.add('light');
      root.style.colorScheme = 'light';
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
  }, [isDarkMode]);

  // Persist states locally as instant cache / offline fallback
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ARCHIVED, JSON.stringify(archivedTasks));
  }, [archivedTasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Supabase Data Fetching
  const refreshFromSupabase = useCallback(async () => {
    const config = getStoredSupabaseConfig();
    setIsSupabaseActive(config.isValid);
    if (!config.isValid) return;

    const client = getSupabaseClient();
    if (!client) return;

    try {
      setIsSyncing(true);
      const [tasksRes, archivedRes, actsRes] = await Promise.all([
        client.from('tasks').select('*').order('created_at', { ascending: false }),
        client.from('archived_tasks').select('*').order('archived_at', { ascending: false }),
        client.from('activities').select('*').order('timestamp', { ascending: false }).limit(50),
      ]);

      if (!tasksRes.error && tasksRes.data) {
        if (tasksRes.data.length > 0) {
          setTasks(tasksRes.data.map(dbToTask));
        } else {
          // If Supabase table is empty (0 tasks), seed it with current local tasks so cloud is populated
          const currentLocalTasks = tasks.length > 0 ? tasks : INITIAL_TASKS;
          if (currentLocalTasks.length > 0) {
            client.from('tasks').upsert(currentLocalTasks.map(taskToDb)).then(() => {});
          }
        }
      }

      if (!archivedRes.error && archivedRes.data) {
        if (archivedRes.data.length > 0) {
          setArchivedTasks(archivedRes.data.map(dbToArchivedTask));
        }
      }

      if (!actsRes.error && actsRes.data) {
        if (actsRes.data.length > 0) {
          setActivities(actsRes.data.map(dbToActivity));
        }
      }

      setLastSyncTime(new Date());
    } catch (err) {
      console.warn('Supabase fetch error:', err);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  }, []);

  // Initial load from Supabase if configured
  useEffect(() => {
    refreshFromSupabase();
  }, [refreshFromSupabase]);

  // Heartbeat Keep-Alive State
  const [lastHeartbeat, setLastHeartbeat] = useState<HeartbeatLog | null>(() => getLastHeartbeat());
  const [heartbeatLogs, setHeartbeatLogs] = useState<HeartbeatLog[]>(() => getHeartbeatHistory());
  const [isHeartbeatRunning, setIsHeartbeatRunning] = useState<boolean>(false);

  const triggerHeartbeat = useCallback(async (): Promise<HeartbeatLog> => {
    setIsHeartbeatRunning(true);
    try {
      const res = await sendHeartbeatPing();
      const log: HeartbeatLog = {
        id: 'hb_' + Date.now(),
        timestamp: res.timestamp,
        latencyMs: res.latencyMs,
        success: res.success,
        message: res.message,
      };
      setLastHeartbeat(log);
      setHeartbeatLogs(getHeartbeatHistory());
      return log;
    } finally {
      setIsHeartbeatRunning(false);
    }
  }, []);

  // Heartbeat keep-alive scheduler:
  // Automatically sends a heartbeat ping every 10 minutes when Supabase is active
  // to ensure Supabase's free tier 7-day inactivity pause counter is constantly reset.
  useEffect(() => {
    if (!isSupabaseActive) return;

    // Trigger initial heartbeat
    triggerHeartbeat();

    // Set recurring keep-alive interval (10 minutes)
    const interval = setInterval(() => {
      triggerHeartbeat();
    }, 10 * 60 * 1000);

    // Ping on tab re-focus
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        triggerHeartbeat();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isSupabaseActive, triggerHeartbeat]);

  // Supabase Realtime Subscription
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    const channel = client
      .channel('blua_flow_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload: any) => {
          setIsSyncing(true);
          setLastSyncTime(new Date());
          setTimeout(() => setIsSyncing(false), 500);

          if (payload.eventType === 'INSERT') {
            const newTask = dbToTask(payload.new);
            setTasks((prev) => {
              if (prev.some((t) => t.id === newTask.id)) return prev;
              return [newTask, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = dbToTask(payload.new);
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          } else if (payload.eventType === 'DELETE') {
            const delId = payload.old.id;
            setTasks((prev) => prev.filter((t) => t.id !== delId));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'archived_tasks' },
        (payload: any) => {
          setIsSyncing(true);
          setLastSyncTime(new Date());
          setTimeout(() => setIsSyncing(false), 500);

          if (payload.eventType === 'INSERT') {
            const newArchived = dbToArchivedTask(payload.new);
            setArchivedTasks((prev) => {
              if (prev.some((t) => t.id === newArchived.id)) return prev;
              return [newArchived, ...prev];
            });
          } else if (payload.eventType === 'DELETE') {
            const delId = payload.old.id;
            setArchivedTasks((prev) => prev.filter((t) => t.id !== delId));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activities' },
        (payload: any) => {
          const newAct = dbToActivity(payload.new);
          setActivities((prev) => {
            if (prev.some((a) => a.id === newAct.id)) return prev;
            return [newAct, ...prev.slice(0, 49)];
          });
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [isSupabaseActive]);

  // Upload local data to Supabase (Initial seed helper)
  const uploadLocalDataToSupabase = useCallback(async (): Promise<number> => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase가 설정되지 않았습니다.');

    const dbTasks = tasks.map(taskToDb);
    const dbArchived = archivedTasks.map(archivedTaskToDb);
    const dbActs = activities.map(activityToDb);

    if (dbTasks.length > 0) {
      const { error: taskErr } = await client.from('tasks').upsert(dbTasks);
      if (taskErr) throw new Error(`Tasks 업로드 에러: ${taskErr.message}`);
    }

    if (dbArchived.length > 0) {
      const { error: archErr } = await client.from('archived_tasks').upsert(dbArchived);
      if (archErr) throw new Error(`Archived tasks 업로드 에러: ${archErr.message}`);
    }

    if (dbActs.length > 0) {
      const { error: actErr } = await client.from('activities').upsert(dbActs);
      if (actErr) throw new Error(`Activities 업로드 에러: ${actErr.message}`);
    }

    setLastSyncTime(new Date());
    return dbTasks.length + dbArchived.length;
  }, [tasks, archivedTasks, activities]);

  // Broadcast sync helper (fallback / multi-tab)
  const broadcastSync = useCallback(
    (actionType: string, payload: any) => {
      setLastSyncTime(new Date());
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 600);

      if (channelRef.current) {
        try {
          channelRef.current.postMessage({
            senderId: tabId,
            actionType,
            payload,
            timestamp: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Broadcast failed:', e);
        }
      }
    },
    [tabId]
  );

  // Setup BroadcastChannel
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('sync_kanban_channel');
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const { senderId, actionType, payload } = event.data || {};
        if (senderId === tabId) return; // Ignore own messages

        setIsSyncing(true);
        setLastSyncTime(new Date());
        setTimeout(() => setIsSyncing(false), 800);

        if (actionType === 'STATE_UPDATE') {
          if (payload.tasks) setTasks(payload.tasks);
          if (payload.archivedTasks) setArchivedTasks(payload.archivedTasks);
          if (payload.activities) setActivities(payload.activities);
          if (payload.notifications) setNotifications(payload.notifications);
        } else if (actionType === 'REMOTE_ACTION') {
          if (payload.activity) {
            setActivities((prev) => [payload.activity, ...prev.slice(0, 49)]);
            setNotifications((prev) => [
              {
                id: `notif_${Date.now()}_${Math.random()}`,
                timestamp: new Date().toISOString(),
                title: `${payload.activity.userName}님의 작업 변경`,
                message: `${payload.activity.taskTitle}: ${payload.activity.details}`,
                type: 'system',
                read: false,
              },
              ...prev.slice(0, 29),
            ]);
          }
          if (payload.tasks) setTasks(payload.tasks);
          if (payload.archivedTasks) setArchivedTasks(payload.archivedTasks);
        }
      };

      return () => {
        channel.close();
      };
    }
  }, [tabId]);

  // Simulated live team activity when enabled
  useEffect(() => {
    if (!liveSimulationActive) return;

    const interval = setInterval(() => {
      const otherMembers = assignees.filter((a) => a.id !== currentUser.id);
      if (otherMembers.length === 0) return;
      const randomMember = otherMembers[Math.floor(Math.random() * otherMembers.length)];

      setTasks((currentTasks) => {
        if (currentTasks.length === 0) return currentTasks;
        const candidateIndex = Math.floor(Math.random() * currentTasks.length);
        const task = currentTasks[candidateIndex];

        const columnTransitions: Record<ColumnId, ColumnId> = {
          backlog: 'todo',
          todo: 'in_progress',
          in_progress: 'review',
          review: 'done',
          done: 'in_progress',
        };

        const nextCol = columnTransitions[task.columnId];
        const nextColTitle = columns.find((c) => c.id === nextCol)?.title || nextCol;
        const prevColTitle = columns.find((c) => c.id === task.columnId)?.title || task.columnId;

        const updatedTask = {
          ...task,
          columnId: nextCol,
          updatedAt: new Date().toISOString(),
        };

        const newTasks = [...currentTasks];
        newTasks[candidateIndex] = updatedTask;

        const newActivity: ActivityLog = {
          id: `act_sim_${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: randomMember.id,
          userName: randomMember.name,
          userAvatar: randomMember.avatar,
          action: nextCol === 'done' ? 'complete' : 'move',
          taskTitle: task.title,
          details: `"${prevColTitle}"에서 "${nextColTitle}"(으)로 이동 (팀원 시뮬레이션)`,
        };

        setActivities((prev) => [newActivity, ...prev.slice(0, 49)]);

        setNotifications((prev) => [
          {
            id: `notif_sim_${Date.now()}`,
            timestamp: new Date().toISOString(),
            title: `[실시간 동기화] ${randomMember.name}님의 작업`,
            message: `"${task.title}"이(가) ${nextColTitle}(으)로 이동되었습니다.`,
            type: nextCol === 'done' ? 'completed' : 'system',
            taskId: task.id,
            read: false,
          },
          ...prev.slice(0, 29),
        ]);

        broadcastSync('REMOTE_ACTION', {
          activity: newActivity,
          tasks: newTasks,
        });

        // If Supabase is active, persist sim action
        const client = getSupabaseClient();
        if (client) {
          client.from('tasks').update({ column_id: nextCol, updated_at: updatedTask.updatedAt }).eq('id', task.id).then(() => {});
          client.from('activities').insert(activityToDb(newActivity)).then(() => {});
        }

        return newTasks;
      });
    }, 18000);

    return () => clearInterval(interval);
  }, [liveSimulationActive, assignees, currentUser, columns, broadcastSync]);

  // Log activity helper
  const addActivity = useCallback(
    (action: ActivityLog['action'], taskTitle: string, details: string) => {
      const newActivity: ActivityLog = {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        action,
        taskTitle,
        details,
      };

      setActivities((prev) => [newActivity, ...prev.slice(0, 49)]);

      const client = getSupabaseClient();
      if (client) {
        client.from('activities').insert(activityToDb(newActivity)).then(() => {});
      }

      return newActivity;
    },
    [currentUser]
  );

  // Create Task
  const createTask = useCallback(
    (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newTask: Task = {
        ...data,
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const nextTasks = [newTask, ...tasks];
      setTasks(nextTasks);

      const columnTitle = columns.find((c) => c.id === newTask.columnId)?.title || newTask.columnId;
      const activity = addActivity('create', newTask.title, `"${columnTitle}" 컬럼에 새 업무를 등록했습니다.`);

      // Add notification if assigned to another member
      if (newTask.assigneeId !== currentUser.id) {
        const assignee = assignees.find((a) => a.id === newTask.assigneeId);
        if (assignee) {
          setNotifications((prev) => [
            {
              id: `notif_${Date.now()}`,
              timestamp: new Date().toISOString(),
              title: '업무 할당 알림',
              message: `${currentUser.name} 님이 ${assignee.name} 님에게 "${newTask.title}" 작업을 배정했습니다.`,
              type: 'assigned',
              taskId: newTask.id,
              read: false,
            },
            ...prev.slice(0, 29),
          ]);
        }
      }

      broadcastSync('STATE_UPDATE', { tasks: nextTasks, activity });

      // Supabase persist
      const client = getSupabaseClient();
      if (client) {
        client.from('tasks').insert(taskToDb(newTask)).then(() => {});
      }
    },
    [tasks, columns, addActivity, currentUser, assignees, broadcastSync]
  );

  // Update Task
  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      const existingTask = tasks.find((t) => t.id === id);
      if (!existingTask) return;

      const updatedTask: Task = {
        ...existingTask,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const nextTasks = tasks.map((t) => (t.id === id ? updatedTask : t));

      setTasks(nextTasks);
      const activity = addActivity('update', updatedTask.title, '태스크 세부 정보가 수정되었습니다.');

      broadcastSync('STATE_UPDATE', { tasks: nextTasks, activity });

      // Supabase persist
      const client = getSupabaseClient();
      if (client) {
        client.from('tasks').upsert(taskToDb(updatedTask)).then(() => {});
      }
    },
    [tasks, addActivity, broadcastSync]
  );

  // Move Task
  const moveTask = useCallback(
    (id: string, targetColumnId: ColumnId, targetIndex?: number) => {
      const taskIndex = tasks.findIndex((t) => t.id === id);
      if (taskIndex === -1) return;

      const currentTask = tasks[taskIndex];
      const prevColTitle = columns.find((c) => c.id === currentTask.columnId)?.title || currentTask.columnId;
      const nextColTitle = columns.find((c) => c.id === targetColumnId)?.title || targetColumnId;

      const updatedTask: Task = {
        ...currentTask,
        columnId: targetColumnId,
        updatedAt: new Date().toISOString(),
      };

      // Filter out from current position
      const remainingTasks = tasks.filter((t) => t.id !== id);

      let nextTasks: Task[];
      if (targetIndex !== undefined) {
        const columnTasks = remainingTasks.filter((t) => t.columnId === targetColumnId);
        const otherTasks = remainingTasks.filter((t) => t.columnId !== targetColumnId);

        columnTasks.splice(targetIndex, 0, updatedTask);
        nextTasks = [...columnTasks, ...otherTasks];
      } else {
        nextTasks = [updatedTask, ...remainingTasks];
      }

      setTasks(nextTasks);

      const isCompleted = targetColumnId === 'done';
      const actionType = isCompleted ? 'complete' : 'move';
      const details =
        currentTask.columnId === targetColumnId
          ? '컬럼 내 순서를 재배치함'
          : `"${prevColTitle}"에서 "${nextColTitle}"(으)로 이동함`;

      const activity = addActivity(actionType, currentTask.title, details);

      if (isCompleted && currentTask.columnId !== 'done') {
        setNotifications((prev) => [
          {
            id: `notif_${Date.now()}`,
            timestamp: new Date().toISOString(),
            title: '작업 완료 알림',
            message: `"${currentTask.title}" 작업이 성공적으로 완료되었습니다.`,
            type: 'completed',
            taskId: currentTask.id,
            read: false,
          },
          ...prev.slice(0, 29),
        ]);
      }

      broadcastSync('STATE_UPDATE', { tasks: nextTasks, activity });

      // Supabase persist
      const client = getSupabaseClient();
      if (client) {
        client
          .from('tasks')
          .update({ column_id: targetColumnId, updated_at: updatedTask.updatedAt })
          .eq('id', id)
          .then(() => {});
      }
    },
    [tasks, columns, addActivity, broadcastSync]
  );

  // Delete Task
  const deleteTask = useCallback(
    (id: string, isArchived = false) => {
      const client = getSupabaseClient();
      if (isArchived) {
        const task = archivedTasks.find((t) => t.id === id);
        const nextArchived = archivedTasks.filter((t) => t.id !== id);
        setArchivedTasks(nextArchived);
        if (task) {
          addActivity('delete', task.title, '보관함에서 영구 삭제되었습니다.');
        }
        broadcastSync('STATE_UPDATE', { archivedTasks: nextArchived });

        if (client) {
          client.from('archived_tasks').delete().eq('id', id).then(() => {});
        }
      } else {
        const task = tasks.find((t) => t.id === id);
        const nextTasks = tasks.filter((t) => t.id !== id);
        setTasks(nextTasks);
        if (task) {
          addActivity('delete', task.title, '보드에서 삭제되었습니다.');
        }
        broadcastSync('STATE_UPDATE', { tasks: nextTasks });

        if (client) {
          client.from('tasks').delete().eq('id', id).then(() => {});
        }
      }
    },
    [tasks, archivedTasks, addActivity, broadcastSync]
  );

  // Archive Task
  const archiveTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const archivedItem: Task = {
        ...task,
        archived: true,
        archivedAt: new Date().toISOString(),
      };

      const nextTasks = tasks.filter((t) => t.id !== id);
      const nextArchived = [archivedItem, ...archivedTasks];

      setTasks(nextTasks);
      setArchivedTasks(nextArchived);

      const activity = addActivity('archive', task.title, '완료 보관함으로 이동하여 보관 처리되었습니다.');
      broadcastSync('STATE_UPDATE', { tasks: nextTasks, archivedTasks: nextArchived, activity });

      // Supabase persist
      const client = getSupabaseClient();
      if (client) {
        client.from('tasks').delete().eq('id', id).then(() => {});
        client.from('archived_tasks').upsert(archivedTaskToDb(archivedItem)).then(() => {});
      }
    },
    [tasks, archivedTasks, addActivity, broadcastSync]
  );

  // Archive All Done Tasks
  const archiveAllDoneTasks = useCallback(() => {
    const doneTasks = tasks.filter((t) => t.columnId === 'done');
    if (doneTasks.length === 0) return;

    const timestamp = new Date().toISOString();
    const newlyArchived = doneTasks.map((t) => ({
      ...t,
      archived: true,
      archivedAt: timestamp,
    }));

    const nextTasks = tasks.filter((t) => t.columnId !== 'done');
    const nextArchived = [...newlyArchived, ...archivedTasks];

    setTasks(nextTasks);
    setArchivedTasks(nextArchived);

    const activity = addActivity(
      'archive',
      `완료 업무 일괄 보관 (${doneTasks.length}건)`,
      `완료된 ${doneTasks.length}개의 업무를 모두 보관함으로 옮겼습니다.`
    );

    broadcastSync('STATE_UPDATE', { tasks: nextTasks, archivedTasks: nextArchived, activity });

    // Supabase persist
    const client = getSupabaseClient();
    if (client) {
      const ids = doneTasks.map((t) => t.id);
      client.from('tasks').delete().in('id', ids).then(() => {});
      client.from('archived_tasks').upsert(newlyArchived.map(archivedTaskToDb)).then(() => {});
    }
  }, [tasks, archivedTasks, addActivity, broadcastSync]);

  // Restore Task from Archive
  const restoreTask = useCallback(
    (id: string) => {
      const task = archivedTasks.find((t) => t.id === id);
      if (!task) return;

      const restoredItem: Task = {
        ...task,
        archived: false,
        archivedAt: undefined,
        columnId: 'todo', // Place back in todo column
        updatedAt: new Date().toISOString(),
      };

      const nextArchived = archivedTasks.filter((t) => t.id !== id);
      const nextTasks = [restoredItem, ...tasks];

      setArchivedTasks(nextArchived);
      setTasks(nextTasks);

      const activity = addActivity('restore', task.title, '보관함에서 "할 일" 컬럼으로 복원되었습니다.');
      broadcastSync('STATE_UPDATE', { tasks: nextTasks, archivedTasks: nextArchived, activity });

      // Supabase persist
      const client = getSupabaseClient();
      if (client) {
        client.from('archived_tasks').delete().eq('id', id).then(() => {});
        client.from('tasks').upsert(taskToDb(restoredItem)).then(() => {});
      }
    },
    [tasks, archivedTasks, addActivity, broadcastSync]
  );

  // Switch current active user
  const setCurrentUser = useCallback((user: Assignee) => {
    setCurrentUserState(user);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, user.id);
  }, []);

  // Reset filters
  const resetFilter = useCallback(() => {
    setFilter(DEFAULT_FILTER);
  }, []);

  // Dark mode toggle
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  // Notifications helpers
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Export board data as JSON file
  const exportBoardData = useCallback(() => {
    const exportObject = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tasks,
      archivedTasks,
      activities,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `blua_flow_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [tasks, archivedTasks, activities]);

  // Import board data from JSON
  const importBoardData = useCallback(
    (jsonString: string): { success: boolean; error?: string } => {
      try {
        const parsed = JSON.parse(jsonString);
        if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
          return { success: false, error: '유효한 blua_flow 백업 파일 형식이 아닙니다.' };
        }

        setTasks(parsed.tasks);
        if (parsed.archivedTasks && Array.isArray(parsed.archivedTasks)) {
          setArchivedTasks(parsed.archivedTasks);
        }
        if (parsed.activities && Array.isArray(parsed.activities)) {
          setActivities(parsed.activities);
        }

        broadcastSync('STATE_UPDATE', {
          tasks: parsed.tasks,
          archivedTasks: parsed.archivedTasks || [],
          activities: parsed.activities || [],
        });

        // Supabase upsert if configured
        const client = getSupabaseClient();
        if (client) {
          if (parsed.tasks.length > 0) {
            client.from('tasks').upsert(parsed.tasks.map(taskToDb)).then(() => {});
          }
          if (parsed.archivedTasks && parsed.archivedTasks.length > 0) {
            client.from('archived_tasks').upsert(parsed.archivedTasks.map(archivedTaskToDb)).then(() => {});
          }
        }

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'JSON 파싱 오류가 발생했습니다.' };
      }
    },
    [broadcastSync]
  );

  // Reset to factory sample data
  const resetToSampleData = useCallback(() => {
    setTasks(INITIAL_TASKS);
    setArchivedTasks(INITIAL_ARCHIVED_TASKS);
    setActivities(INITIAL_ACTIVITIES);
    broadcastSync('STATE_UPDATE', {
      tasks: INITIAL_TASKS,
      archivedTasks: INITIAL_ARCHIVED_TASKS,
      activities: INITIAL_ACTIVITIES,
    });
  }, [broadcastSync]);

  // Auth & Fixed password
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('flowdeck_auth_session') === 'true';
  });

  const login = useCallback(
    (userId: string, password: string) => {
      if (password !== 'bluia0625') {
        return { success: false, error: '비밀번호가 올바르지 않습니다.' };
      }
      const foundUser = assignees.find((a) => a.id === userId);
      if (!foundUser) {
        return { success: false, error: '선택한 작업자를 찾을 수 없습니다.' };
      }
      setCurrentUserState(foundUser);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, foundUser.id);
      localStorage.setItem('flowdeck_auth_session', 'true');
      setIsAuthenticated(true);
      return { success: true };
    },
    [assignees]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('flowdeck_auth_session');
    setIsAuthenticated(false);
  }, []);

  const toggleLiveSimulation = useCallback(() => {
    setLiveSimulationActive((prev) => !prev);
  }, []);

  return (
    <KanbanContext.Provider
      value={{
        tasks,
        archivedTasks,
        columns,
        assignees,
        currentUser,
        activities,
        notifications,
        unreadNotificationCount,
        filter,
        isDarkMode,
        activeView,
        isSyncing,
        lastSyncTime,
        liveSimulationActive,
        isAuthenticated,
        isSupabaseActive,
        uploadLocalDataToSupabase,
        refreshFromSupabase,
        lastHeartbeat,
        heartbeatLogs,
        isHeartbeatRunning,
        triggerHeartbeat,
        login,
        logout,
        createTask,
        updateTask,
        moveTask,
        deleteTask,
        archiveTask,
        archiveAllDoneTasks,
        restoreTask,
        setCurrentUser,
        setFilter,
        resetFilter,
        toggleDarkMode,
        setActiveView,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        exportBoardData,
        importBoardData,
        resetToSampleData,
        toggleLiveSimulation,
      }}
    >
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
};
