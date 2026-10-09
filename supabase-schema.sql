-- ============================================================
-- blua_flow: Supabase PostgreSQL Schema & Realtime Setup
-- Supabase SQL Editor에 복사하여 [RUN]을 누르면 즉시 설정됩니다.
-- ============================================================

-- 1. tasks 테이블 생성
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  column_id TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  assignee_id TEXT NOT NULL DEFAULT 'user_1',
  due_date TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  subtasks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. archived_tasks 테이블 생성
CREATE TABLE IF NOT EXISTS public.archived_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  column_id TEXT NOT NULL DEFAULT 'done',
  priority TEXT NOT NULL DEFAULT 'medium',
  assignee_id TEXT NOT NULL DEFAULT 'user_1',
  due_date TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  subtasks JSONB DEFAULT '[]'::jsonb,
  archived_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. activities 테이블 생성
CREATE TABLE IF NOT EXISTS public.activities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT DEFAULT '',
  action TEXT NOT NULL,
  task_title TEXT NOT NULL,
  details TEXT DEFAULT '',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS) 및 공개 접근 정책
-- ============================================================
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archived_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 모든 사용자(anon key) 읽기/쓰기/수정/삭제 허용 정책
CREATE POLICY "Allow anon all on tasks" ON public.tasks
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon all on archived_tasks" ON public.archived_tasks
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon all on activities" ON public.activities
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 실시간 변경 사항 브로드캐스트 (Realtime Publication) 활성화
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.archived_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
