"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import {
  IconPlus,
  IconInbox,
  IconOutbox,
  IconClipboard,
  IconSword,
  IconArchive,
  IconScale,
  IconScroll,
} from "@/components/ui/Icons";

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
      {/* Menu popup rapide — style Gmail compose */}
      {isOpen && (
        <>
          {/* Backdrop transparent pour fermer */}
          <div
            className="fixed inset-0"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-14 right-0 w-60 bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl shadow-xl py-1.5 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150 z-10">
            <div className="px-4 py-2 font-semibold text-[10px] text-[var(--csi-text-secondary)] uppercase tracking-widest border-b border-[var(--csi-border)] mb-1">
              Enregistrement rapide
            </div>

            <button
              onClick={() => handleSelect("/courriers/arrivee?action=create")}
              className="w-full text-left px-4 py-2.5 hover:bg-[var(--csi-vert-light)] flex items-center gap-3 text-[var(--csi-text-primary)] transition-colors"
            >
              <span className="text-[var(--csi-text-secondary)]"><IconInbox size={15} /></span>
              Courrier Arrivée (/3, /3S)
            </button>

            <button
              onClick={() => handleSelect("/courriers/depart?action=create")}
              className="w-full text-left px-4 py-2.5 hover:bg-[var(--csi-vert-light)] flex items-center gap-3 text-[var(--csi-text-primary)] transition-colors"
            >
              <span className="text-[var(--csi-text-secondary)]"><IconOutbox size={15} /></span>
              Courrier Départ (/2, /4)
            </button>

            <button
              onClick={() => handleSelect("/services-courants?action=create")}
              className="w-full text-left px-4 py-2.5 hover:bg-[var(--csi-vert-light)] flex items-center gap-3 text-[var(--csi-text-primary)] transition-colors"
            >
              <span className="text-[var(--csi-text-secondary)]"><IconClipboard size={15} /></span>
              Service Courant
            </button>

            <button
              onClick={() => handleSelect("/situations?action=create")}
              className="w-full text-left px-4 py-2.5 hover:bg-[var(--csi-vert-light)] flex items-center gap-3 text-[var(--csi-text-primary)] transition-colors"
            >
              <span className="text-[var(--csi-text-secondary)]"><IconSword size={15} /></span>
              Prise d'Arme
            </button>

            <button
              onClick={() => handleSelect("/archives?action=create")}
              className="w-full text-left px-4 py-2.5 hover:bg-[var(--csi-vert-light)] flex items-center gap-3 text-[var(--csi-text-primary)] transition-colors"
            >
              <span className="text-[var(--csi-text-secondary)]"><IconArchive size={15} /></span>
              Importer / Classer Pièce
            </button>

            {isAdmin && (
              <>
                <div className="my-1 mx-3 border-t border-[var(--csi-border)]" />
                <button
                  onClick={() => handleSelect("/plaintes?action=create")}
                  className="w-full text-left px-4 py-2.5 hover:bg-[var(--csi-vert-light)] flex items-center gap-3 text-[var(--csi-text-primary)] transition-colors"
                >
                  <span className="text-[var(--csi-text-secondary)]"><IconScale size={15} /></span>
                  Enregistrer Plainte
                </button>
                <button
                  onClick={() => handleSelect("/proces-verbaux?action=create")}
                  className="w-full text-left px-4 py-2.5 hover:bg-[var(--csi-vert-light)] flex items-center gap-3 text-[var(--csi-text-primary)] transition-colors"
                >
                  <span className="text-[var(--csi-text-secondary)]"><IconScroll size={15} /></span>
                  Enregistrer PV
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* Bouton principal flottant avec vert institutionnel, animation d'impulsion subtile et hover interactif */}
      <div className="relative group">
        {/* Halo d'impulsion discret en arrière-plan pour attirer le regard */}
        <span
          className={`absolute -inset-1 rounded-full bg-[var(--csi-vert-inst)] opacity-30 blur-sm transition-all duration-500 group-hover:opacity-60 ${
            isOpen ? "scale-90 opacity-0" : "animate-pulse"
          }`}
          aria-hidden="true"
        />

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative flex items-center gap-2.5 px-5 py-3 rounded-full text-white font-medium text-xs tracking-wide shadow-lg hover:shadow-xl transition-all duration-200 transform active:scale-95 hover:-translate-y-0.5 border border-white/15 ${
            isOpen
              ? "bg-[var(--csi-vert-deep)] ring-2 ring-[var(--csi-vert-inst)]/50"
              : "bg-gradient-to-r from-[var(--csi-vert-inst)] to-[var(--csi-vert-hover)] hover:brightness-110"
          }`}
          title="Créer un nouveau document"
          aria-expanded={isOpen}
        >
          <span
            className={`inline-flex transition-transform duration-300 ease-out ${
              isOpen ? "rotate-45" : "group-hover:rotate-90"
            }`}
          >
            <IconPlus size={16} strokeWidth={2.5} />
          </span>
          <span className="font-semibold text-xs tracking-wide select-none">
            {isOpen ? "Fermer" : "Nouveau document"}
          </span>
        </button>
      </div>
    </div>
  );
}
