import React, { useState, useEffect } from 'react';
import { ViewType, KaraokeProject, ComponentItem, Category } from './data/types';
import { INITIAL_PROJECTS, INITIAL_COMPONENTS } from './data/SeedData';
import Dashboard from './pages/Dashboard';
import Assemble from './pages/Assemble';
import ComponentsList from './pages/ComponentsList';
import Replacements from './pages/Replacements';
import { ApiService } from './lib/api';

interface Notification {
  id: number;
  type: 'success' | 'error';
  message: string;
  isExiting: boolean;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [projects, setProjects] = useState<KaraokeProject[]>([]);
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [dbStatus, setDbStatus] = useState<'checking' | 'online' | 'simulation'>('checking');
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [shouldOpenComponentModal, setShouldOpenComponentModal] = useState(false);
  const [preselectedCategory, setPreselectedCategory] = useState<Category | undefined>(undefined);
  const [shouldReturnToAssemble, setShouldReturnToAssemble] = useState(false);

  useEffect(() => {
    const syncData = async () => {
      setIsLoading(true);
      const isOnline = await ApiService.checkStatus();
      setDbStatus(isOnline ? 'online' : 'simulation');

      try {
        const [fetchedComponents, fetchedProjects] = await Promise.all([
          ApiService.getComponents(),
          ApiService.getProjects()
        ]);

        if (!isOnline && fetchedComponents.length === 0) {
          setComponents(INITIAL_COMPONENTS);
          setProjects(INITIAL_PROJECTS);
          localStorage.setItem('calcuoke_components', JSON.stringify(INITIAL_COMPONENTS));
        } else {
          setComponents(fetchedComponents);
          setProjects(fetchedProjects);
        }
      } catch (e) {
        addNotification('error', 'Failed to synchronize with database.');
      } finally {
        setIsLoading(false);
      }
    };

    syncData();
  }, []);

  const addNotification = (type: 'success' | 'error', message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message, isExiting: false }]);
    setTimeout(() => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isExiting: true } : n));
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 500);
    }, 3500);
  };

  const handleAddComponent = async (c: ComponentItem) => {
    try {
      await ApiService.saveComponent(c);
      setComponents(prev => [c, ...prev]);
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
      await ApiService.saveComponent(updated);
      setComponents(prev => prev.map(c => c.id === updated.id ? updated : c));
      addNotification('success', 'Component updated successfully.');
    } catch (e: any) {
      addNotification('error', e.message || 'Update operation failed.');
    }
  };

  const handleDeleteComponent = async (id: string, silent: boolean = false) => {
    try {
      await ApiService.deleteComponent(id);
      setComponents(prev => prev.filter(c => c.id !== id));
      if (!silent) {
        addNotification('success', 'Component removed from system registry.');
      }
    } catch (e: any) {
      addNotification('error', 'Inventory update failed.');
    }
  };

  const handleUpdateProject = async (updatedProject: KaraokeProject) => {
    try {
      await ApiService.saveProject(updatedProject);
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
      addNotification('success', 'Project updated.');
    } catch (e: any) {
      addNotification('error', e.message || 'Project update failed.');
    }
  };

  const handleProjectCreated = async (newProject: KaraokeProject) => {
    try {
      await ApiService.saveProject(newProject);
      setProjects(prev => [newProject, ...prev]);
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
    if (isLoading) return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="size-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest animate-pulse">Syncing Database...</p>
      </div>
    );

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
    <div className="tokyo-gradient text-slate-200 h-screen flex overflow-hidden relative selection:bg-cyan-500 selection:text-black">
      <div className="fixed top-6 right-6 z-[300] flex flex-col gap-3 pointer-events-none w-80">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-center gap-4 p-5 rounded-2xl border-l-[6px] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all ${n.isExiting ? 'notification-exit' : 'notification-enter'} ${n.type === 'success' ? 'bg-emerald-900/90 border-emerald-400' : 'bg-red-900/90 border-red-400'}`}
          >
            <div className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${n.type === 'success' ? 'bg-emerald-400/20' : 'bg-red-400/20'}`}>
              <span className={`material-symbols-outlined text-white text-[22px] font-variation-FILL`}>
                {n.type === 'success' ? 'check_circle' : 'error'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-0.5">System Message</span>
              <p className="text-sm text-white font-bold leading-tight">{n.message}</p>
            </div>
          </div>
        ))}
      </div>

      <aside className="w-64 bg-[#050810] border-r border-white/5 flex-shrink-0 flex flex-col justify-between p-6 hidden md:flex z-50">
        <div className="flex flex-col gap-10">
          <div className="flex gap-4 items-center">
            <div className="size-10 rounded-xl bg-gradient-to-tr from-[#00f3ff] to-[#bc13fe] flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="material-symbols-outlined text-white text-2xl">graphic_eq</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-white text-lg font-black leading-none uppercase neon-text">Calcuoke</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className={`size-1.5 rounded-full ${dbStatus === 'online' ? 'bg-cyan-500' : 'bg-amber-500'} animate-pulse`}></div>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">{dbStatus}</p>
              </div>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
              { id: 'assemble', label: 'Assemble', icon: 'list' },
              { id: 'components', label: 'Components', icon: 'category' },
              { id: 'replacements', label: 'Replacements', icon: 'history_edu' }
            ].map((item) => (
              <button key={item.id} onClick={() => {
                setCurrentView(item.id as ViewType);
                setShouldReturnToAssemble(false);
              }} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${currentView === item.id ? 'bg-white/5 text-[#00f3ff] border border-white/5' : 'text-slate-500 hover:text-slate-200'}`}>
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                <span className="text-sm font-semibold tracking-wide">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="px-4 py-1">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">System Build</p>
          <p className="text-[10px] text-slate-500 font-mono">v4.0.0 Stable</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <div className="max-w-[1100px] mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;