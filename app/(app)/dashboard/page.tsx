"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth/context";
import { api } from "@/lib/api/endpoints";
import { Badge } from "@/components/ui/Badge";
import {
  IconChart,
  IconInbox,
  IconOutbox,
  IconClipboard,
  IconSword,
  IconArchive,
  IconScale,
  IconScroll,
} from "@/components/ui/Icons";
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
        {/* En-tête de bienvenue contextuelle avec Logo */}
        <div className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center cursor-pointer logo-spin-hover" title="CSI Sakaraha">
              <Image
                src="/logo.png"
                alt="Logo CSI Sakaraha"
                width={48}
                height={48}
                className="object-contain w-full h-full drop-shadow-sm"
              />
            </div>
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
          </div>
          <div className="text-right flex items-center gap-2 self-end sm:self-center">
            <span className="text-xs font-medium text-[var(--csi-text-secondary)]">
              Statut :
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
            icon={<IconInbox size={16} />}
          />
          <StatCard
            label="Courriers Envoyés"
            count={stats?.courriersDepart}
            loading={isLoading}
            href="/courriers/depart"
            icon={<IconOutbox size={16} />}
          />
          <StatCard
            label="Services Courants"
            count={stats?.servicesCourants}
            loading={isLoading}
            href="/services-courants"
            icon={<IconClipboard size={16} />}
          />
          <StatCard
            label="Prises d'Arme"
            count={stats?.situations}
            loading={isLoading}
            href="/situations"
            icon={<IconSword size={16} />}
          />
          <StatCard
            label="Pièces Archivées"
            count={stats?.documents}
            loading={isLoading}
            href="/archives"
            icon={<IconArchive size={16} />}
          />
          {isAdmin && (
            <>
              <StatCard
                label="Plaintes (Sensible)"
                count={stats?.plaintes}
                loading={isLoading}
                href="/plaintes"
                icon={<IconScale size={16} />}
              />
              <StatCard
                label="Procès-Verbaux"
                count={stats?.procesVerbaux}
                loading={isLoading}
                href="/proces-verbaux"
                icon={<IconScroll size={16} />}
              />
            </>
          )}
        </div>


        {/* Section 2 colonnes : Derniers courriers reçus / envoyés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Courriers reçus récents */}
          <div className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--csi-border)] mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--csi-vert-deep)] flex items-center gap-2">
                <span className="text-[var(--csi-text-secondary)]"><IconInbox size={14} /></span>
                Derniers Courriers Arrivée
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
                  <div key={n} className="h-10 bg-[var(--csi-bg)] animate-pulse rounded-lg" />
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
                    className="py-2.5 px-2 -mx-2 flex items-center justify-between hover:bg-[var(--csi-vert-light)] rounded-lg transition-colors group"
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
          <div className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--csi-border)] mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--csi-vert-deep)] flex items-center gap-2">
                <span className="text-[var(--csi-text-secondary)]"><IconOutbox size={14} /></span>
                Derniers Courriers Départ
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
                  <div key={n} className="h-10 bg-[var(--csi-bg)] animate-pulse rounded-lg" />
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
                    className="py-2.5 px-2 -mx-2 flex items-center justify-between hover:bg-[var(--csi-vert-light)] rounded-lg transition-colors group"
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
        <div className="bg-[var(--csi-vert-soft)]/50 border border-[var(--csi-border)] rounded-2xl p-4">
          <h3 className="text-xs font-bold text-[var(--csi-vert-deep)] uppercase tracking-wider mb-3">
            Procédures Rapides
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/courriers/arrivee"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[var(--csi-border)] hover:border-[var(--csi-vert-inst)] rounded-full text-xs font-medium text-[var(--csi-text-primary)] hover:text-[var(--csi-vert-deep)] transition-colors shadow-sm"
            >
              <IconInbox size={13} /> Enregistrer Courrier Reçu
            </Link>
            <Link
              href="/courriers/depart"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[var(--csi-border)] hover:border-[var(--csi-vert-inst)] rounded-full text-xs font-medium text-[var(--csi-text-primary)] hover:text-[var(--csi-vert-deep)] transition-colors shadow-sm"
            >
              <IconOutbox size={13} /> Enregistrer Message Départ
            </Link>
            <Link
              href="/services-courants"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[var(--csi-border)] hover:border-[var(--csi-vert-inst)] rounded-full text-xs font-medium text-[var(--csi-text-primary)] hover:text-[var(--csi-vert-deep)] transition-colors shadow-sm"
            >
              <IconClipboard size={13} /> Ordre de Service Courant
            </Link>
            <Link
              href="/situations"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[var(--csi-border)] hover:border-[var(--csi-vert-inst)] rounded-full text-xs font-medium text-[var(--csi-text-primary)] hover:text-[var(--csi-vert-deep)] transition-colors shadow-sm"
            >
              <IconSword size={13} /> Saisir Prise d'Arme
            </Link>
            <Link
              href="/archives"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[var(--csi-border)] hover:border-[var(--csi-vert-inst)] rounded-full text-xs font-medium text-[var(--csi-text-primary)] hover:text-[var(--csi-vert-deep)] transition-colors shadow-sm"
            >
              <IconArchive size={13} /> Classer un Document
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
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl p-4 hover:border-[var(--csi-vert-inst)] transition-colors shadow-sm group flex flex-col justify-between gap-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--csi-text-secondary)] group-hover:text-[var(--csi-vert-deep)] truncate leading-tight">
          {label}
        </span>
        <span className="text-[var(--csi-text-secondary)] group-hover:text-[var(--csi-vert-deep)] flex-shrink-0 transition-colors">
          {icon}
        </span>
      </div>
      <div className="text-2xl font-bold text-[var(--csi-vert-deep)]">
        {loading ? (
          <span className="inline-block w-10 h-6 bg-[var(--csi-bg)] animate-pulse rounded-lg" />
        ) : (
          count ?? 0
        )}
      </div>
    </Link>
  );
}

