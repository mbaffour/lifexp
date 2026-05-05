/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';

type ToastType = 'success' | 'info' | 'warning';
type ToastAction = { label: string; onClick: () => void };
type Toast = { id: string; message: string; type: ToastType; action?: ToastAction };

type PushFn = (message: string, type?: ToastType, action?: ToastAction) => void;

const ToastContext = createContext<PushFn>(() => undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback<PushFn>((message, type = 'success', action) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, type, action }]);
    window.setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = toast.type === 'warning' ? TriangleAlert : toast.type === 'info' ? Info : CheckCircle2;
            return (
              <motion.div
                className={`toast toast-${toast.type}`}
                key={toast.id}
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              >
                <Icon size={17} />
                <span style={{ flex: 1 }}>{toast.message}</span>
                {toast.action ? (
                  <button
                    className="toast-action"
                    onClick={() => { toast.action!.onClick(); dismiss(toast.id); }}
                  >
                    {toast.action.label}
                  </button>
                ) : null}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
