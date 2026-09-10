'use client';

import React from 'react';
import { usePharmacy } from '@/lib/store';
import { Icon } from '@/components/ui/icon';

import { Button } from '@/components/ui/button';

export function ToastContainer() {
  const { toasts, dismissToast } = usePharmacy();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map(toast => {
        const bgColors = {
          success: 'bg-white border-emerald-500/80 text-slate-900',
          info: 'bg-white border-blue-500/80 text-slate-900',
          warning: 'bg-white border-amber-500/80 text-slate-900',
          error: 'bg-white border-rose-500/80 text-slate-900'
        }[toast.type];

        const iconNames = {
          success: 'check_circle',
          info: 'info',
          warning: 'warning',
          error: 'error'
        }[toast.type];

        const iconColors = {
          success: 'text-emerald-600',
          info: 'text-blue-600',
          warning: 'text-amber-600',
          error: 'text-rose-600'
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border-l-4 shadow-xl border bg-white animate-in slide-in-from-bottom-3 duration-200 ${bgColors}`}
          >
            <Icon name={iconNames} className={`text-xl shrink-0 mt-0.5 ${iconColors}`} />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900">{toast.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 shrink-0 h-6 w-6"
            >
              <Icon name="close" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
