import React from 'react';

interface SwapConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const SwapConfirmModal: React.FC<SwapConfirmModalProps> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[900] flex items-center justify-center p-6">
    <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onCancel}></div>
    <div className="relative bg-[#0f121d] max-w-lg w-full p-10 rounded-[48px] border border-white/10 shadow-2xl animate-in text-center flex flex-col gap-8">
      <div className="size-20 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
        <span className="material-symbols-outlined text-4xl font-variation-FILL">published_with_changes</span>
      </div>
      <div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Confirm Asset Swap</h2>
      </div>
      <div className="flex flex-col gap-3">
        <button onClick={onConfirm} className="w-full py-5 rounded-[24px] bg-amber-500 text-white font-black uppercase tracking-[0.2em] text-[11px] hover:scale-[1.02] transition-all shadow-lg shadow-amber-500/20">Finalize Swap</button>
        <button onClick={onCancel} className="w-full py-5 rounded-[24px] bg-white/5 text-slate-400 font-black uppercase tracking-[0.2em] text-[11px] hover:text-white transition-all">Abort</button>
      </div>
    </div>
  </div>
);

export default SwapConfirmModal;
