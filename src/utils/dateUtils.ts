export interface DueInfo {
  status: 'overdue' | 'today' | 'tomorrow' | 'soon' | 'future';
  label: string;
  badgeClass: string;
  isImminent: boolean; // 오늘/내일/3일 이내 마감 임박 여부
  isOverdue: boolean;  // 기한 초과 여부
  diffDays: number;
}

export function getDueStatus(dueDateString: string): DueInfo {
  if (!dueDateString) {
    return {
      status: 'future',
      label: '기한 없음',
      badgeClass: 'text-neutral-400 dark:text-neutral-500',
      isImminent: false,
      isOverdue: false,
      diffDays: 999,
    };
  }

  // Compare in local timezone with date only (YYYY-MM-DD)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateString);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'overdue',
      label: `${Math.abs(diffDays)}일 초과`,
      badgeClass: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-bold',
      isImminent: true,
      isOverdue: true,
      diffDays,
    };
  }

  if (diffDays === 0) {
    return {
      status: 'today',
      label: '오늘 마감 (D-Day)',
      badgeClass: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-bold animate-pulse',
      isImminent: true,
      isOverdue: false,
      diffDays: 0,
    };
  }

  if (diffDays === 1) {
    return {
      status: 'tomorrow',
      label: '내일 마감 (D-1)',
      badgeClass: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-750 font-bold',
      isImminent: true,
      isOverdue: false,
      diffDays: 1,
    };
  }

  if (diffDays <= 3) {
    return {
      status: 'soon',
      label: `마감임박 (D-${diffDays})`,
      badgeClass: 'bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800 font-bold',
      isImminent: true,
      isOverdue: false,
      diffDays,
    };
  }

  return {
    status: 'future',
    label: `D-${diffDays}`,
    badgeClass: 'text-neutral-600 dark:text-neutral-400',
    isImminent: false,
    isOverdue: false,
    diffDays,
  };
}

export function formatDateKorean(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

export function formatTimeKorean(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateString: string): string {
  if (!dateString) return '';
  const now = new Date().getTime();
  const past = new Date(dateString).getTime();
  const diffMinutes = Math.floor((now - past) / (1000 * 60));

  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;

  return formatDateKorean(dateString);
}
