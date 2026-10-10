import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Check,
  Copy,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  Trash2,
  KeyRound,
  Globe,
  Heart,
  ShieldCheck,
  Clock,
  Zap,
  Activity,
  CheckCheck,
} from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  normalizeSupabaseUrl,
  DEFAULT_SUPABASE_PROJECT_ID,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_PUBLISHABLE_KEY,
  DEFAULT_SUPABASE_SECRET_KEY,
  SUPABASE_SQL_SETUP,
  SUPABASE_PG_CRON_SQL,
} from '../lib/supabase';
import { useKanban } from '../context/KanbanContext';
import { formatTimeKorean, formatRelativeTime } from '../utils/dateUtils';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const {
    isSupabaseActive,
    uploadLocalDataToSupabase,
    refreshFromSupabase,
    lastHeartbeat,
    heartbeatLogs,
    isHeartbeatRunning,
    triggerHeartbeat,
  } = useKanban();

  const [activeTab, setActiveTab] = useState<'config' | 'heartbeat'>('config');
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedCronSql, setCopiedCronSql] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error';
    message: string;
    tableReady?: boolean;
  }>({ status: 'idle', message: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [pingMessage, setPingMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const config = getStoredSupabaseConfig();
      setUrl(config.url || DEFAULT_SUPABASE_URL);
      setAnonKey(config.anonKey || DEFAULT_SUPABASE_PUBLISHABLE_KEY);
      setSecretKey(config.secretKey || DEFAULT_SUPABASE_SECRET_KEY);
      setTestResult({ status: 'idle', message: '' });
      setUploadMessage(null);
      setPingMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedUrl = normalizeSupabaseUrl(url);

    if (!normalizedUrl || !anonKey.trim()) {
      setTestResult({
        status: 'error',
        message: 'Project URL(또는 ID)과 API Key를 입력해주세요.',
      });
      return;
    }

    setTestResult({ status: 'testing', message: 'Supabase 서버와 통신 중...' });

    const result = await testSupabaseConnection(normalizedUrl, anonKey.trim());
    if (result.success) {
      saveSupabaseConfig(normalizedUrl, anonKey.trim(), secretKey.trim());
      setUrl(normalizedUrl);
      setTestResult({
        status: 'success',
        message: result.message,
        tableReady: result.tableReady,
      });
      refreshFromSupabase();
      // Also send a heartbeat right away
      triggerHeartbeat();
    } else {
      setTestResult({
        status: 'error',
        message: result.message,
      });
    }
  };

  const handleDisconnect = () => {
    if (window.confirm('Supabase 연동을 해제하시겠습니까? (로컬 브라우저 저장 모드로 전환됩니다)')) {
      clearSupabaseConfig();
      setUrl('');
      setAnonKey(DEFAULT_SUPABASE_PUBLISHABLE_KEY);
      setSecretKey(DEFAULT_SUPABASE_SECRET_KEY);
      setTestResult({
        status: 'idle',
        message: '연동이 해제되었습니다. 로컬 저장소 모드로 작동합니다.',
      });
      refreshFromSupabase();
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCopyCronSql = () => {
    navigator.clipboard.writeText(SUPABASE_PG_CRON_SQL);
    setCopiedCronSql(true);
    setTimeout(() => setCopiedCronSql(false), 2000);
  };

  const handleUploadLocalData = async () => {
    setIsUploading(true);
    setUploadMessage(null);
    try {
      const count = await uploadLocalDataToSupabase();
      setUploadMessage(`성공! 로컬 업무 데이터 ${count}건을 Supabase에 동기화했습니다.`);
    } catch (err: any) {
      setUploadMessage(`업로드 실패: ${err?.message || '알 수 없는 오류'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualPing = async () => {
    setPingMessage('하트비트 신호 전송 중...');
    const res = await triggerHeartbeat();
    if (res.success) {
      setPingMessage(`성공! 응답 지연: ${res.latencyMs}ms (프로젝트 일시중단 방지 완료)`);
    } else {
      setPingMessage(`응답 실패: ${res.message}`);
    }
    setTimeout(() => setPingMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#151619] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-6 py-3.5 bg-neutral-100/90 dark:bg-[#181a1f] border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Supabase 클라우드 &amp; 하트비트
                </h2>
                {isSupabaseActive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    실시간 연결됨
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    로컬 브라우저 모드
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                실시간 DB 동기화 및 무료 프로젝트 7일 비활성 중단(Paused) 방지
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Segmented Navigation Tabs */}
        <div className="px-6 pt-3 bg-neutral-50/70 dark:bg-[#151619] border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('config')}
              className={`h-8 px-3.5 inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg transition-all border-b-2 ${
                activeTab === 'config'
                  ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 shadow-2xs'
                  : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>연동 설정</span>
            </button>
            <button
              onClick={() => setActiveTab('heartbeat')}
              className={`h-8 px-3.5 inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg transition-all border-b-2 ${
                activeTab === 'heartbeat'
                  ? 'border-rose-500 text-rose-700 dark:text-rose-300 bg-white dark:bg-neutral-800 shadow-2xs'
                  : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
              <span>💓 하트비트 (휴면 방지)</span>
              {isSupabaseActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {activeTab === 'config' ? (
            <>
              {/* Connection Form */}
              <form onSubmit={handleTestAndSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Project URL 또는 프로젝트 ID</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                        기본값 ({DEFAULT_SUPABASE_PROJECT_ID}) 설정됨
                      </span>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://otzkhkbfjhqkjhmnbypr.supabase.co 또는 프로젝트 ID"
                    className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    프로젝트 ID <b>{DEFAULT_SUPABASE_PROJECT_ID}</b>가 기본 하드코딩되어 다른 브라우저 및 GitHub Pages에서도 동일한 보드로 자동 접속됩니다.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Publishable Key (anon / public)</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                        기본 API Key 설정됨
                      </span>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="sb_publishable_..."
                    className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    웹 브라우저 클라이언트에서 안전하게 통신하는 공개 <b>Publishable Key</b>입니다.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Secret Key (service_role / 백엔드 보관용)</span>
                      </div>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                        기본 Secret Key 설정됨
                      </span>
                    </div>
                  </label>
                  <input
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="sb_secret_..."
                    className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    전달해주신 Secret 키는 관리자 백엔드 및 하트비트용으로 안전하게 보관됩니다.
                  </p>
                </div>

                {/* Test result alert */}
                {testResult.message && (
                  <div
                    className={`p-3 rounded-lg text-xs flex items-start gap-2.5 ${
                      testResult.status === 'success'
                        ? testResult.tableReady === false
                          ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200'
                        : testResult.status === 'error'
                        ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200'
                        : 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-800 dark:text-blue-200'
                    }`}
                  >
                    {testResult.status === 'testing' && <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />}
                    {testResult.status === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />}
                    {testResult.status === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />}
                    <div className="flex-1">
                      <span>{testResult.message}</span>
                      {testResult.tableReady === false && (
                        <div className="mt-1.5 font-medium">
                          👉 아래 <b>[테이블 생성 SQL]</b> 섹션의 코드를 복사해 Supabase SQL Editor에서 실행해주세요.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={testResult.status === 'testing'}
                    className="h-8.5 px-4 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                  >
                    {testResult.status === 'testing' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        연결 확인 중...
                      </>
                    ) : (
                      <>
                        <Database className="w-3.5 h-3.5" />
                        연결 테스트 &amp; 저장
                      </>
                    )}
                  </button>

                  {isSupabaseActive && (
                    <>
                      <button
                        type="button"
                        onClick={handleUploadLocalData}
                        disabled={isUploading}
                        className="h-8.5 px-3.5 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-blue-500" />
                        {isUploading ? '업로드 중...' : '로컬 업무 데이터 클라우드로 올리기'}
                      </button>

                      <button
                        type="button"
                        onClick={handleDisconnect}
                        className="h-8.5 px-3 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        연결 해제
                      </button>
                    </>
                  )}
                </div>

                {uploadMessage && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{uploadMessage}</p>
                )}
              </form>

              {/* Setup Guide Section */}
              <div className="border-t border-neutral-200/80 dark:border-neutral-800/80 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    테이블 생성 SQL (최초 1회 실행)
                  </h3>
                  <button
                    onClick={handleCopySql}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors shadow-2xs"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">복사됨!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>SQL 복사하기</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Supabase 대시보드 좌측 <b>SQL Editor &gt; New query</b>에 붙여넣고 <b>[Run]</b>을 누르면 칸반 테이블과 실시간 동기화가 활성화됩니다.
                </p>
                <pre className="p-3 bg-neutral-900 text-neutral-200 rounded-lg text-[11px] font-mono overflow-x-auto max-h-36 leading-snug">
                  {SUPABASE_SQL_SETUP}
                </pre>
              </div>
            </>
          ) : (
            /* Heartbeat (Keep-Alive) Management Tab */
            <div className="space-y-5">
              {/* Heartbeat Status Hero Card */}
              <div className="p-4 rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-gradient-to-r from-rose-50/60 to-orange-50/40 dark:from-rose-950/20 dark:to-orange-950/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-xs">
                      <Heart className="w-4 h-4 fill-white animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        Supabase 7일 중단 방지 하트비트(Heartbeat)
                      </h4>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {isSupabaseActive
                          ? '10분 주기 자동 핑으로 DB 활성 상태 유지 중'
                          : 'Supabase가 아직 연동되지 않았습니다.'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      isSupabaseActive
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    {isSupabaseActive ? '정상 활성 중' : '대기 중'}
                  </span>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  Supabase 무료 요금제는 <b>7일 동안 API 요청이나 DB 쿼리가 없으면 프로젝트가 자동으로 일시 정지(Paused)</b>됩니다. blua_flow는 앱이 켜져 있는 동안 <b>10분마다 자동으로 하트비트 핑</b>을 보내 무료 프로젝트가 잠들지 않도록 보호합니다.
                </p>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="bg-white/90 dark:bg-[#1c1d22] p-2.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 text-center">
                    <div className="text-[10px] text-neutral-400">마지막 하트비트</div>
                    <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">
                      {lastHeartbeat ? formatRelativeTime(lastHeartbeat.timestamp) : '기록 없음'}
                    </div>
                  </div>
                  <div className="bg-white/90 dark:bg-[#1c1d22] p-2.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 text-center">
                    <div className="text-[10px] text-neutral-400">응답 속도</div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {lastHeartbeat?.latencyMs ? `${lastHeartbeat.latencyMs}ms` : '-'}
                    </div>
                  </div>
                  <div className="bg-white/90 dark:bg-[#1c1d22] p-2.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 text-center">
                    <div className="text-[10px] text-neutral-400">누적 전송 수</div>
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {heartbeatLogs.length}회
                    </div>
                  </div>
                </div>

                {/* Immediate Ping Button */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleManualPing}
                    disabled={isHeartbeatRunning || !url.trim()}
                    className="h-8.5 px-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
                  >
                    <Heart className={`w-3.5 h-3.5 fill-white ${isHeartbeatRunning ? 'animate-bounce' : ''}`} />
                    {isHeartbeatRunning ? '핑 전송 중...' : '지금 즉시 하트비트 핑 보내기'}
                  </button>
                  {pingMessage && (
                    <span className="text-xs font-medium text-rose-600 dark:text-rose-400 animate-in fade-in">
                      {pingMessage}
                    </span>
                  )}
                </div>
              </div>

              {/* 24/7 Background pg_cron Keep-Alive Feature */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      💡 24시간 무중단 팁 (브라우저를 닫아도 중단 방지 pg_cron)
                    </span>
                  </div>
                  <button
                    onClick={handleCopyCronSql}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors shadow-2xs"
                  >
                    {copiedCronSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">복사됨!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>pg_cron SQL 복사</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  컴퓨터나 브라우저를 며칠간 켜지 않아도 Supabase 내부에서 매 6시간마다 스스로 쿼리를 실행해 무료 프로젝트가 영구적으로 일시 정지되지 않게 하는 공식 PostgreSQL 확장 기능입니다. Supabase SQL Editor에서 1회만 [Run] 하시면 영구 적용됩니다.
                </p>
                <pre className="p-3 bg-neutral-900 text-neutral-200 rounded-lg text-[11px] font-mono overflow-x-auto max-h-32 leading-snug">
                  {SUPABASE_PG_CRON_SQL}
                </pre>
              </div>

              {/* Recent Heartbeat Logs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-neutral-500" />
                    <span>최근 하트비트 전송 기록 (최대 20건)</span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-normal">
                    10분 주기 자동 기록
                  </span>
                </div>

                <div className="max-h-40 overflow-y-auto rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#121316] divide-y divide-neutral-100 dark:divide-neutral-850">
                  {heartbeatLogs.length === 0 ? (
                    <div className="py-6 text-center text-xs text-neutral-400">
                      아직 하트비트 전송 기록이 없습니다. 상단 [지금 즉시 하트비트 핑 보내기]를 눌러보세요.
                    </div>
                  ) : (
                    heartbeatLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 px-3 flex items-center justify-between text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              log.success ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span className="font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
                            {formatTimeKorean(log.timestamp)} ({formatRelativeTime(log.timestamp)})
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            {log.latencyMs}ms
                          </span>
                          <span className="text-[10px] text-neutral-400 truncate max-w-[200px]">
                            {log.message}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-100/90 dark:bg-[#181a1f] border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between text-xs">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 flex items-center gap-1 font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Supabase 대시보드 바로가기
          </a>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-semibold text-xs transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
