"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";

export function NewDocumentButton({
  onOpenCreateModal,
}: {
  onOpenCreateModal?: (type: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { isAdmin } = useAuth();

  const handleSelect = (route: string) => {
    setIsOpen(false);
    if (onOpenCreateModal) {
      onOpenCreateModal(route);
    } else {
      router.push(route);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Menu popup rapide */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-56 bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-lg shadow-lg py-1 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-3 py-1.5 font-semibold text-[10px] text-[var(--csi-text-secondary)] uppercase tracking-wider border-b border-[var(--csi-border)]">
            Enregistrement rapide
          </div>

          <button
            onClick={() => handleSelect("/courriers/arrivee?action=create")}
            className="w-full text-left px-3 py-2 hover:bg-[var(--csi-vert-light)] flex items-center gap-2 text-[var(--csi-text-primary)]"
          >
            <span>📥</span> Courrier Arrivée (/3, /3S)
          </button>

          <button
            onClick={() => handleSelect("/courriers/depart?action=create")}
            className="w-full text-left px-3 py-2 hover:bg-[var(--csi-vert-light)] flex items-center gap-2 text-[var(--csi-text-primary)]"
          >
            <span>📤</span> Courrier Départ (/2, /4)
          </button>

          <button
            onClick={() => handleSelect("/services-courants?action=create")}
            className="w-full text-left px-3 py-2 hover:bg-[var(--csi-vert-light)] flex items-center gap-2 text-[var(--csi-text-primary)]"
          >
            <span>📋</span> Service Courant
          </button>

          <button
            onClick={() => handleSelect("/situations?action=create")}
            className="w-full text-left px-3 py-2 hover:bg-[var(--csi-vert-light)] flex items-center gap-2 text-[var(--csi-text-primary)]"
          >
            <span>⚔️</span> Prise d'Arme
          </button>

          <button
            onClick={() => handleSelect("/archives?action=create")}
            className="w-full text-left px-3 py-2 hover:bg-[var(--csi-vert-light)] flex items-center gap-2 text-[var(--csi-text-primary)]"
          >
            <span>🗄️</span> Importer / Classer Pièce
          </button>

          {isAdmin && (
            <>
              <div className="my-1 border-t border-[var(--csi-border)]" />
              <button
                onClick={() => handleSelect("/plaintes?action=create")}
                className="w-full text-left px-3 py-2 hover:bg-[var(--csi-vert-light)] flex items-center gap-2 text-[var(--csi-text-primary)]"
              >
                <span>⚖️</span> Enregistrer Plainte
              </button>
              <button
                onClick={() => handleSelect("/proces-verbaux?action=create")}
                className="w-full text-left px-3 py-2 hover:bg-[var(--csi-vert-light)] flex items-center gap-2 text-[var(--csi-text-primary)]"
              >
                <span>📜</span> Enregistrer PV
              </button>
            </>
          )}
        </div>
      )}

      {/* Bouton style Gmail "Nouveau message" avec vert institutionnel */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] text-white rounded-full shadow-md hover:shadow-lg transition-all font-medium text-xs tracking-wide active:scale-95"
        title="Créer un nouveau document"
        aria-expanded={isOpen}
      >
        <span className="text-base font-bold leading-none">＋</span>
        <span className="hidden sm:inline">Nouveau document</span>
      </button>
    </div>
  );
}
