"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { IconSearch, IconX, IconMenu, IconLogOut } from "@/components/ui/Icons";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

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
  searchPlaceholder = "Rechercher dans les courriers, références, expéditeurs…",
}: TopbarProps) {
  const { user, logout } = useAuth();
  const { info } = useToast();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleConfirmLogout = () => {
    info("Déconnexion en cours", "Fermeture de la session sécurisée.");
    logout();
  };

  return (
    <header className="h-14 border-b border-[var(--csi-border)] bg-[var(--csi-surface)] px-3 flex items-center justify-between gap-3 sticky top-0 z-30">
      {/* Bouton burger mobile */}
      <button
        onClick={onToggleSidebar}
        className="md:hidden p-2 rounded-full text-[var(--csi-text-secondary)] hover:bg-[var(--csi-bg)] transition-colors"
        aria-label="Menu"
      >
        <IconMenu size={20} />
      </button>

      {/* Barre de recherche centrale — style Gmail */}
      <div className="flex-1 max-w-2xl mx-auto">
        {onSearchChange && (
          <div className="relative flex items-center">
            <span className="absolute left-3 text-[var(--csi-text-secondary)] pointer-events-none">
              <IconSearch size={16} />
            </span>
            <input
              type="text"
              value={searchTerm || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-9 py-2 text-sm bg-[var(--csi-bg)] border border-transparent rounded-2xl focus:bg-[var(--csi-surface)] focus:border-[var(--csi-border)] focus:shadow-sm focus:outline-none transition-all placeholder:text-[var(--csi-text-secondary)]/50 text-[var(--csi-text-primary)]"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 text-[var(--csi-text-secondary)] hover:text-black p-0.5 rounded-full hover:bg-[var(--csi-border)]/40"
                title="Effacer"
              >
                <IconX size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Actions utilisateur */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-xs font-semibold text-[var(--csi-text-primary)] leading-none">
            {user?.nom_utilisateur || "Session"}
          </span>
          <span className="text-[10px] text-[var(--csi-text-secondary)] leading-tight mt-0.5">
            Poste Sakaraha
          </span>
        </div>

        <button
          onClick={() => setIsLogoutConfirmOpen(true)}
          title="Se déconnecter"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[var(--csi-text-secondary)] hover:text-[var(--csi-danger)] hover:bg-[var(--csi-danger-soft)]/40 border border-transparent hover:border-[var(--csi-danger)]/20 rounded-full transition-colors"
        >
          <IconLogOut size={15} />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>

      {/* Popup de confirmation de déconnexion */}
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Confirmation de déconnexion"
        description="Êtes-vous certain de vouloir vous déconnecter du système du CSI Sakaraha ? Votre session sécurisée prendra fin."
        confirmLabel="Se déconnecter"
        cancelLabel="Rester connecté"
        variant="warning"
      />
    </header>
  );
}

