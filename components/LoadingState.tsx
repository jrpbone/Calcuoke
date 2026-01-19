import React from 'react';

interface LoadingStateProps {
  label?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ label = 'Syncing Database...' }) => (
  <div className="h-full flex flex-col items-center justify-center gap-4">
    <div className="size-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
    <p className="text-slate-500 font-mono text-xs uppercase tracking-widest animate-pulse">{label}</p>
  </div>
);

export default LoadingState;
