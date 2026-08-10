import React from 'react';

interface AssembleHeaderProps {
  onOpenModal: () => void;
}

const AssembleHeader: React.FC<AssembleHeaderProps> = ({ onOpenModal }) => (
  <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-5 pb-6 border-b border-white/5">
    <div className="flex flex-col gap-1">
      <h1 className="heading-gradient text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-300 to-violet-400 text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase">ASSEMBLE</h1>
      <p className="text-slate-400 text-sm font-medium">Configure and register a complete karaoke system.</p>
    </div>
    <button 
      onClick={onOpenModal}
      className="flex items-center justify-center gap-2 px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-[0_10px_26px_rgba(79,70,229,0.22)] hover:-translate-y-0.5 transition-all"
    >
      <span className="material-symbols-outlined text-[18px]">build</span>
      ASSEMBLE
    </button>
  </header>
);

export default AssembleHeader;
