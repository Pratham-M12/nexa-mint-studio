import React, { useState, useEffect } from 'react';

interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToast = (e: any) => {
      const detail = e.detail;
      const newToast: ToastItem = {
        id: Math.random().toString(36).substring(2, 9),
        title: detail.title || 'Notification',
        message: detail.message || '',
        type: detail.type || 'info',
      };
      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss after 4.5s
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4500);
    };

    window.addEventListener('nexa-toast', handleToast);
    return () => window.removeEventListener('nexa-toast', handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const borderColors = {
          success: 'border-emerald-500/50 text-emerald-400',
          error: 'border-red-500/50 text-red-400',
          warning: 'border-amber-500/50 text-amber-400',
          info: 'border-cyan-500/50 text-cyan-400',
        };

        const iconNames = {
          success: 'check_circle',
          error: 'error',
          warning: 'warning',
          info: 'info',
        };

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-[#181b22]/95 backdrop-blur-md border border-[#282a2f] shadow-2xl inset-highlight text-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <span
              className={`material-symbols-outlined text-lg mt-0.5 ${borderColors[toast.type]}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {iconNames[toast.type]}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white text-xs tracking-wide">
                {toast.title}
              </div>
              <div className="text-xs text-[#ccc3d8] mt-0.5 leading-relaxed break-words">
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#958da1] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
