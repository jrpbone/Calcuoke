import { ComponentItem, KaraokeProject } from '../data/types';

const API_BASE_URL = 'http://localhost:3001/api';

export class ApiService {
  private static isUsingMock = false;

  static async checkStatus(): Promise<boolean> {
    try {
      const resp = await fetch(`${API_BASE_URL}/status`, { 
        signal: AbortSignal.timeout(2000) 
      });
      this.isUsingMock = !resp.ok;
      return resp.ok;
    } catch {
      this.isUsingMock = true;
      return false;
    }
  }

  static get status() {
    return this.isUsingMock ? 'simulation' : 'online';
  }

  private static deduplicateByID<T extends { id: string }>(items: T[]): T[] {
    const map = new Map<string, T>();
    items.forEach(item => map.set(item.id, item));
    return Array.from(map.values());
  }

  static async getComponents(): Promise<ComponentItem[]> {
    let components: ComponentItem[] = [];
    if (this.isUsingMock) {
      components = JSON.parse(localStorage.getItem('calcuoke_components') || '[]');
    } else {
      const resp = await fetch(`${API_BASE_URL}/components`);
      components = await resp.json();
    }
    return this.deduplicateByID(components);
  }

  static async saveComponent(comp: ComponentItem): Promise<void> {
    if (this.isUsingMock) {
      const existing = await this.getComponents();
      const compMap = new Map(existing.map(item => [item.id, item]));
      compMap.set(comp.id, comp);
      
      try {
        localStorage.setItem('calcuoke_components', JSON.stringify(Array.from(compMap.values())));
      } catch (e) {
        throw new Error("Local storage quota exceeded. Component data is too large.");
      }
      return;
    }

    const existing = await this.getComponents();
    const isUpdate = existing.some(c => c.id === comp.id);
    const url = isUpdate ? `${API_BASE_URL}/components/${comp.id}` : `${API_BASE_URL}/components`;
    const method = isUpdate ? 'PUT' : 'POST';

    await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comp),
    });
  }

  static async deleteComponent(id: string): Promise<void> {
    if (this.isUsingMock) {
      const existing = await this.getComponents();
      const updated = existing.filter(c => c.id !== id);
      localStorage.setItem('calcuoke_components', JSON.stringify(updated));
      return;
    }
    await fetch(`${API_BASE_URL}/components/${id}`, { method: 'DELETE' });
  }

  static async getProjects(): Promise<KaraokeProject[]> {
    let projects: KaraokeProject[] = [];
    if (this.isUsingMock) {
      projects = JSON.parse(localStorage.getItem('calcuoke_projects') || '[]');
    } else {
      const resp = await fetch(`${API_BASE_URL}/projects`);
      projects = await resp.json();
    }
    return this.deduplicateByID(projects);
  }

  static async saveProject(proj: KaraokeProject): Promise<void> {
    if (this.isUsingMock) {
      const existing = await this.getProjects();
      const projectMap = new Map(existing.map(p => [p.id, p]));
      projectMap.set(proj.id, proj);
      const updatedList = Array.from(projectMap.values());
      
      try {
        localStorage.setItem('calcuoke_projects', JSON.stringify(updatedList));
      } catch (e) {
        throw new Error("Payload too large. Storage is full.");
      }
      return;
    }

    const existing = await this.getProjects();
    const isUpdate = existing.some(p => p.id === proj.id);
    const url = isUpdate ? `${API_BASE_URL}/projects/${proj.id}` : `${API_BASE_URL}/projects`;
    const method = isUpdate ? 'PUT' : 'POST';

    await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proj),
    });
  }

  static async deleteProject(id: string): Promise<void> {
    if (this.isUsingMock) {
      const existing = await this.getProjects();
      const updated = existing.filter(p => p.id !== id);
      localStorage.setItem('calcuoke_projects', JSON.stringify(updated));
      return;
    }
    await fetch(`${API_BASE_URL}/projects/${id}`, { method: 'DELETE' });
  }
}