"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/context";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Tableau de bord", href: "/dashboard", icon: "📊" },
  { label: "Courriers reçus", href: "/courriers/arrivee", icon: "📥" },
  { label: "Courriers envoyés", href: "/courriers/depart", icon: "📤" },
  { label: "Service courant", href: "/services-courants", icon: "📋" },
  { label: "Prise d'arme", href: "/situations", icon: "⚔️" },
  { label: "Archives & Pièces", href: "/archives", icon: "🗄️" },
  { label: "Plaintes", href: "/plaintes", icon: "⚖️", adminOnly: true },
  { label: "Procès-verbaux", href: "/proces-verbaux", icon: "📜", adminOnly: true },
  { label: "Historique d'audit", href: "/audit", icon: "🛡️", adminOnly: true },
  { label: "Utilisateurs", href: "/utilisateurs", icon: "👥", adminOnly: true },
];

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[var(--csi-surface)] border-r border-[var(--csi-border)] flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* En-tête Unité */}
        <div className="p-4 border-b border-[var(--csi-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[var(--csi-vert-inst)] text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs">
              CSI
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--csi-vert-deep)] uppercase tracking-wide leading-tight">
                CSI Sakaraha
              </div>
              <div className="text-[10px] text-[var(--csi-text-secondary)] font-medium">
                Gendarmerie Nationale
              </div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-[var(--csi-text-secondary)] hover:text-black p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation list inspirée Gmail */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--csi-vert-soft)] text-[var(--csi-vert-deep)] font-semibold shadow-2xs"
                    : "text-[var(--csi-text-primary)] hover:bg-[var(--csi-bg)]"
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bas de sidebar : Profil connecté */}
        <div className="p-3 border-t border-[var(--csi-border)] bg-[var(--csi-vert-light)]/40 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--csi-vert-inst)]/20 text-[var(--csi-vert-deep)] flex items-center justify-center text-xs font-bold">
            {user?.nom_utilisateur?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[var(--csi-text-primary)] truncate">
              {user?.nom_utilisateur || "Utilisateur"}
            </p>
            <p className="text-[10px] text-[var(--csi-text-secondary)] uppercase tracking-wider font-medium">
              {user?.role || "UTILISATEUR"}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
