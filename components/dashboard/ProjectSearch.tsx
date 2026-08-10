import React from 'react';

interface ProjectSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const ProjectSearch: React.FC<ProjectSearchProps> = ({ value, onChange }) => (
  <section className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div>
      <h2 className="text-base font-black text-white tracking-tight">Recent transactions</h2>
      <p className="text-xs text-slate-500 mt-0.5">Search customers, invoices, or build grades.</p>
    </div>
    <div className="relative w-full sm:max-w-sm">
      <span className="absolute inset-y-0 left-0 flex items-center pl-4">
        <span className="material-symbols-outlined text-slate-500 text-[20px]">search</span>
      </span>
      <input
        className="w-full pl-11 pr-6 py-3.5 bg-[#0a0e17]/80 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-cyan-500/50 font-medium placeholder:text-slate-600 shadow-inner"
        placeholder="Search transactions…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  </section>
);

export default ProjectSearch;
