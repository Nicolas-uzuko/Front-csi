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
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`py-3 px-4 text-sm text-[var(--csi-text-primary)] align-middle ${className}`}>{children}</td>;
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full overflow-x-auto border border-[var(--csi-border)] rounded-md bg-[var(--csi-surface)]">
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 animate-pulse">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="h-5 bg-[var(--csi-border)]/50 rounded flex-1"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
