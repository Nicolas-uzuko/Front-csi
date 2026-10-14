"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import {
  IconChart,
  IconInbox,
  IconOutbox,
  IconClipboard,
  IconSword,
  IconArchive,
  IconScale,
  IconScroll,
  IconShield,
  IconUsers,
} from "@/components/ui/Icons";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Tableau de bord",   href: "/dashboard",         icon: <IconChart size={16} /> },
  { label: "Courriers reçus",   href: "/courriers/arrivee", icon: <IconInbox size={16} /> },
  { label: "Courriers envoyés", href: "/courriers/depart",  icon: <IconOutbox size={16} /> },
  { label: "Service courant",   href: "/services-courants", icon: <IconClipboard size={16} /> },
  { label: "Prise d'arme",      href: "/situations",        icon: <IconSword size={16} /> },
  { label: "Archives & Pièces", href: "/archives",          icon: <IconArchive size={16} /> },
  { label: "Plaintes",          href: "/plaintes",          icon: <IconScale size={16} />, adminOnly: true },
  { label: "Procès-verbaux",    href: "/proces-verbaux",    icon: <IconScroll size={16} />, adminOnly: true },
  { label: "Historique d'audit",href: "/audit",             icon: <IconShield size={16} />, adminOnly: true },
  { label: "Utilisateurs",      href: "/utilisateurs",      icon: <IconUsers size={16} />, adminOnly: true },
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
        className={`fixed md:static inset-y-0 left-0 z-40 w-60 bg-[var(--csi-surface)] border-r border-[var(--csi-border)] flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* En-tête Unité — style Gmail header avec le logo */}
        <div className="h-14 px-4 flex items-center gap-3 border-b border-[var(--csi-border)]">
          <div className="relative w-9 h-9 flex-shrink-0 flex items-center justify-center cursor-pointer logo-spin-hover" title="CSI Sakaraha">
            <Image
              src="/logo.png"
              alt="Logo CSI Sakaraha"
              width={36}
              height={36}
              className="object-contain w-full h-full drop-shadow-xs"
            />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[var(--csi-vert-deep)] uppercase tracking-wide leading-tight truncate">
              CSI Sakaraha
            </div>
            <div className="text-[10px] text-[var(--csi-text-secondary)] font-medium leading-tight">
              Gendarmerie Nationale
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden ml-auto text-[var(--csi-text-secondary)] hover:text-black p-1 rounded"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation — style Gmail pill */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
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
                className={`flex items-center gap-3 px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--csi-vert-soft)] text-[var(--csi-vert-deep)] font-semibold"
                    : "text-[var(--csi-text-primary)] hover:bg-[var(--csi-bg)]"
                }`}
              >
                <span
                  className={`flex-shrink-0 ${
                    isActive
                      ? "text-[var(--csi-vert-deep)]"
                      : "text-[var(--csi-text-secondary)]"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bas de sidebar : Profil connecté */}
        <div className="p-3 border-t border-[var(--csi-border)] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[var(--csi-vert-inst)]/15 text-[var(--csi-vert-deep)] flex items-center justify-center text-xs font-bold flex-shrink-0">
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
