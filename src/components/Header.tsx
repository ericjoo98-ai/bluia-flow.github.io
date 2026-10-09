import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  Moon,
  Bell,
  Plus,
  CheckCircle2,
  Trash2,
  MoreHorizontal,
  Download,
  BookOpen,
  Radio,
  Layers,
  Sparkles,
  LogOut,
  Database,
  Heart,
} from 'lucide-react';
import { useKanban } from '../context/KanbanContext';
import { formatRelativeTime } from '../utils/dateUtils';

interface HeaderProps {
  onOpenNewTask: () => void;
  onOpenBackup: () => void;
  onOpenDeployGuide: () => void;
  onOpenSupabase: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewTask,
  onOpenBackup,
  onOpenDeployGuide,
  onOpenSupabase,
}) => {
  const {
    currentUser,
    setCurrentUser,
    assignees,
    isDarkMode,
    toggleDarkMode,
    activeView,
    setActiveView,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    isSyncing,
    liveSimulationActive,
    toggleLiveSimulation,
    archivedTasks,
    logout,
    isSupabaseActive,
    lastHeartbeat,
    isHeartbeatRunning,
  } = useKanban();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotificationMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#e4e8f0] dark:bg-[#16181d] border-b border-neutral-300 dark:border-neutral-800 shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-900 transition-colors shadow-2xs">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              blua_flow
            </span>
          </div>

          {/* Center Navigation Tabs (Segmented Control) */}
          <nav className="hidden md:flex items-center bg-[#d0d6e2] dark:bg-[#20232a] p-1 rounded-xl border border-neutral-300 dark:border-neutral-700/80 gap-1 shadow-2xs">
            <button
              onClick={() => setActiveView('board')}
              className={`h-8 max-h-8 box-border px-3.5 inline-flex items-center justify-center text-xs font-semibold rounded-lg transition-all leading-none ${
                activeView === 'board'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs border border-neutral-300/80 dark:border-neutral-700'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-white/60 dark:hover:bg-neutral-700/60'
              }`}
            >
              보드
            </button>
            <button
              onClick={() => setActiveView('dashboard')}
              className={`h-8 max-h-8 box-border px-3.5 inline-flex items-center justify-center text-xs font-semibold rounded-lg transition-all leading-none ${
                activeView === 'dashboard'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs border border-neutral-300/80 dark:border-neutral-700'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-white/60 dark:hover:bg-neutral-700/60'
              }`}
            >
              대시보드
            </button>
            <button
              onClick={() => setActiveView('archive')}
              className={`h-8 max-h-8 box-border px-3 inline-flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg transition-all leading-none overflow-hidden ${
                activeView === 'archive'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs border border-neutral-300/80 dark:border-neutral-700'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-white/60 dark:hover:bg-neutral-700/60'
              }`}
            >
              <span className="leading-none">완료 / 저장</span>
              {archivedTasks.length > 0 && (
                <span className="h-4 min-w-[16px] px-1 inline-flex items-center justify-center rounded-full bg-neutral-200/90 dark:bg-neutral-800 border border-neutral-300/80 dark:border-neutral-700 text-[10px] font-mono leading-none text-neutral-700 dark:text-neutral-300 font-bold shrink-0">
                  {archivedTasks.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveView('activity')}
              className={`h-8 max-h-8 box-border px-3.5 inline-flex items-center justify-center text-xs font-semibold rounded-lg transition-all leading-none ${
                activeView === 'activity'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs border border-neutral-300/80 dark:border-neutral-700'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-white/60 dark:hover:bg-neutral-700/60'
              }`}
            >
              활동 내역
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Supabase Connect & Heartbeat Button */}
            <button
              onClick={onOpenSupabase}
              className={`h-8 max-h-8 box-border flex items-center gap-1.5 px-3 text-xs font-semibold rounded-lg border transition-all ${
                isSupabaseActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 shadow-2xs'
                  : 'bg-white/80 dark:bg-neutral-850/80 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-white dark:hover:bg-neutral-800'
              }`}
              title={
                isSupabaseActive
                  ? `Supabase 클라우드 연동됨 (하트비트 휴면방지: ${lastHeartbeat?.latencyMs || 0}ms)`
                  : 'Supabase 클라우드 DB 연동 및 하트비트 설정'
              }
            >
              {isSupabaseActive ? (
                <>
                  <Heart className={`w-3.5 h-3.5 text-rose-500 fill-rose-500/20 ${isHeartbeatRunning ? 'animate-ping' : 'animate-pulse'}`} />
                  <span className="hidden sm:inline">Supabase</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Supabase 연동</span>
                </>
              )}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onOpenNewTask}
              className="h-8 max-h-8 box-border flex items-center gap-1.5 px-3.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>새 작업</span>
            </button>

            {/* Notifications Popover */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotificationMenu(!showNotificationMenu);
                  setShowUserMenu(false);
                  setShowMoreMenu(false);
                }}
                className="relative p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors"
                aria-label="알림"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-neutral-900 dark:bg-white rounded-full ring-2 ring-white dark:ring-[#121316]" />
                )}
              </button>

              {showNotificationMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#18191c] rounded-xl shadow-xl border border-neutral-200/80 dark:border-neutral-800 py-2.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between px-3.5 pb-2 border-b border-neutral-100 dark:border-neutral-800/80">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      알림 ({notifications.length})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
                      >
                        모두 읽음
                      </button>
                      <button
                        onClick={clearAllNotifications}
                        className="text-neutral-400 hover:text-rose-500 transition-colors"
                        title="전체 삭제"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-neutral-400">
                        새로운 알림이 없습니다.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationAsRead(notif.id)}
                          className={`p-3 transition-colors cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/40 ${
                            notif.read ? 'opacity-60' : 'bg-neutral-50/50 dark:bg-neutral-850'
                          }`}
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-medium text-neutral-900 dark:text-neutral-100">
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                              {formatRelativeTime(notif.timestamp)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-neutral-500 dark:text-neutral-400 leading-relaxed text-[11px]">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
              aria-label="테마 전환"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-700" />
              )}
            </button>

            {/* More Menu (Backup, Deploy Guide, Simulation, Sync) */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => {
                  setShowMoreMenu(!showMoreMenu);
                  setShowUserMenu(false);
                  setShowNotificationMenu(false);
                }}
                className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors"
                aria-label="더보기 메뉴"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#18191c] rounded-xl shadow-xl border border-neutral-200/80 dark:border-neutral-800 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[11px] font-medium text-neutral-400 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                    <span>동기화 상태</span>
                    <span className="flex items-center gap-1 font-normal text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      실시간 탭 연결됨
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      toggleDarkMode();
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-neutral-500" />}
                      <span>화면 테마</span>
                    </div>
                    <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                      {isDarkMode ? '다크 모드' : '라이트 모드'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      toggleLiveSimulation();
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 text-neutral-400" />
                      <span>팀 협업 시뮬레이션</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${liveSimulationActive ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'}`}>
                      {liveSimulationActive ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenBackup();
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-neutral-400" />
                    <span>데이터 백업 & 복원</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenSupabase();
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Supabase 클라우드 DB</span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        isSupabaseActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}
                    >
                      {isSupabaseActive ? '연동됨' : '미연동'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenDeployGuide();
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
                    <span>GitHub Pages 배포 가이드</span>
                  </button>
                </div>
              )}
            </div>

            {/* User Switcher */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotificationMenu(false);
                  setShowMoreMenu(false);
                }}
                className="flex items-center gap-1.5 p-1 rounded-full border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 transition-all ml-1 bg-white dark:bg-neutral-900 shadow-2xs"
                title={`${currentUser.name} (${currentUser.role})`}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover shrink-0"
                />
                <span className="hidden xl:inline text-xs font-semibold text-neutral-800 dark:text-neutral-200 pr-1.5">
                  {currentUser.name}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#18191c] rounded-xl shadow-xl border border-neutral-200/80 dark:border-neutral-800 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[11px] text-neutral-400 border-b border-neutral-100 dark:border-neutral-800/80">
                    현재 작업자 변경
                  </div>
                  {assignees.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setCurrentUser(user);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors ${
                        user.id === currentUser.id
                          ? 'font-medium text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-800/50'
                          : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-neutral-200 dark:ring-neutral-700"
                        />
                        <div>
                          <div className="font-semibold flex items-center gap-1">
                            <span>{user.name}</span>
                            <span className="text-[11px]">
                              {user.id === 'user_1' ? '🐶' : '🐴'}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-normal">
                              ({user.id === 'user_1' ? '개띠' : '말띠'})
                            </span>
                          </div>
                          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono flex items-center gap-1">
                            <span className="font-bold">{user.role}</span>
                            <span>·</span>
                            <span>{user.id === 'user_1' ? '대표이사' : user.id === 'user_2' ? '기술총괄' : '재무총괄'}</span>
                          </div>
                        </div>
                      </div>
                      {user.id === currentUser.id && (
                        <CheckCircle2 className="w-4 h-4 text-neutral-900 dark:text-neutral-100" />
                      )}
                    </button>
                  ))}

                  <div className="border-t border-neutral-100 dark:border-neutral-800/80 my-1"></div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-500 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>로그아웃</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden p-2 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-100/90 dark:bg-[#121316]">
        <div className="grid grid-cols-4 gap-1.5 bg-neutral-200/80 dark:bg-neutral-800/80 p-1 rounded-xl border border-neutral-300/70 dark:border-neutral-700/70">
          <button
            onClick={() => setActiveView('board')}
            className={`h-8 inline-flex items-center justify-center text-xs rounded-lg font-semibold transition-colors ${
              activeView === 'board'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs border border-neutral-200 dark:border-neutral-700'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            보드
          </button>
          <button
            onClick={() => setActiveView('dashboard')}
            className={`h-8 inline-flex items-center justify-center text-xs rounded-lg font-semibold transition-colors ${
              activeView === 'dashboard'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs border border-neutral-200 dark:border-neutral-700'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            대시보드
          </button>
          <button
            onClick={() => setActiveView('archive')}
            className={`h-8 inline-flex items-center justify-center gap-1 text-xs rounded-lg font-semibold transition-colors ${
              activeView === 'archive'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs border border-neutral-200 dark:border-neutral-700'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            <span>완료/저장</span>
            {archivedTasks.length > 0 && (
              <span className="text-[10px] font-mono opacity-70">
                ({archivedTasks.length})
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveView('activity')}
            className={`h-8 inline-flex items-center justify-center text-xs rounded-lg font-semibold transition-colors ${
              activeView === 'activity'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs border border-neutral-200 dark:border-neutral-700'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            활동 내역
          </button>
        </div>
      </div>
    </header>
  );
};
