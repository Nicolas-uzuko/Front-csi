"use client";

import React from "react";
import { useAuth } from "@/lib/auth/context";

interface TopbarProps {
  onToggleSidebar: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
}

export function Topbar({
  onToggleSidebar,
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Rechercher dans les courriers, références, expéditeurs...",
}: TopbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 border-b border-[var(--csi-border)] bg-[var(--csi-surface)] px-4 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Bouton burger mobile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 rounded text-[var(--csi-text-secondary)] hover:bg-[var(--csi-bg)]"
          aria-label="Menu"
        >
          ☰
        </button>
      </div>

      {/* Barre de recherche centrale style Gmail */}
      <div className="flex-1 max-w-2xl mx-auto">
        {onSearchChange && (
          <div className="relative flex items-center">
            <span className="absolute left-3 text-[var(--csi-text-secondary)] text-sm pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-[var(--csi-bg)] border border-transparent rounded-full focus:bg-[var(--csi-surface)] focus:border-[var(--csi-border)] focus:shadow-xs focus:outline-none transition-all placeholder:text-[var(--csi-text-secondary)]/60 text-[var(--csi-text-primary)]"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 text-xs text-[var(--csi-text-secondary)] hover:text-black"
                title="Effacer"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Actions utilisateur & Déconnexion */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex flex-col items-end mr-1 text-right">
          <span className="text-xs font-semibold text-[var(--csi-text-primary)] leading-none">
            {user?.nom_utilisateur || "Session"}
          </span>
          <span className="text-[10px] text-[var(--csi-text-secondary)]">
            Poste Sakaraha
          </span>
        </div>

        <button
          onClick={logout}
          title="Se déconnecter"
          className="px-2.5 py-1 text-xs font-medium text-[var(--csi-danger)] border border-[var(--csi-danger)]/20 hover:bg-[var(--csi-danger-soft)]/50 rounded transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}
