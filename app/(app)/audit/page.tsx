"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableSkeleton } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth/context";
import { HistoriqueAction } from "@/types/api";

const LIMIT = 50;

export default function AuditPage() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<HistoriqueAction[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [tableFilter, setTableFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (offset = skip, act = actionFilter, tbl = tableFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.audit.list(offset, LIMIT, act || undefined, tbl || undefined);
      setItems(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de chargement du journal d'audit");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData(skip, actionFilter, tableFilter);
    }
  }, [skip, actionFilter, tableFilter, isAdmin]);

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="p-8 text-center bg-[var(--csi-surface)] border border-red-200 rounded-md">
          <p className="text-sm font-semibold text-red-800">
            ⚠️ Accès Restreint : Journal d'Audit & Sécurité
          </p>
          <p className="text-xs text-[var(--csi-text-secondary)] mt-1">
            Seul l'administrateur système peut inspecter l'historique chronologique des actions.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--csi-surface)] p-3 border border-[var(--csi-border)] rounded-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--csi-vert-deep)] uppercase tracking-wider">
              Journal d'Audit Immuable
            </span>
            <Badge variant="neutral">{total} événements journalisés</Badge>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setSkip(0);
              }}
              className="text-xs bg-[var(--csi-bg)] border border-[var(--csi-border)] rounded px-2.5 py-1.5 focus:outline-none"
            >
              <option value="">Toutes les Actions</option>
              <option value="CONNEXION">CONNEXION</option>
              <option value="CONSULTATION">CONSULTATION</option>
              <option value="CREATION">CREATION</option>
              <option value="MODIFICATION">MODIFICATION</option>
              <option value="SUPPRESSION">SUPPRESSION</option>
              <option value="TELECHARGEMENT">TELECHARGEMENT</option>
            </select>

            <select
              value={tableFilter}
              onChange={(e) => {
                setTableFilter(e.target.value);
                setSkip(0);
              }}
              className="text-xs bg-[var(--csi-bg)] border border-[var(--csi-border)] rounded px-2.5 py-1.5 focus:outline-none"
            >
              <option value="">Toutes les Tables Cibles</option>
              <option value="courriers_arrivee">courriers_arrivee</option>
              <option value="courriers_depart">courriers_depart</option>
              <option value="plaintes">plaintes</option>
              <option value="proces_verbaux">proces_verbaux</option>
              <option value="documents">documents</option>
              <option value="utilisateurs">utilisateurs</option>
            </select>
          </div>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={() => loadData(skip, actionFilter, tableFilter)} />
        ) : isLoading ? (
          <TableSkeleton rows={10} cols={6} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Aucune action consignée"
            description="Le journal d'audit ne contient aucun événement pour les filtres sélectionnés."
          />
        ) : (
          <div className="space-y-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-36">Horodatage</TableHead>
                  <TableHead className="w-28">Action</TableHead>
                  <TableHead>Opérateur (Agent)</TableHead>
                  <TableHead>Registre Cible / ID</TableHead>
                  <TableHead className="w-24">Adresse IP</TableHead>
                  <TableHead className="w-20 text-center">Résultat</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {items.map((log) => (
                  <TableRow key={log.id_historique}>
                    <TableCell className="text-xs font-mono text-[var(--csi-text-secondary)] whitespace-nowrap">
                      {new Date(log.date_action).toLocaleString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.action.includes("SUPPRESSION")
                            ? "danger"
                            : log.action.includes("MODIF") || log.action.includes("CREA")
                            ? "warning"
                            : "default"
                        }
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-[var(--csi-text-primary)]">
                      {log.identifiant_utilisateur || "Système / Anonyme"}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-[var(--csi-text-secondary)]">
                      {log.table_cible || "-"} {log.id_enregistrement_cible ? `(#${log.id_enregistrement_cible})` : ""}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-[var(--csi-text-secondary)]">
                      {log.adresse_ip || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={log.succes !== false ? "success" : "danger"}>
                        {log.succes !== false ? "Succès" : "Échec"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>

            <Pagination
              total={total}
              skip={skip}
              limit={LIMIT}
              onPageChange={(newSkip) => setSkip(newSkip)}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
