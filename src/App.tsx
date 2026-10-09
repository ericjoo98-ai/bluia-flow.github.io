import React, { useState, useEffect } from 'react';
import { KanbanProvider, useKanban } from './context/KanbanContext';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { DashboardView } from './components/DashboardView';
import { ArchiveView } from './components/ArchiveView';
import { ActivityLogView } from './components/ActivityLogView';
import { TaskModal } from './components/TaskModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { DeployGuideModal } from './components/DeployGuideModal';
import { SupabaseModal } from './components/SupabaseModal';
import { LoginScreen } from './components/LoginScreen';
import { Task, ColumnId } from './types/kanban';

const MainContent: React.FC = () => {
  const { tasks, activeView, setActiveView } = useKanban();

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultColumnId, setDefaultColumnId] = useState<ColumnId>('todo');
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const handleOpenNewTask = (columnId: ColumnId = 'todo') => {
    setTaskToEdit(null);
    setDefaultColumnId(columnId);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input/textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleOpenNewTask('todo');
      } else if (e.key === 'Escape') {
        setIsTaskModalOpen(false);
        setIsBackupModalOpen(false);
        setIsDeployGuideOpen(false);
        setIsSupabaseModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb] dark:bg-[#090a0b] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* 3-zone Top Bar */}
      <Header
        onOpenNewTask={() => handleOpenNewTask('todo')}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
        onOpenSupabase={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col min-h-0">
        {activeView === 'board' && (
          <>
            <FilterBar />
            <KanbanBoard
              onOpenNewTaskForColumn={(colId) => handleOpenNewTask(colId)}
              onEditTask={handleEditTask}
            />
          </>
        )}

        {activeView === 'dashboard' && <DashboardView />}

        {activeView === 'archive' && <ArchiveView />}

        {activeView === 'activity' && <ActivityLogView />}
      </main>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
        defaultColumnId={defaultColumnId}
      />

      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />

      <DeployGuideModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
};

const AppRoot: React.FC = () => {
  const { isAuthenticated } = useKanban();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <MainContent />;
};

export default function App() {
  return (
    <KanbanProvider>
      <AppRoot />
    </KanbanProvider>
  );
}
