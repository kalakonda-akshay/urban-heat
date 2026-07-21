import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

type ToastCallback = (toasts: ToastItem[]) => void;
const listeners = new Set<ToastCallback>();
let toastList: ToastItem[] = [];

export const toast = {
  success(message: string) {
    this.add('success', message);
  },
  error(message: string) {
    this.add('error', message);
  },
  info(message: string) {
    this.add('info', message);
  },
  add(type: ToastItem['type'], message: string) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { id, type, message };
    toastList = [...toastList, newToast];
    listeners.forEach(listener => listener(toastList));
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      this.remove(id);
    }, 4000);
  },
  remove(id: string) {
    toastList = toastList.filter(t => t.id !== id);
    listeners.forEach(listener => listener(toastList));
  },
  subscribe(listener: ToastCallback) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe(setToasts);
    return () => {
      unsubscribe();
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((item) => {
        const bgClass = {
          success: 'bg-emerald-950/90 border border-emerald-500/30 text-emerald-100',
          error: 'bg-rose-950/90 border border-rose-500/30 text-rose-100',
          info: 'bg-sky-950/90 border border-sky-500/30 text-sky-100'
        }[item.type];

        const Icon = {
          success: CheckCircle2,
          error: AlertTriangle,
          info: Info
        }[item.type];

        const iconColor = {
          success: 'text-emerald-400',
          error: 'text-rose-400',
          info: 'text-sky-400'
        }[item.type];

        return (
          <div
            key={item.id}
            className={`flex items-start p-4 rounded-lg shadow-glass-shadow backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-slide-in ${bgClass}`}
          >
            <Icon className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${iconColor}`} />
            <div className="flex-1 text-sm font-medium pr-2">{item.message}</div>
            <button
              onClick={() => toast.remove(item.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
