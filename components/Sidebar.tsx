import React from 'react';
import { ViewType } from '../data/types';
import { ThemeMode } from '../hooks/useTheme';

interface SidebarProps {
  currentView: ViewType;
  dbStatus: 'checking' | 'online' | 'simulation';
  onNavigate: (view: ViewType) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

const NAV_ITEMS: { id: ViewType; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'assemble', label: 'Assemble', icon: 'list' },
  { id: 'components', label: 'Components', icon: 'category' },
  { id: 'replacements', label: 'Replacements', icon: 'history_edu' }
];

const Sidebar: React.FC<SidebarProps> = ({ currentView, dbStatus, onNavigate, theme, onToggleTheme }) => (
  <aside className="sidebar-shell w-64 bg-[#050810] border-r border-white/5 flex-shrink-0 flex flex-col justify-between p-6 hidden md:flex z-50">
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
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${currentView === item.id ? 'bg-white/5 text-[#00f3ff] border border-white/5' : 'text-slate-500 hover:text-slate-200'}`}
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            <span className="text-sm font-semibold tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
    <div className="px-4 py-1 flex items-start gap-3">
      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        className="theme-toggle size-9 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
      >
        <span className="material-symbols-outlined text-[18px]">
          {theme === 'dark' ? 'light_mode' : 'dark_mode'}
        </span>
      </button>
      <div>
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">System Build</p>
        <p className="text-[10px] text-slate-500 font-mono">v4.0.0 Stable</p>
      </div>
    </div>
  </aside>
);

export default Sidebar;
