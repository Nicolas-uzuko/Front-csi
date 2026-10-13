import React from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title,
  description,
  icon = "📁",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-md">
      <span className="text-4xl mb-3">{icon}</span>
      <h3 className="text-sm font-semibold text-[var(--csi-text-primary)]">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-xs text-[var(--csi-text-secondary)] max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] text-white text-xs font-medium rounded shadow-xs transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="p-6 bg-red-50/60 border border-red-200 rounded-md text-center">
      <p className="text-sm text-red-800 font-medium">⚠️ {message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white text-xs font-medium rounded transition-colors"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
