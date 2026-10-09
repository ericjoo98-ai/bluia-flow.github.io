import React, { useState } from 'react';
import { Layers, Lock, Eye, EyeOff, ArrowRight, Sun, Moon, Check } from 'lucide-react';
import { useKanban } from '../context/KanbanContext';

export const LoginScreen: React.FC = () => {
  const { assignees, login, isDarkMode, toggleDarkMode } = useKanban();

  const [selectedUserId, setSelectedUserId] = useState<string>(assignees[0]?.id || 'user_1');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const result = login(selectedUserId, password);
    if (!result.success) {
      setErrorMessage(result.error || '비밀번호가 올바르지 않습니다.');
      setIsSubmitting(false);
    }
  };

  const selectedUser = assignees.find((a) => a.id === selectedUserId) || assignees[0];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f9fafb] dark:bg-[#090a0b] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Bar with Theme Toggle */}
      <div className="w-full max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-900 transition-colors">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold tracking-tight">blua_flow</span>
        </div>

        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors"
          title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg bg-white dark:bg-[#151619] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-6 sm:p-8 shadow-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              워크스페이스 로그인
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
              작업자를 선택하고 비밀번호를 입력해주세요.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Member Selector Cards (주현우, 주용원, 이유진) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  작업자 선택
                </label>
              </div>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {assignees.map((user) => {
                  const isSelected = user.id === selectedUserId;
                  const zodiacInfo =
                    user.id === 'user_1'
                      ? { emoji: '🐶', zodiac: '개띠', roleKo: '대표이사', roleDetail: '최고경영자', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/60 dark:border-indigo-800/60' }
                      : user.id === 'user_2'
                      ? { emoji: '🐴', zodiac: '말띠', roleKo: '기술총괄', roleDetail: '최고기술책임자', color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200/60 dark:border-sky-800/60' }
                      : { emoji: '🐴', zodiac: '말띠', roleKo: '재무총괄', roleDetail: '최고재무책임자', color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200/60 dark:border-rose-800/60' };

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setErrorMessage('');
                      }}
                      className={`relative p-2.5 sm:p-3.5 rounded-xl border text-center transition-all flex flex-col items-center gap-2 group ${
                        isSelected
                          ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800/80 ring-2 ring-neutral-900/20 dark:ring-white/20 shadow-xs'
                          : 'border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-transparent'
                      }`}
                    >
                      {/* Avatar with Zodiac Icon badge */}
                      <div className="relative">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden ring-2 ring-neutral-200/80 dark:ring-neutral-700/80 shadow-xs bg-neutral-100 dark:bg-neutral-800 transition-transform group-hover:scale-105">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span
                          className="absolute -bottom-1 -right-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-2xs flex items-center gap-0.5"
                          title={`${zodiacInfo.zodiac}`}
                        >
                          <span>{zodiacInfo.emoji}</span>
                          <span className="text-[9px] text-neutral-600 dark:text-neutral-300">{zodiacInfo.zodiac}</span>
                        </span>
                      </div>

                      {/* Name & Role block */}
                      <div className="w-full space-y-1">
                        <div className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                          {user.name}
                        </div>

                        {/* Enlarge CEO / CTO / CFO and display Korean translation */}
                        <div className="pt-0.5">
                          <span className={`inline-block px-2 py-0.5 rounded-md font-mono text-sm sm:text-base font-extrabold tracking-wider border ${zodiacInfo.color}`}>
                            {user.role}
                          </span>
                        </div>

                        {/* Korean Meaning (대표이사, 기술총괄, 재무총괄) */}
                        <div className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200 truncate leading-tight">
                          {zodiacInfo.roleKo}
                        </div>
                        <div className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate leading-tight">
                          ({zodiacInfo.roleDetail})
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  비밀번호
                </label>
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="워크스페이스 비밀번호 입력..."
                  className={`w-full pl-9 pr-10 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-800/60 border rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none transition-all ${
                    errorMessage
                      ? 'border-rose-400 dark:border-rose-500 focus:ring-1 focus:ring-rose-400'
                      : 'border-neutral-200/80 dark:border-neutral-700/80 focus:border-neutral-900 dark:focus:border-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {errorMessage && (
                <p className="mt-1.5 text-xs text-rose-500 font-medium">
                  {errorMessage}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>{selectedUser ? `${selectedUser.name} 님으로 입장` : '워크스페이스 입장'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="w-full text-center py-4 text-[11px] text-neutral-400">
        blua_flow &middot; 팀 협업 칸반 보드
      </div>
    </div>
  );
};
