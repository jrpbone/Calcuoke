import React from 'react';

interface ProjectSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const ProjectSearch: React.FC<ProjectSearchProps> = ({ value, onChange }) => (
  <section className="w-full">
    <div className="relative max-w-sm">
      <span className="absolute inset-y-0 left-0 flex items-center pl-4">
        <span className="material-symbols-outlined text-slate-500 text-[20px]">search</span>
      </span>
      <input
        className="w-full pl-11 pr-6 py-3 bg-[#0a0e17] border border-[#1f2f57] rounded-full text-xs text-white focus:outline-none focus:border-cyan-500/50 font-medium placeholder:text-slate-600 shadow-inner"
        placeholder="Search transactions.."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  </section>
);

export default ProjectSearch;
