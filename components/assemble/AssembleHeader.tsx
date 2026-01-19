import React from 'react';

interface AssembleHeaderProps {
  onOpenModal: () => void;
}

const AssembleHeader: React.FC<AssembleHeaderProps> = ({ onOpenModal }) => (
  <header className="flex justify-between items-start">
    <div className="flex flex-col gap-1">
      <h1 className="heading-gradient text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00f3ff] to-[#bc13fe] text-3xl md:text-4xl font-black leading-tight tracking-tight drop-shadow-sm uppercase">ASSEMBLE</h1>
      <p className="text-slate-400 text-sm font-medium">Kareoke set assembly.</p>
    </div>
    <button 
      onClick={onOpenModal}
      className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 rounded-xl text-white font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:scale-105 transition-all"
    >
      <span className="material-symbols-outlined text-[18px]">build</span>
      ASSEMBLE
    </button>
  </header>
);

export default AssembleHeader;
