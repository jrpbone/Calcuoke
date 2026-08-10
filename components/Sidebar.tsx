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

const Sidebar: React.FC<SidebarProps> = ({ currentView, dbStatus, onNavigate, theme, onToggleTheme }) => {
  const activeItem = NAV_ITEMS.find(item => item.id === currentView);
  const statusColor = dbStatus === 'online' ? 'bg-emerald-400' : dbStatus === 'checking' ? 'bg-amber-400' : 'bg-violet-400';

  const Brand = ({ compact = false }: { compact?: boolean }) => (
    <div className="flex gap-3 items-center min-w-0">
      <div className={`${compact ? 'size-9 rounded-xl' : 'size-11 rounded-2xl'} brand-mark bg-gradient-to-tr from-[#4f46e5] via-[#7c3aed] to-[#a78bfa] flex items-center justify-center flex-shrink-0`}>
        <span className={`material-symbols-outlined text-white ${compact ? 'text-xl' : 'text-2xl'}`}>graphic_eq</span>
      </div>
      <div className="flex flex-col min-w-0">
        <h1 className={`${compact ? 'text-base' : 'text-lg'} text-white font-black leading-none tracking-[-0.03em]`}>CALCUOKE</h1>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`size-1.5 rounded-full ${statusColor}`}></span>
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.18em] truncate">
            {dbStatus === 'simulation' ? 'Local mode' : dbStatus}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="sidebar-shell w-[272px] bg-[#050810] border-r border-white/5 flex-shrink-0 flex-col justify-between p-5 hidden md:flex z-50">
        <div className="flex flex-col gap-9">
          <div className="px-2 pt-2"><Brand /></div>

          <div className="flex flex-col gap-3">
            <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.22em]">Workspace</p>
            <nav className="flex flex-col gap-1.5" aria-label="Primary navigation">
              {NAV_ITEMS.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`sidebar-link group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border transition-all ${isActive ? 'is-active text-cyan-400 border-cyan-400/15' : 'text-slate-500 border-transparent hover:text-slate-200 hover:bg-white/[0.035]'}`}
                  >
                    <span className={`nav-icon size-9 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-cyan-400/10' : 'bg-transparent group-hover:bg-white/5'}`}>
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    </span>
                    <span className="text-[13px] font-bold tracking-wide">{item.label}</span>
                    {isActive && <span className="ml-auto size-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(129,140,248,0.65)]"></span>}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="sidebar-footer rounded-2xl border border-white/5 p-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="theme-toggle size-10 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/20 transition-all flex items-center justify-center flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[19px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.16em]">System build</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">v4.0.0 · Stable</p>
          </div>
        </div>
      </aside>

      <header className="mobile-header md:hidden fixed inset-x-0 top-0 h-[68px] px-4 flex items-center justify-between z-[200] border-b border-white/5">
        <Brand compact />
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{activeItem?.label}</span>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="size-9 rounded-xl bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
          </button>
        </div>
      </header>

      <nav className="mobile-nav md:hidden fixed inset-x-3 bottom-3 h-[66px] px-1.5 grid grid-cols-4 items-center z-[200] rounded-[22px] border border-white/10" aria-label="Mobile navigation">
        {NAV_ITEMS.map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`h-[54px] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${isActive ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-500'}`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="text-[8px] font-black tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
