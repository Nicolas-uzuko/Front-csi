import React from "react";

export function Table({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="w-full overflow-x-auto border border-[var(--csi-border)] rounded-md bg-[var(--csi-surface)] shadow-xs">
      <table className={`w-full text-left text-sm border-collapse ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-[var(--csi-vert-light)] text-[var(--csi-vert-deep)] border-b border-[var(--csi-border)] font-semibold text-xs tracking-wider uppercase">
      {children}
    </thead>
  );
}

export function TableRow({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-[var(--csi-border-subtle)] last:border-none transition-colors hover:bg-[var(--csi-vert-soft)]/40 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={`py-3 px-4 font-medium text-xs text-[var(--csi-text-secondary)] whitespace-nowrap ${className}`}>{children}</th>;
}

export function TableCell({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <td
      onClick={onClick}
      className={`py-3 px-4 text-sm text-[var(--csi-text-primary)] align-middle ${className}`}
    >
      {children}
    </td>
  );
}

export function TableSkeleton({
  rows = 5,
  cols = 5,
  label = "Chargement des données en cours…",
}: {
  rows?: number;
  cols?: number;
  label?: string;
}) {
  return (
    <div className="w-full overflow-x-auto border border-[var(--csi-border)] rounded-2xl bg-[var(--csi-surface)] shadow-xs">
      <div className="py-4 px-6 border-b border-[var(--csi-border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-[var(--csi-vert-deep)]">
          <svg
            className="animate-spin text-[var(--csi-vert-inst)]"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span>{label}</span>
        </div>
        <div className="w-16 h-3 bg-[var(--csi-border-subtle)] rounded-full animate-pulse" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 animate-pulse">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="h-5 bg-[var(--csi-vert-soft)]/50 rounded-lg flex-1"
                style={{ opacity: 1 - (r * 0.08) }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
