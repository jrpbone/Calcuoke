import React, { useCallback, useState } from 'react';
import { ViewType, KaraokeProject, ComponentItem, Category } from './data/types';
import Dashboard from './pages/Dashboard';
import Assemble from './pages/Assemble';
import ComponentsList from './pages/ComponentsList';
import Replacements from './pages/Replacements';
import NotificationStack from './components/NotificationStack';
import Sidebar from './components/Sidebar';
import LoadingState from './components/LoadingState';
import { useNotifications } from './hooks/useNotifications';
import { useAppData } from './hooks/useAppData';
import { useTheme } from './hooks/useTheme';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const { theme, toggleTheme } = useTheme();
  const { notifications, addNotification } = useNotifications();
  const handleSyncError = useCallback(
    (message: string) => addNotification('error', message),
    [addNotification]
  );
  const {
    components,
    projects,
    dbStatus,
    isLoading,
    addComponent,
    updateComponent,
    deleteComponent,
    updateProject,
    createProject
  } = useAppData({ onSyncError: handleSyncError });
  const [shouldOpenComponentModal, setShouldOpenComponentModal] = useState(false);
  const [preselectedCategory, setPreselectedCategory] = useState<Category | undefined>(undefined);
  const [shouldReturnToAssemble, setShouldReturnToAssemble] = useState(false);

  const handleAddComponent = async (c: ComponentItem) => {
    try {
      await addComponent(c);
      addNotification('success', `${c.name} saved successfully.`);
      // If we came from assemble, we might want to go back even on success, 
      // but the requirement only specified cancel.
      setShouldReturnToAssemble(false);
    } catch (e: any) {
      addNotification('error', e.message || 'Save operation failed.');
    }
  };

  const handleUpdateComponent = async (updated: ComponentItem) => {
    try {
      await updateComponent(updated);
      addNotification('success', 'Component updated successfully.');
    } catch (e: any) {
      addNotification('error', e.message || 'Update operation failed.');
    }
  };

  const handleDeleteComponent = async (id: string, silent: boolean = false) => {
    try {
      await deleteComponent(id);
      if (!silent) {
        addNotification('success', 'Component removed from system registry.');
      }
    } catch (e: any) {
      addNotification('error', 'Inventory update failed.');
    }
  };

  const handleUpdateProject = async (updatedProject: KaraokeProject) => {
    try {
      await updateProject(updatedProject);
      addNotification('success', 'Project updated.');
    } catch (e: any) {
      addNotification('error', e.message || 'Project update failed.');
    }
  };

  const handleProjectCreated = async (newProject: KaraokeProject) => {
    try {
      await createProject(newProject);
      setCurrentView('dashboard');
      addNotification('success', 'Sale record created and inventory adjusted.');
    } catch (e: any) {
      addNotification('error', e.message || 'Project save failed.');
    }
  };

  const handleNavigateToComponents = (category?: Category) => {
    setCurrentView('components');
    if (category) {
      setShouldOpenComponentModal(true);
      setPreselectedCategory(category);
      setShouldReturnToAssemble(true);
    } else {
      setShouldOpenComponentModal(false);
      setPreselectedCategory(undefined);
      setShouldReturnToAssemble(false);
    }
  };

  const renderContent = () => {
    if (isLoading) return <LoadingState />;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard
          projects={projects}
          components={components}
          onNewBuild={() => setCurrentView('assemble')}
          onUpdateProject={handleUpdateProject}
          onAddComponent={handleAddComponent}
          onDeleteComponent={handleDeleteComponent}
          onNotify={addNotification}
        />;
      case 'assemble':
        return <Assemble
          components={components}
          onProjectCreated={handleProjectCreated}
          onNavigateToComponents={handleNavigateToComponents}
          onDeleteComponent={handleDeleteComponent}
        />;
      case 'components':
        return <ComponentsList
          components={components}
          onAddComponent={handleAddComponent}
          onUpdateComponent={handleUpdateComponent}
          onDeleteComponent={handleDeleteComponent}
          onNotify={addNotification}
          autoOpenModal={shouldOpenComponentModal}
          initialCategory={preselectedCategory}
          onModalOpened={() => {
            setShouldOpenComponentModal(false);
            setPreselectedCategory(undefined);
          }}
          onCancel={() => {
            if (shouldReturnToAssemble) {
              setCurrentView('assemble');
              setShouldReturnToAssemble(false);
            }
          }}
        />;
      case 'replacements':
        return <Replacements projects={projects} />;
      default:
        return <Dashboard
          projects={projects}
          components={components}
          onNewBuild={() => setCurrentView('assemble')}
          onUpdateProject={handleUpdateProject}
          onAddComponent={handleAddComponent}
          onDeleteComponent={handleDeleteComponent}
          onNotify={addNotification}
        />;
    }
  };

  return (
    <div className="app-shell tokyo-gradient text-slate-200 h-screen flex overflow-hidden relative selection:bg-indigo-500 selection:text-white">
      <NotificationStack notifications={notifications} />

      <Sidebar
        currentView={currentView}
        dbStatus={dbStatus}
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigate={(view) => {
          setCurrentView(view);
          setShouldReturnToAssemble(false);
        }}
      />

      <main className="app-main flex-1 flex flex-col h-full min-w-0 overflow-hidden pt-[68px] pb-[78px] md:py-0">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 xl:p-10 custom-scrollbar scroll-smooth">
          <div className="app-content max-w-[1280px] mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
