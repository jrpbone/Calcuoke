import React from 'react';
import { Notification } from '../hooks/useNotifications';

interface NotificationStackProps {
  notifications: Notification[];
}

const NotificationStack: React.FC<NotificationStackProps> = ({ notifications }) => (
  <div className="fixed top-3 inset-x-3 sm:top-6 sm:left-auto sm:right-6 z-[300] flex flex-col gap-3 pointer-events-none sm:w-80">
    {notifications.map((notification) => (
      <div
        key={notification.id}
        className={`pointer-events-auto flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl border-l-4 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all ${notification.isExiting ? 'notification-exit' : 'notification-enter'} ${notification.type === 'success' ? 'bg-emerald-950/95 border-emerald-400' : 'bg-red-950/95 border-red-400'}`}
      >
        <div className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.type === 'success' ? 'bg-emerald-400/20' : 'bg-red-400/20'}`}>
          <span className={`material-symbols-outlined text-white text-[22px] font-variation-FILL`}>
            {notification.type === 'success' ? 'check_circle' : 'error'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-0.5">System Message</span>
          <p className="text-sm text-white font-bold leading-tight">{notification.message}</p>
        </div>
      </div>
    ))}
  </div>
);

export default NotificationStack;
