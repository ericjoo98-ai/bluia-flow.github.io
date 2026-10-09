import React, { useState, useRef } from 'react';
import { X, Download, Upload, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useKanban } from '../context/KanbanContext';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { exportBoardData, importBoardData, resetToSampleData } = useKanban();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importStatus, setImportStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message?: string;
  }>({ type: 'idle' });

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) {
        setImportStatus({ type: 'error', message: '파일 내용을 읽을 수 없습니다.' });
        return;
      }

      const res = importBoardData(content);
      if (res.success) {
        setImportStatus({
          type: 'success',
          message: '데이터가 성공적으로 복원되었습니다.',
        });
      } else {
        setImportStatus({
          type: 'error',
          message: res.error || '복원에 실패했습니다.',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('현재 보드를 기본 샘플 데이터로 복원하시겠습니까?')) {
      resetToSampleData();
      setImportStatus({
        type: 'success',
        message: '보드가 기본 샘플 데이터로 초기화되었습니다.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-[#18191c] rounded-2xl shadow-2xl border border-neutral-200/80 dark:border-neutral-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800/80">
          <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
            데이터 백업 및 복원
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Status Alert */}
          {importStatus.type !== 'idle' && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 ${
                importStatus.type === 'success'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200'
              }`}
            >
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* Export Card */}
          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60 space-y-2.5">
            <div>
              <div className="font-medium text-neutral-900 dark:text-neutral-100">
                JSON 백업 내보내기
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                모든 작업, 컬럼, 보관함 및 활동 내역을 JSON 파일로 다운로드합니다.
              </p>
            </div>
            <button
              onClick={exportBoardData}
              className="w-full py-2 px-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>백업 파일 다운로드</span>
            </button>
          </div>

          {/* Import Card */}
          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60 space-y-2.5">
            <div>
              <div className="font-medium text-neutral-900 dark:text-neutral-100">
                백업 파일 불러오기
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                이전에 저장한 JSON 백업 파일을 업로드하여 데이터를 복원합니다.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 bg-white dark:bg-[#151619] hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-neutral-500" />
              <span>JSON 파일 선택</span>
            </button>
          </div>

          {/* Reset button */}
          <div className="pt-2 flex items-center justify-between text-[11px]">
            <span className="text-neutral-400">초기 샘플 데이터가 필요한 경우</span>
            <button
              onClick={handleReset}
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>샘플로 초기화</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
