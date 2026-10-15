import React from "react";

interface FormFieldProps {
  label: string;
  id?: string;
  error?: string | null;
  optional?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  id,
  error,
  optional = false,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5 text-left group">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-[11px] font-bold text-[var(--csi-vert-deep)] uppercase tracking-wider"
        >
          {label} {!optional && <span className="text-red-500 font-bold ml-0.5">*</span>}
        </label>
        {optional && (
          <span className="text-[10px] text-[var(--csi-text-secondary)] font-medium px-1.5 py-0.5 rounded-full bg-[var(--csi-bg)] border border-[var(--csi-border-subtle)]">
            Facultatif
          </span>
        )}
      </div>

      <div className="relative">
        {children}
      </div>

      {hint && !error && (
        <p className="text-[11px] text-[var(--csi-text-secondary)] leading-relaxed pl-0.5">{hint}</p>
      )}

      {error && (
        <p className="text-[11px] text-[var(--csi-danger)] font-medium flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export const inputClass =
  "w-full px-3.5 py-2.5 text-xs bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-[var(--csi-vert-inst)]/20 focus:border-[var(--csi-vert-inst)] hover:border-[var(--csi-vert-inst)]/40 transition-all duration-150 placeholder:text-[var(--csi-text-secondary)]/50 text-[var(--csi-text-primary)] disabled:opacity-60 disabled:cursor-not-allowed";

export const selectClass =
  "w-full px-3.5 py-2.5 text-xs bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-[var(--csi-vert-inst)]/20 focus:border-[var(--csi-vert-inst)] hover:border-[var(--csi-vert-inst)]/40 transition-all duration-150 text-[var(--csi-text-primary)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";

export const textareaClass =
  "w-full px-3.5 py-2.5 text-xs bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-[var(--csi-vert-inst)]/20 focus:border-[var(--csi-vert-inst)] hover:border-[var(--csi-vert-inst)]/40 transition-all duration-150 text-[var(--csi-text-primary)] placeholder:text-[var(--csi-text-secondary)]/50 min-h-[85px] leading-relaxed resize-y disabled:opacity-60 disabled:cursor-not-allowed";

