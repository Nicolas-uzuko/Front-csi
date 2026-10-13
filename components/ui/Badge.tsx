import React from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "neutral";

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  const styles: Record<BadgeVariant, string> = {
    default: "bg-[var(--csi-vert-soft)] text-[var(--csi-vert-deep)] border-[var(--csi-vert-inst)]/20",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-[var(--csi-warning-soft)] text-amber-900 border-amber-200",
    danger: "bg-[var(--csi-danger-soft)] text-red-800 border-red-200",
    info: "bg-[var(--csi-info-soft)] text-blue-800 border-blue-200",
    neutral: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
