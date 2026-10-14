"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { IconCheckCircle, IconAlertCircle, IconInfo, IconX } from "@/components/ui/Icons";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (toast: Omit<Toast, "id">) => void;
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, message, description, duration = 4000 }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message, description, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, description?: string) => addToast({ type: "success", message, description }),
    [addToast]
  );

  const error = useCallback(
    (message: string, description?: string) => addToast({ type: "error", message, description }),
    [addToast]
  );

  const info = useCallback(
    (message: string, description?: string) => addToast({ type: "info", message, description }),
    [addToast]
  );

  const warning = useCallback(
    (message: string, description?: string) => addToast({ type: "warning", message, description }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info, warning }}>
      {children}

      {/* Zone d'affichage des notifications flottantes (Toast container style Gmail / modern) */}
      <div
        className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-xl border text-xs transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
              t.type === "success"
                ? "bg-[var(--csi-surface)] text-[var(--csi-text-primary)] border-[var(--csi-vert-inst)]/30 ring-1 ring-[var(--csi-vert-inst)]/20"
                : t.type === "error"
                ? "bg-[var(--csi-surface)] text-red-900 border-red-300 ring-1 ring-red-200"
                : t.type === "warning"
                ? "bg-[var(--csi-surface)] text-amber-900 border-amber-300 ring-1 ring-amber-200"
                : "bg-[var(--csi-surface)] text-[var(--csi-text-primary)] border-[var(--csi-border)]"
            }`}
          >
            {/* Icône noir/blanc adaptée */}
            <span
              className={`flex-shrink-0 mt-0.5 ${
                t.type === "success"
                  ? "text-[var(--csi-vert-inst)]"
                  : t.type === "error"
                  ? "text-[var(--csi-danger)]"
                  : t.type === "warning"
                  ? "text-[var(--csi-warning)]"
                  : "text-[var(--csi-text-secondary)]"
              }`}
            >
              {t.type === "success" && <IconCheckCircle size={16} strokeWidth={2} />}
              {t.type === "error" && <IconAlertCircle size={16} strokeWidth={2} />}
              {t.type === "warning" && <IconAlertCircle size={16} strokeWidth={2} />}
              {t.type === "info" && <IconInfo size={16} strokeWidth={2} />}
            </span>

            {/* Contenu textuel */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs leading-snug">{t.message}</p>
              {t.description && (
                <p className="text-[11px] text-[var(--csi-text-secondary)] mt-0.5 leading-relaxed">
                  {t.description}
                </p>
              )}
            </div>

            {/* Bouton de fermeture rapide */}
            <button
              onClick={() => removeToast(t.id)}
              className="text-[var(--csi-text-secondary)] hover:text-black p-0.5 rounded-full hover:bg-[var(--csi-bg)] transition-colors"
              title="Fermer"
            >
              <IconX size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast doit être utilisé dans un ToastProvider");
  }
  return context;
}
