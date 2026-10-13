"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { NewDocumentButton } from "./NewDocumentButton";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";

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
      <div className="min-h-screen flex items-center justify-center bg-[var(--csi-bg)] text-xs font-semibold text-[var(--csi-vert-deep)]">
        Chargement du système CSI Sakaraha...
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
