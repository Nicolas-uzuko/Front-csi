"use client";

import React, { useEffect } from "react";
import { IconX } from "@/components/ui/Icons";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "lg",
}: DialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full ${maxWidthClasses[maxWidth]} max-h-[92vh] flex flex-col bg-[var(--csi-surface)] rounded-2xl shadow-2xl border border-[var(--csi-border)] overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--csi-border-subtle)] bg-[var(--csi-vert-light)]/40 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-6 rounded-full bg-[var(--csi-vert-inst)] mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-[var(--csi-vert-deep)] uppercase tracking-wide">
                {title}
              </h3>
              {description && (
                <p className="text-xs text-[var(--csi-text-secondary)] mt-0.5 leading-snug">
                  {description}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-[var(--csi-text-secondary)] hover:text-[var(--csi-vert-deep)] p-1.5 rounded-full hover:bg-[var(--csi-surface)] border border-transparent hover:border-[var(--csi-border)] transition-all"
            aria-label="Fermer"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Content with scrolling */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
