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
    <div className="space-y-1.5 text-left">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-[var(--csi-text-primary)]"
        >
          {label} {!optional && <span className="text-red-600">*</span>}
        </label>
        {optional && (
          <span className="text-[11px] text-[var(--csi-text-secondary)] italic">
            Facultatif
          </span>
        )}
      </div>

      {children}

      {hint && !error && (
        <p className="text-[11px] text-[var(--csi-text-secondary)]">{hint}</p>
      )}

      {error && (
        <p className="text-xs text-[var(--csi-danger)] font-medium">{error}</p>
      )}
    </div>
  );
}

export const inputClass =
  "w-full px-3 py-2 text-sm bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--csi-vert-inst)] focus:border-[var(--csi-vert-inst)] transition-colors placeholder:text-[var(--csi-text-secondary)]/50 text-[var(--csi-text-primary)]";

export const selectClass =
  "w-full px-3 py-2 text-sm bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--csi-vert-inst)] focus:border-[var(--csi-vert-inst)] transition-colors text-[var(--csi-text-primary)]";

export const textareaClass =
  "w-full px-3 py-2 text-sm bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--csi-vert-inst)] focus:border-[var(--csi-vert-inst)] transition-colors text-[var(--csi-text-primary)] min-h-[80px]";
