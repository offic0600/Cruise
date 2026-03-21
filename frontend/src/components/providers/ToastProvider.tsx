'use client';

import { Check, CheckCheck, Copy, Link2, X } from 'lucide-react';
import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type AppToastAction = {
  id: string;
  kind?: 'button' | 'link';
  label?: string;
  href?: string;
  icon?: 'link' | 'copy' | 'check';
  ariaLabel: string;
  successLabel?: string;
  onClick?: () => boolean | Promise<boolean | void> | void;
};

export type AppToast = {
  id: string;
  type?: 'success';
  title: string;
  description: string;
  primaryAction?: AppToastAction;
  secondaryActions?: AppToastAction[];
  durationMs?: number;
  dismissible?: boolean;
  dismissLabel?: string;
};

type ToastContextValue = {
  pushToast: (toast: Omit<AppToast, 'id'> & { id?: string }) => string;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function toastIcon(type: AppToast['type']) {
  if (type === 'success' || type == null) {
    return <Check className="h-4 w-4 text-white" />;
  }
  return <Check className="h-4 w-4 text-white" />;
}

function actionIcon(icon?: AppToastAction['icon']) {
  if (icon === 'copy') return <Copy className="h-4 w-4" />;
  if (icon === 'check') return <CheckCheck className="h-4 w-4" />;
  return <Link2 className="h-4 w-4" />;
}

function ToastActionButton({ action }: { action: AppToastAction }) {
  const [confirmed, setConfirmed] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (action.kind === 'link' && action.href) {
    return (
      <Link
        href={action.href}
        aria-label={action.ariaLabel}
        title={action.ariaLabel}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-soft text-ink-500 transition hover:border-border-subtle hover:bg-slate-50 hover:text-ink-900"
      >
        {actionIcon(action.icon)}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={confirmed ? action.successLabel ?? action.ariaLabel : action.ariaLabel}
      title={confirmed ? action.successLabel ?? action.ariaLabel : action.ariaLabel}
      onClick={async () => {
        const result = await action.onClick?.();
        if (result) {
          setConfirmed(true);
          if (timerRef.current != null) {
            window.clearTimeout(timerRef.current);
          }
          timerRef.current = window.setTimeout(() => setConfirmed(false), 1800);
        }
      }}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-soft text-ink-500 transition hover:border-border-subtle hover:bg-slate-50 hover:text-ink-900"
    >
      {confirmed ? actionIcon('check') : actionIcon(action.icon)}
    </button>
  );
}

function ToastCard({ toast, onDismiss }: { toast: AppToast; onDismiss: () => void }) {
  return (
    <div className="w-[360px] max-w-[calc(100vw-32px)] rounded-[20px] border border-border-soft bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
            {toastIcon(toast.type)}
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-medium text-ink-900">{toast.title}</div>
            <div className="mt-2 truncate text-[15px] text-ink-700">{toast.description}</div>
          </div>
        </div>
        {toast.dismissible === false ? null : (
          <button
            type="button"
            aria-label={toast.dismissLabel ?? 'Dismiss'}
            title={toast.dismissLabel ?? 'Dismiss'}
            onClick={onDismiss}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-400 transition hover:bg-slate-100 hover:text-ink-900"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        {toast.primaryAction?.href ? (
          <Link
            href={toast.primaryAction.href}
            className="text-[15px] font-medium text-brand-600 transition hover:text-brand-700"
          >
            {toast.primaryAction.label}
          </Link>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          {(toast.secondaryActions ?? []).map((action) => (
            <ToastActionButton key={action.id} action={action} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ToastViewport({
  toasts,
  dismissToast,
}: {
  toasts: AppToast[];
  dismissToast: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastCard toast={toast} onDismiss={() => dismissToast(toast.id)} />
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<AppToast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((toast: Omit<AppToast, 'id'> & { id?: string }) => {
    const id = toast.id ?? `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [{ ...toast, id }, ...current].slice(0, 4));
    return id;
  }, []);

  useEffect(() => {
    const timers = toasts
      .filter((toast) => (toast.durationMs ?? 7000) > 0)
      .map((toast) =>
        window.setTimeout(() => {
          dismissToast(toast.id);
        }, toast.durationMs ?? 7000)
      );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [dismissToast, toasts]);

  const value = useMemo<ToastContextValue>(
    () => ({
      pushToast,
      dismissToast,
    }),
    [dismissToast, pushToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} dismissToast={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
