import React, { useState } from 'react';
import { X, Copy, Check, Database, ExternalLink, Terminal, ShieldCheck, Zap } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface SupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPABASE_SQL_SCRIPT = `-- 1. tasks 테이블 생성
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

-- RLS 활성화 및 공개 접근 허용
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archived_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon all on tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on archived_tasks" ON public.archived_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on activities" ON public.activities FOR ALL USING (true) WITH CHECK (true);

-- 실시간 웹소켓 브로드캐스트 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.archived_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;`;

export const SupabaseGuideModal: React.FC<SupabaseGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCopyEnv = () => {
    const envTemplate = `VITE_SUPABASE_URL=https://your-project-id.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-public-key`;
    navigator.clipboard.writeText(envTemplate);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-[#18191c] rounded-2xl shadow-2xl border border-neutral-200/80 dark:border-neutral-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              Supabase 클라우드 실시간 DB 연동 가이드
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 text-xs max-h-[calc(85vh-100px)] overflow-y-auto leading-relaxed">
          {/* Status Box */}
          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            isSupabaseConfigured
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
              : 'bg-neutral-50 dark:bg-neutral-850 border-neutral-200/80 dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-300'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
              <span className="font-medium">
                {isSupabaseConfigured ? 'Supabase 실시간 클라우드 DB 연결 활성화됨' : '현재 로컬 스토리지 모드로 작동 중'}
              </span>
            </div>
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>supabase.com 바로가기</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Step 1 */}
          <div className="space-y-1.5">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
              1단계: 무료 Supabase 프로젝트 생성
            </div>
            <p className="text-neutral-500 text-[11px]">
              <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline text-emerald-600">supabase.com</a>에 GitHub 계정으로 로그인 후 <strong>New Project</strong>를 클릭해 무료 프로젝트를 만듭니다 (약 1분 소요).
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                2단계: 테이블 & 실시간 권한 생성 (SQL Editor)
              </span>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1 px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg text-[11px] font-medium transition-colors"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? '복사됨!' : 'SQL 쿼리 복사'}</span>
              </button>
            </div>
            <p className="text-neutral-500 text-[11px]">
              Supabase 대시보드 좌측 메뉴의 <strong>SQL Editor</strong>에 들어가서 아래 코드를 붙여넣고 <strong>[Run]</strong> 버튼을 누르면 끝납니다.
            </p>
            <pre className="p-3 bg-neutral-950 text-neutral-300 rounded-xl font-mono text-[10px] leading-relaxed overflow-x-auto border border-neutral-800 max-h-40">
              {SUPABASE_SQL_SCRIPT}
            </pre>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                3단계: 환경변수 키 확인 및 설정
              </span>
              <button
                onClick={handleCopyEnv}
                className="flex items-center gap-1 px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg text-[11px] font-medium transition-colors"
              >
                {copiedEnv ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedEnv ? '복사됨!' : '.env 복사'}</span>
              </button>
            </div>
            <p className="text-neutral-500 text-[11px]">
              Supabase 대시보드의 <strong>Project Settings &gt; API</strong>에서 <strong>Project URL</strong>과 <strong>anon/public Key</strong>를 복사하여 로컬 <code className="font-mono text-neutral-800 dark:text-neutral-200">.env</code> 파일에 입력합니다:
            </p>
            <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-lg font-mono text-[11px] text-neutral-800 dark:text-neutral-200">
              VITE_SUPABASE_URL=https://[YOUR-PROJECT].supabase.co<br />
              VITE_SUPABASE_ANON_KEY=[YOUR-ANON-PUBLIC-KEY]
            </div>
          </div>

          {/* Step 4 for GitHub Pages */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl space-y-1 text-[11px] text-neutral-600 dark:text-neutral-400">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
              GitHub Pages 배포 시 설정 팁:
            </div>
            <p>GitHub 저장소의 <strong>Settings &gt; Secrets and variables &gt; Actions &gt; Variables</strong>에 <code className="font-mono">VITE_SUPABASE_URL</code>과 <code className="font-mono">VITE_SUPABASE_ANON_KEY</code>를 등록해 두면, GitHub Actions가 자동으로 키를 포함하여 배포합니다.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg transition-colors shadow-2xs"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
