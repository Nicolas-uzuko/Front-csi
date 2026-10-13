import React from "react";

interface PaginationProps {
  total: number;
  skip: number;
  limit: number;
  onPageChange: (newSkip: number) => void;
}

export function Pagination({ total, skip, limit, onPageChange }: PaginationProps) {
  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startItem = total === 0 ? 0 : skip + 1;
  const endItem = Math.min(skip + limit, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 border-t border-[var(--csi-border)] bg-[var(--csi-surface)] text-sm text-[var(--csi-text-secondary)]">
      <div className="text-xs">
        Affichage de <span className="font-medium text-[var(--csi-text-primary)]">{startItem}</span> à{" "}
        <span className="font-medium text-[var(--csi-text-primary)]">{endItem}</span> sur{" "}
        <span className="font-medium text-[var(--csi-text-primary)]">{total}</span> enregistrements
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(0, skip - limit))}
          disabled={skip === 0}
          className="px-3 py-1.5 border border-[var(--csi-border)] rounded text-xs font-medium bg-[var(--csi-surface)] hover:bg-[var(--csi-vert-light)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Précédent
        </button>
        <span className="px-3 py-1 text-xs font-medium text-[var(--csi-text-primary)]">
          Page {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(skip + limit)}
          disabled={skip + limit >= total}
          className="px-3 py-1.5 border border-[var(--csi-border)] rounded text-xs font-medium bg-[var(--csi-surface)] hover:bg-[var(--csi-vert-light)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
