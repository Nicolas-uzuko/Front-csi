"use client";

import React from "react";
import { Dialog } from "@/components/ui/Dialog";
import { IconAlertCircle, IconTrash, IconLogOut } from "@/components/ui/Icons";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4 text-xs">
        <div className="flex items-start gap-3">
          <span
            className={`p-2 rounded-full flex-shrink-0 ${
              variant === "danger"
                ? "bg-red-50 text-[var(--csi-danger)] border border-red-200"
                : variant === "warning"
                ? "bg-amber-50 text-[var(--csi-warning)] border border-amber-200"
                : "bg-[var(--csi-vert-soft)] text-[var(--csi-vert-deep)] border border-[var(--csi-border)]"
            }`}
          >
            {variant === "danger" ? (
              <IconTrash size={18} />
            ) : variant === "warning" ? (
              <IconLogOut size={18} />
            ) : (
              <IconAlertCircle size={18} />
            )}
          </span>
          <p className="text-xs text-[var(--csi-text-secondary)] leading-relaxed mt-1">
            {description}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[var(--csi-border)]">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 border border-[var(--csi-border)] rounded-full text-xs font-medium hover:bg-[var(--csi-bg)] transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-full text-xs font-medium text-white shadow-sm transition-colors disabled:opacity-50 ${
              variant === "danger"
                ? "bg-[var(--csi-danger)] hover:bg-red-700"
                : variant === "warning"
                ? "bg-[var(--csi-vert-deep)] hover:bg-[var(--csi-vert-hover)]"
                : "bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)]"
            }`}
          >
            {isLoading ? "En cours…" : confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
