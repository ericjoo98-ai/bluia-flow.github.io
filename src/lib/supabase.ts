import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Task, ActivityLog } from '../types/kanban';

// User-provided Supabase API Keys (Default hardcoded credentials)
export const DEFAULT_SUPABASE_PROJECT_ID = 'otzkhkbfjhqkjhmnbypr';
export const DEFAULT_SUPABASE_URL = 'https://otzkhkbfjhqkjhmnbypr.supabase.co';
export const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_D6rzjpoLXQULCEDfcQhOIQ_yNNA5tHN';
export const DEFAULT_SUPABASE_SECRET_KEY = '';

const STORAGE_KEY_URL = 'blua_supabase_url';
const STORAGE_KEY_ANON = 'blua_supabase_anon_key';
const STORAGE_KEY_SECRET = 'blua_supabase_secret_key';
const STORAGE_KEY_HEARTBEAT_HISTORY = 'blua_heartbeat_history';
const STORAGE_KEY_HEARTBEAT_LAST = 'blua_heartbeat_last';

export interface HeartbeatLog {
  id: string;
  timestamp: string;
  latencyMs: number;
  success: boolean;
  message: string;
}

export function normalizeSupabaseUrl(input: string): string {
  let cleaned = (input || '').trim();
  if (!cleaned) return '';
  if (cleaned.startsWith('https://') || cleaned.startsWith('http://')) {
    return cleaned.replace(/\/+$/, '');
  }
  // If user entered only project ref e.g. "otzkhkbfjhqkjhmnbypr" or "d6rzjpo..."
  if (/^[a-zA-Z0-9_-]+$/.test(cleaned)) {
    return `https://${cleaned}.supabase.co`;
  }
  return cleaned;
}

export function getStoredSupabaseConfig() {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON) : null;
  const localSecret = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_SECRET) : null;

  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  // Use local storage if set and valid, otherwise fall back to environment or default hardcoded credentials
  let rawUrl = (localUrl?.trim() || envUrl.trim() || DEFAULT_SUPABASE_URL).trim();
  if (!rawUrl || rawUrl === 'null' || rawUrl === 'undefined' || rawUrl.includes('your-project-id')) {
    rawUrl = DEFAULT_SUPABASE_URL;
  }

  let anonKey = (localKey?.trim() || envKey.trim() || DEFAULT_SUPABASE_PUBLISHABLE_KEY).trim();
  if (!anonKey || anonKey === 'null' || anonKey === 'undefined' || anonKey.includes('your-anon-key')) {
    anonKey = DEFAULT_SUPABASE_PUBLISHABLE_KEY;
  }

  let secretKey = (localSecret?.trim() || DEFAULT_SUPABASE_SECRET_KEY).trim();
  if (!secretKey || secretKey === 'null' || secretKey === 'undefined') {
    secretKey = DEFAULT_SUPABASE_SECRET_KEY;
  }

  const url = normalizeSupabaseUrl(rawUrl);

  const isValid = Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    !url.includes('your-project-id')
  );

  return { url, anonKey, secretKey, isValid, isFromEnv: Boolean(!localUrl && (envUrl || DEFAULT_SUPABASE_URL)) };
}

let clientInstance: SupabaseClient | null = null;
let currentClientKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.isValid) return null;

  const keyCombo = `${config.url}_${config.anonKey}`;
  if (clientInstance && currentClientKey === keyCombo) {
    return clientInstance;
  }

  try {
    clientInstance = createClient(config.url, config.anonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      auth: {
        persistSession: false,
      },
    });
    currentClientKey = keyCombo;
    return clientInstance;
  } catch (err) {
    console.error('Failed to init Supabase client:', err);
    return null;
  }
}

// Backward compatibility export
export const isSupabaseConfigured = getStoredSupabaseConfig().isValid;
export const supabase = getSupabaseClient();

export function saveSupabaseConfig(url: string, anonKey: string, secretKey?: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, normalizeSupabaseUrl(url));
    localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
    if (secretKey) {
      localStorage.setItem(STORAGE_KEY_SECRET, secretKey.trim());
    }
  }
  clientInstance = null;
  currentClientKey = '';
}

export function clearSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
    localStorage.removeItem(STORAGE_KEY_SECRET);
  }
  clientInstance = null;
  currentClientKey = '';
}

export async function testSupabaseConnection(
  url: string,
  key: string
): Promise<{ success: boolean; message: string; tableReady?: boolean }> {
  try {
    const normalizedUrl = normalizeSupabaseUrl(url);
    const testClient = createClient(normalizedUrl, key);
    const { error } = await testClient.from('tasks').select('id').limit(1);
    if (error) {
      if (
        error.code === '42P01' ||
        error.message?.includes('does not exist') ||
        error.message?.includes('relation "public.tasks"')
      ) {
        return {
          success: true,
          tableReady: false,
          message: 'Supabase 연결 성공! 단, SQL Editor에서 테이블 생성 스크립트를 1회 실행해주세요.',
        };
      }
      return {
        success: false,
        message: `인증 또는 연결 오류 (${error.code || 'ERR'}): ${error.message}`,
      };
    }
    return {
      success: true,
      tableReady: true,
      message: 'Supabase 및 데이터 테이블과 성공적으로 연결되었습니다!',
    };
  } catch (err: any) {
    return { success: false, message: err?.message || '연결 시도 중 에러가 발생했습니다.' };
  }
}

// ==========================================
// Heartbeat (하트비트) Keep-Alive Engine
// Supabase 무료 요금제 7일 비활성 일시중단(Paused) 방지
// ==========================================

export function getHeartbeatHistory(): HeartbeatLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HEARTBEAT_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getLastHeartbeat(): HeartbeatLog | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HEARTBEAT_LAST);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function sendHeartbeatPing(
  customUrl?: string,
  customKey?: string
): Promise<{
  success: boolean;
  latencyMs: number;
  message: string;
  timestamp: string;
}> {
  const config = getStoredSupabaseConfig();
  const url = normalizeSupabaseUrl(customUrl || config.url || '');
  const key = (customKey || config.anonKey || '').trim();

  if (!url || !key) {
    return {
      success: false,
      latencyMs: 0,
      message: 'Supabase Project URL이 설정되어 있지 않습니다.',
      timestamp: new Date().toISOString(),
    };
  }

  const startTime = performance.now();
  try {
    const testClient = createClient(url, key);
    // Lightweight select to hit PostgREST and register active API traffic on Supabase
    const { error } = await testClient.from('tasks').select('id').limit(1);
    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));

    const isConnected = !error || error.code === '42P01' || error.message?.includes('does not exist');
    const message = isConnected
      ? `하트비트 정상 전송 (${latencyMs}ms) - DB 일시중단 방지 활성화`
      : `하트비트 응답 오류: ${error.message}`;

    const log: HeartbeatLog = {
      id: 'hb_' + Date.now(),
      timestamp: new Date().toISOString(),
      latencyMs,
      success: isConnected,
      message,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_HEARTBEAT_LAST, JSON.stringify(log));
      const history = getHeartbeatHistory();
      const updated = [log, ...history].slice(0, 20);
      localStorage.setItem(STORAGE_KEY_HEARTBEAT_HISTORY, JSON.stringify(updated));
    }

    return {
      success: isConnected,
      latencyMs,
      message,
      timestamp: log.timestamp,
    };
  } catch (err: any) {
    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    const log: HeartbeatLog = {
      id: 'hb_' + Date.now(),
      timestamp: new Date().toISOString(),
      latencyMs,
      success: false,
      message: err?.message || '하트비트 전송 중 네트워크 오류',
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_HEARTBEAT_LAST, JSON.stringify(log));
      const history = getHeartbeatHistory();
      const updated = [log, ...history].slice(0, 20);
      localStorage.setItem(STORAGE_KEY_HEARTBEAT_HISTORY, JSON.stringify(updated));
    }

    return {
      success: false,
      latencyMs,
      message: log.message,
      timestamp: log.timestamp,
    };
  }
}

export const SUPABASE_PG_CRON_SQL = `-- ==========================================
-- blua_flow: 24시간 무중단 자동 하트비트 (pg_cron)
-- 브라우저를 닫아도 Supabase가 7일 후 중단(Paused)되지 않도록 자체 실행
-- Supabase 대시보드 > SQL Editor 에서 붙여넣고 [Run] 을 누르세요
-- ==========================================

-- 1. pg_cron 확장 활성화
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. 매 6시간마다 tasks 테이블을 조회하여 DB 활성 상태 유지
SELECT cron.schedule(
  'blua_flow_keep_alive',
  '0 */6 * * *',
  'SELECT count(*) FROM public.tasks;'
);

-- 3. 스케줄 정상 등록 확인
SELECT * FROM cron.job;
`;

// Mappings for DB serialization
export function taskToDb(task: Task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description || '',
    column_id: task.columnId,
    priority: task.priority,
    assignee_id: task.assigneeId,
    due_date: task.dueDate || null,
    tags: task.tags || [],
    subtasks: task.subtasks || [],
    created_at: task.createdAt,
    updated_at: task.updatedAt,
  };
}

export function dbToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    columnId: row.column_id === 'review' ? 'in_progress' : row.column_id,
    priority: row.priority,
    assigneeId: row.assignee_id,
    dueDate: row.due_date || '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function archivedTaskToDb(task: Task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description || '',
    column_id: task.columnId,
    priority: task.priority,
    assignee_id: task.assigneeId,
    due_date: task.dueDate || null,
    tags: task.tags || [],
    subtasks: task.subtasks || [],
    archived_at: task.archivedAt || new Date().toISOString(),
    created_at: task.createdAt,
    updated_at: task.updatedAt,
  };
}

export function dbToArchivedTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    columnId: row.column_id,
    priority: row.priority,
    assigneeId: row.assignee_id,
    dueDate: row.due_date || '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
  };
}

export function activityToDb(act: ActivityLog) {
  return {
    id: act.id,
    timestamp: act.timestamp,
    user_id: act.userId,
    user_name: act.userName,
    user_avatar: act.userAvatar || null,
    action: act.action,
    task_title: act.taskTitle,
    details: act.details,
  };
}

export function dbToActivity(row: any): ActivityLog {
  return {
    id: row.id,
    timestamp: row.timestamp,
    userId: row.user_id,
    userName: row.user_name,
    userAvatar: row.user_avatar || '',
    action: row.action,
    taskTitle: row.task_title,
    details: row.details || '',
  };
}

export const SUPABASE_SQL_SETUP = `-- ==========================================
-- blua_flow: Supabase DB 초기 테이블 생성 스크립트
-- Supabase 대시보드 > SQL Editor 에서 붙여넣고 [Run] 을 누르세요
-- ==========================================

-- 1. 칸반 보드 작업 (tasks) 테이블
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  column_id TEXT NOT NULL,
  priority TEXT NOT NULL,
  assignee_id TEXT NOT NULL,
  due_date TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  subtasks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 보관된 작업 (archived_tasks) 테이블
CREATE TABLE IF NOT EXISTS public.archived_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  column_id TEXT NOT NULL,
  priority TEXT NOT NULL,
  assignee_id TEXT NOT NULL,
  due_date TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  subtasks JSONB DEFAULT '[]'::jsonb,
  archived_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 활동 로그 (activities) 테이블
CREATE TABLE IF NOT EXISTS public.activities (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  action TEXT NOT NULL,
  task_title TEXT NOT NULL,
  details TEXT
);

-- 4. RLS (Row Level Security) 설정 및 팀 공용 접근 권한 오픈
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archived_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks_access_policy" ON public.tasks;
CREATE POLICY "tasks_access_policy" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "archived_tasks_access_policy" ON public.archived_tasks;
CREATE POLICY "archived_tasks_access_policy" ON public.archived_tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "activities_access_policy" ON public.activities;
CREATE POLICY "activities_access_policy" ON public.activities FOR ALL USING (true) WITH CHECK (true);

-- 5. 실시간 동기화 (Realtime) 복제 활성화
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'archived_tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.archived_tasks;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'activities'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
  END IF;
END $$;
`;
