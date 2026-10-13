"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth/context";
import { api } from "@/lib/api/endpoints";
import { Badge } from "@/components/ui/Badge";
import { CourrierArrivee, CourrierDepart } from "@/types/api";

interface StatsData {
  courriersArrivee: number;
  courriersDepart: number;
  servicesCourants: number;
  situations: number;
  documents: number;
  plaintes?: number;
  procesVerbaux?: number;
}

export default function DashboardPage() {
  const { user, isAdmin, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentArrivees, setRecentArrivees] = useState<CourrierArrivee[]>([]);
  const [recentDeparts, setRecentDeparts] = useState<CourrierDepart[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    async function loadDashboard() {
      setIsLoading(true);
      try {
        // Appels parallèles pour récupérer les totaux réels retournés par FastAPI
        const [arrRes, depRes, servRes, sitRes, docRes] = await Promise.all([
          api.courriersArrivee.list(0, 5),
          api.courriersDepart.list(0, 5),
          api.servicesCourants.list(0, 1),
          api.situations.list(0, 1),
          api.documents.list(0, 1),
        ]);

        const newStats: StatsData = {
          courriersArrivee: arrRes.total,
          courriersDepart: depRes.total,
          servicesCourants: servRes.total,
          situations: sitRes.total,
          documents: docRes.total,
        };

        if (isAdmin) {
          try {
            const [plRes, pvRes] = await Promise.all([
              api.plaintes.list(0, 1),
              api.procesVerbaux.list(0, 1),
            ]);
            newStats.plaintes = plRes.total;
            newStats.procesVerbaux = pvRes.total;
          } catch {
            // Ignorer si droits manquants
          }
        }

        setStats(newStats);
        setRecentArrivees(arrRes.items);
        setRecentDeparts(depRes.items);
      } catch (err) {
        console.error("Erreur de chargement du dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [isAdmin, isAuthenticated, authLoading]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* En-tête de bienvenue contextuelle */}
        <div className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-lg p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-base font-bold text-[var(--csi-vert-deep)]">
              Poste de Commandement — CSI Sakaraha
            </h1>
            <p className="text-xs text-[var(--csi-text-secondary)] mt-0.5">
              Connecté en tant que{" "}
              <span className="font-semibold text-[var(--csi-text-primary)]">
                {user?.nom_utilisateur}
              </span>{" "}
              ({user?.role}) • Registres administratifs et opérationnels
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-[var(--csi-text-secondary)]">
              Statut du système :
            </span>{" "}
            <Badge variant="success">Opérationnel</Badge>
          </div>
        </div>

        {/* Grille des volumes de documents réels */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            label="Courriers Reçus"
            count={stats?.courriersArrivee}
            loading={isLoading}
            href="/courriers/arrivee"
            icon="📥"
          />
          <StatCard
            label="Courriers Envoyés"
            count={stats?.courriersDepart}
            loading={isLoading}
            href="/courriers/depart"
            icon="📤"
          />
          <StatCard
            label="Services Courants"
            count={stats?.servicesCourants}
            loading={isLoading}
            href="/services-courants"
            icon="📋"
          />
          <StatCard
            label="Prises d'Arme"
            count={stats?.situations}
            loading={isLoading}
            href="/situations"
            icon="⚔️"
          />
          <StatCard
            label="Pièces Archivées"
            count={stats?.documents}
            loading={isLoading}
            href="/archives"
            icon="🗄️"
          />
          {isAdmin && (
            <>
              <StatCard
                label="Plaintes (Sensible)"
                count={stats?.plaintes}
                loading={isLoading}
                href="/plaintes"
                icon="⚖️"
              />
              <StatCard
                label="Procès-Verbaux"
                count={stats?.procesVerbaux}
                loading={isLoading}
                href="/proces-verbaux"
                icon="📜"
              />
            </>
          )}
        </div>

        {/* Section 2 colonnes : Derniers courriers reçus / envoyés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Courriers reçus récents */}
          <div className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-lg p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--csi-border)] mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--csi-vert-deep)] flex items-center gap-2">
                <span>📥</span> Derniers Courriers Arrivée
              </h2>
              <Link
                href="/courriers/arrivee"
                className="text-[11px] text-[var(--csi-vert-inst)] hover:underline font-medium"
              >
                Voir tout →
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-10 bg-[var(--csi-bg)] animate-pulse rounded" />
                ))}
              </div>
            ) : recentArrivees.length === 0 ? (
              <p className="text-xs text-[var(--csi-text-secondary)] py-6 text-center italic">
                Aucun courrier reçu enregistré.
              </p>
            ) : (
              <div className="divide-y divide-[var(--csi-border-subtle)]">
                {recentArrivees.map((c) => (
                  <Link
                    key={c.id_courrier}
                    href={`/courriers/arrivee?id=${c.id_courrier}`}
                    className="py-2.5 px-2 -mx-2 flex items-center justify-between hover:bg-[var(--csi-vert-light)] rounded transition-colors group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[var(--csi-text-primary)] group-hover:text-[var(--csi-vert-deep)] truncate">
                          {c.numero_ordre || `Courrier #${c.id_courrier}`}
                        </span>
                        <Badge variant="default">{c.categorie}</Badge>
                        <Badge variant={c.categorie_archive === "B" ? "warning" : "neutral"}>
                          Cat. {c.categorie_archive}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-[var(--csi-text-secondary)] truncate mt-0.5">
                        {c.origine_piece || c.fm || "Origine non renseignée"} • {c.analyse || c.corps_message || "Sans objet"}
                      </p>
                    </div>
                    <span className="text-[10px] text-[var(--csi-text-secondary)] whitespace-nowrap">
                      {c.date_reception || c.date_piece || "-"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Courriers envoyés récents */}
          <div className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-lg p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--csi-border)] mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--csi-vert-deep)] flex items-center gap-2">
                <span>📤</span> Derniers Courriers Départ
              </h2>
              <Link
                href="/courriers/depart"
                className="text-[11px] text-[var(--csi-vert-inst)] hover:underline font-medium"
              >
                Voir tout →
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-10 bg-[var(--csi-bg)] animate-pulse rounded" />
                ))}
              </div>
            ) : recentDeparts.length === 0 ? (
              <p className="text-xs text-[var(--csi-text-secondary)] py-6 text-center italic">
                Aucun courrier expédié enregistré.
              </p>
            ) : (
              <div className="divide-y divide-[var(--csi-border-subtle)]">
                {recentDeparts.map((c) => (
                  <Link
                    key={c.id_courrier}
                    href={`/courriers/depart?id=${c.id_courrier}`}
                    className="py-2.5 px-2 -mx-2 flex items-center justify-between hover:bg-[var(--csi-vert-light)] rounded transition-colors group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[var(--csi-text-primary)] group-hover:text-[var(--csi-vert-deep)] truncate">
                          {c.reference_message || `Réf #${c.id_courrier}`}
                        </span>
                        <Badge variant="default">{c.categorie}</Badge>
                        <Badge variant={c.categorie_archive === "B" ? "warning" : "neutral"}>
                          Cat. {c.categorie_archive}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-[var(--csi-text-secondary)] truncate mt-0.5">
                        {c.to || c.signataire || "Destinataire non renseigné"} • {c.objet || c.corps_message || "Sans objet"}
                      </p>
                    </div>
                    <span className="text-[10px] text-[var(--csi-text-secondary)] whitespace-nowrap">
                      {c.date_envoi || c.date_piece || "-"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Raccourcis d'opérations courantes */}
        <div className="bg-[var(--csi-vert-soft)]/50 border border-[var(--csi-border)] rounded-lg p-4">
          <h3 className="text-xs font-bold text-[var(--csi-vert-deep)] uppercase tracking-wider mb-2">
            Procédures Rapides
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/courriers/arrivee"
              className="px-3 py-1.5 bg-white border border-[var(--csi-border)] hover:border-[var(--csi-vert-inst)] rounded text-xs font-medium text-[var(--csi-text-primary)] hover:text-[var(--csi-vert-deep)] transition-colors shadow-2xs"
            >
              📥 Enregistrer Courrier Reçu
            </Link>
            <Link
              href="/courriers/depart"
              className="px-3 py-1.5 bg-white border border-[var(--csi-border)] hover:border-[var(--csi-vert-inst)] rounded text-xs font-medium text-[var(--csi-text-primary)] hover:text-[var(--csi-vert-deep)] transition-colors shadow-2xs"
            >
              📤 Enregistrer Message Départ
            </Link>
            <Link
              href="/services-courants"
              className="px-3 py-1.5 bg-white border border-[var(--csi-border)] hover:border-[var(--csi-vert-inst)] rounded text-xs font-medium text-[var(--csi-text-primary)] hover:text-[var(--csi-vert-deep)] transition-colors shadow-2xs"
            >
              📋 Ordre de Service Courant
            </Link>
            <Link
              href="/situations"
              className="px-3 py-1.5 bg-white border border-[var(--csi-border)] hover:border-[var(--csi-vert-inst)] rounded text-xs font-medium text-[var(--csi-text-primary)] hover:text-[var(--csi-vert-deep)] transition-colors shadow-2xs"
            >
              ⚔️ Saisir Prise d'Arme
            </Link>
            <Link
              href="/archives"
              className="px-3 py-1.5 bg-white border border-[var(--csi-border)] hover:border-[var(--csi-vert-inst)] rounded text-xs font-medium text-[var(--csi-text-primary)] hover:text-[var(--csi-vert-deep)] transition-colors shadow-2xs"
            >
              🗄️ Classer un Document Numérique / Physique
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  count,
  loading,
  href,
  icon,
}: {
  label: string;
  count?: number;
  loading: boolean;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-lg p-3 hover:border-[var(--csi-vert-inst)] transition-colors shadow-2xs group flex flex-col justify-between"
    >
      <div className="flex items-center justify-between text-xs text-[var(--csi-text-secondary)]">
        <span className="font-medium group-hover:text-[var(--csi-vert-deep)] truncate">
          {label}
        </span>
        <span className="text-sm">{icon}</span>
      </div>
      <div className="mt-2 text-xl font-bold text-[var(--csi-vert-deep)]">
        {loading ? (
          <span className="inline-block w-8 h-5 bg-[var(--csi-bg)] animate-pulse rounded" />
        ) : (
          count ?? 0
        )}
      </div>
    </Link>
  );
}
