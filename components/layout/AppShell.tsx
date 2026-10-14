"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { NewDocumentButton } from "./NewDocumentButton";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function AppShell({
  children,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
}: {
  children: React.ReactNode;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Si pas authentifié après chargement, redirection vers login
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--csi-bg)] p-6">
        <div className="flex flex-col items-center gap-4 text-center animate-loading-pulse">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo CSI Sakaraha"
              width={64}
              height={64}
              className="object-contain w-full h-full drop-shadow-md"
            />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--csi-vert-deep)] uppercase tracking-wider">
              <svg className="animate-spin text-[var(--csi-vert-inst)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span>Chargement de l&apos;application…</span>
            </div>
            <p className="text-[11px] text-[var(--csi-text-secondary)] font-medium">
              Poste de Commandement · CSI Sakaraha
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--csi-bg)]">
      {/* Navigation latérale */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Bouton création flottant */}
      <NewDocumentButton />
    </div>
  );
}
