import { useCallback, useEffect, useState } from 'react';
import { INITIAL_COMPONENTS, INITIAL_PROJECTS } from '../data/SeedData';
import { ComponentItem, KaraokeProject } from '../data/types';
import { ApiService } from '../lib/api';

type DbStatus = 'checking' | 'online' | 'simulation';

interface UseAppDataOptions {
  onSyncError?: (message: string) => void;
}

export const useAppData = (options: UseAppDataOptions = {}) => {
  const { onSyncError } = options;
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [projects, setProjects] = useState<KaraokeProject[]>([]);
  const [dbStatus, setDbStatus] = useState<DbStatus>('checking');
  const [isLoading, setIsLoading] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);

  const syncData = useCallback(async () => {
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
      setLastError(null);
    } catch (error) {
      const message = 'Failed to synchronize with database.';
      setLastError(message);
      onSyncError?.(message);
    } finally {
      setIsLoading(false);
    }
  }, [onSyncError]);

  useEffect(() => {
    syncData();
  }, [syncData]);

  const addComponent = useCallback(async (component: ComponentItem) => {
    try {
      await ApiService.saveComponent(component, { isUpdate: false });
      setComponents((prev) => [component, ...prev]);
      setLastError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Save operation failed.';
      setLastError(message);
      throw new Error(message);
    }
  }, []);

  const updateComponent = useCallback(async (updated: ComponentItem) => {
    try {
      await ApiService.saveComponent(updated, { isUpdate: true });
      setComponents((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setLastError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update operation failed.';
      setLastError(message);
      throw new Error(message);
    }
  }, []);

  const deleteComponent = useCallback(async (id: string) => {
    try {
      await ApiService.deleteComponent(id);
      setComponents((prev) => prev.filter((c) => c.id !== id));
      setLastError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Inventory update failed.';
      setLastError(message);
      throw new Error(message);
    }
  }, []);

  const updateProject = useCallback(async (updatedProject: KaraokeProject) => {
    try {
      await ApiService.saveProject(updatedProject, { isUpdate: true });
      setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
      setLastError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Project update failed.';
      setLastError(message);
      throw new Error(message);
    }
  }, []);

  const createProject = useCallback(async (newProject: KaraokeProject) => {
    try {
      await ApiService.saveProject(newProject, { isUpdate: false });
      setProjects((prev) => [newProject, ...prev]);
      setLastError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Project save failed.';
      setLastError(message);
      throw new Error(message);
    }
  }, []);

  return {
    components,
    projects,
    dbStatus,
    isLoading,
    lastError,
    syncData,
    addComponent,
    updateComponent,
    deleteComponent,
    updateProject,
    createProject
  };
};
