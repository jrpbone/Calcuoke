import React from 'react';

interface PhotoPreviewModalProps {
  src: string;
  onClose: () => void;
  label?: string;
}

const PhotoPreviewModal: React.FC<PhotoPreviewModalProps> = ({ src, onClose, label = 'System Record Image' }) => (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center p-12">
    <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={onClose}></div>
    <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center gap-6 animate-in">
      <button onClick={onClose} className="absolute top-0 right-0 size-14 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all shadow-xl">
        <span className="material-symbols-outlined text-2xl">close</span>
      </button>
      <img src={src} className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl border border-white/10" />
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em]">{label}</p>
    </div>
  </div>
);

export default PhotoPreviewModal;
