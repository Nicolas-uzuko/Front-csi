"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableSkeleton } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { FormField, inputClass, textareaClass } from "@/components/ui/FormField";
import { api } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth/context";
import { ProcesVerbal, ProcesVerbalCreate } from "@/types/api";

const LIMIT = 25;

export default function ProcesVerbauxPage() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<ProcesVerbal[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPv, setSelectedPv] = useState<ProcesVerbal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProcesVerbalCreate>({
    numero_pv: "",
    date_piece: "",
    noms_enqueteurs: "",
    analyse_sommaire: "",
    personne_en_cause: "",
    nature_affaire: "",
    observations: "",
  });

  const loadData = async (offset = skip) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.procesVerbaux.list(offset, LIMIT);
      setItems(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de chargement des procès-verbaux");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData(skip);
    }
  }, [skip, isAdmin]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const s = search.toLowerCase();
    return items.filter(
      (pv) =>
        pv.numero_pv?.toLowerCase().includes(s) ||
        pv.nature_affaire?.toLowerCase().includes(s) ||
        pv.personne_en_cause?.toLowerCase().includes(s) ||
        pv.noms_enqueteurs?.toLowerCase().includes(s)
    );
  }, [items, search]);

  const handleOpenCreate = () => {
    setSelectedPv(null);
    setFormData({
      numero_pv: "",
      date_piece: new Date().toISOString().split("T")[0],
      noms_enqueteurs: "",
      analyse_sommaire: "",
      personne_en_cause: "",
      nature_affaire: "",
      observations: "",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleRowClick = (item: ProcesVerbal) => {
    setSelectedPv(item);
    setFormData({
      numero_pv: item.numero_pv || "",
      date_piece: item.date_piece || "",
      noms_enqueteurs: item.noms_enqueteurs || "",
      analyse_sommaire: item.analyse_sommaire || "",
      personne_en_cause: item.personne_en_cause || "",
      nature_affaire: item.nature_affaire || "",
      observations: item.observations || "",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload: ProcesVerbalCreate = {
        numero_pv: formData.numero_pv || null,
        date_piece: formData.date_piece || null,
        noms_enqueteurs: formData.noms_enqueteurs || null,
        analyse_sommaire: formData.analyse_sommaire || null,
        personne_en_cause: formData.personne_en_cause || null,
        nature_affaire: formData.nature_affaire || null,
        observations: formData.observations || null,
      };

      if (selectedPv) {
        await api.procesVerbaux.update(selectedPv.id_pv, payload);
      } else {
        await api.procesVerbaux.create(payload);
      }

      setIsModalOpen(false);
      loadData(skip);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="p-8 text-center bg-[var(--csi-surface)] border border-red-200 rounded-md">
          <p className="text-sm font-semibold text-red-800">
            ⚠️ Accès Restreint : Registre des Procès-Verbaux
          </p>
          <p className="text-xs text-[var(--csi-text-secondary)] mt-1">
            Ce registre judiciaire est réservé aux Officiers de Police Judiciaire habilités.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      searchTerm={search}
      onSearchChange={setSearch}
      searchPlaceholder="Rechercher par N° PV, nature de l'affaire, enquêteur..."
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--csi-surface)] p-3 border border-[var(--csi-border)] rounded-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--csi-vert-deep)] uppercase tracking-wider">
              Registre des Procès-Verbaux (PV)
            </span>
            <Badge variant="danger">Judiciaire / Sensible</Badge>
            <Badge variant="neutral">{total} PV répertoriés</Badge>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] text-white text-xs font-medium rounded transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <span>＋</span> Enregistrer Procès-Verbal
          </button>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={() => loadData(skip)} />
        ) : isLoading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="Aucun procès-verbal enregistré"
            description="Le registre des procédures judiciaires est actuellement vide."
            action={{ label: "Enregistrer un premier PV", onClick: handleOpenCreate }}
          />
        ) : (
          <div className="space-y-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">N° PV</TableHead>
                  <TableHead className="w-24">Date Pièce</TableHead>
                  <TableHead>Nature de l'Affaire</TableHead>
                  <TableHead>Personne en Cause</TableHead>
                  <TableHead>Enquêteur(s) / OPJ</TableHead>
                  <TableHead>Analyse Sommaire</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {filteredItems.map((pv) => (
                  <TableRow
                    key={pv.id_pv}
                    onClick={() => handleRowClick(pv)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-semibold text-xs text-[var(--csi-vert-deep)]">
                      {pv.numero_pv || `#${pv.id_pv}`}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--csi-text-secondary)]">
                      {pv.date_piece || "-"}
                    </TableCell>
                    <TableCell className="font-medium text-xs text-[var(--csi-text-primary)]">
                      {pv.nature_affaire || "Non qualifiée"}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-red-950">
                      {pv.personne_en_cause || "X"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {pv.noms_enqueteurs || "-"}
                    </TableCell>
                    <TableCell className="text-xs max-w-sm truncate text-[var(--csi-text-secondary)]">
                      {pv.analyse_sommaire || "-"}
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

        <Dialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedPv ? `Procès-Verbal #${selectedPv.id_pv}` : "Enregistrer un Procès-Verbal"}
          description="Fiche réglementaire d'enquête et transmission judiciaire."
          maxWidth="lg"
        >
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Numéro du PV" optional id="numero_pv">
                <input
                  id="numero_pv"
                  type="text"
                  placeholder="Ex: 004/2026/GN"
                  value={formData.numero_pv || ""}
                  onChange={(e) => setFormData({ ...formData, numero_pv: e.target.value })}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Date de la Pièce" optional id="date_piece_pv">
                <input
                  id="date_piece_pv"
                  type="date"
                  value={formData.date_piece || ""}
                  onChange={(e) => setFormData({ ...formData, date_piece: e.target.value })}
                  className={inputClass}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Nature de l'Affaire (Qualification)" optional id="nature_affaire">
                <input
                  id="nature_affaire"
                  type="text"
                  placeholder="Ex: Vol de bœufs (Dahalo), agression..."
                  value={formData.nature_affaire || ""}
                  onChange={(e) => setFormData({ ...formData, nature_affaire: e.target.value })}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Personne en Cause" optional id="personne_cause_pv">
                <input
                  id="personne_cause_pv"
                  type="text"
                  placeholder="Nom(s) ou X"
                  value={formData.personne_en_cause || ""}
                  onChange={(e) => setFormData({ ...formData, personne_en_cause: e.target.value })}
                  className={inputClass}
                />
              </FormField>
            </div>

            <FormField label="Enquêteurs / OPJ" optional id="noms_enqueteurs">
              <input
                id="noms_enqueteurs"
                type="text"
                placeholder="Ex: Adjudant R., Gendarme B."
                value={formData.noms_enqueteurs || ""}
                onChange={(e) => setFormData({ ...formData, noms_enqueteurs: e.target.value })}
                className={inputClass}
              />
            </FormField>

            <FormField label="Analyse Sommaire de l'Enquête" optional id="analyse_pv">
              <textarea
                id="analyse_pv"
                rows={3}
                placeholder="Résumé des constatations et actes accomplis..."
                value={formData.analyse_sommaire || ""}
                onChange={(e) => setFormData({ ...formData, analyse_sommaire: e.target.value })}
                className={textareaClass}
              />
            </FormField>

            <FormField label="Observations / Suites / Transmission Parquet" optional id="obs_pv">
              <input
                id="obs_pv"
                type="text"
                placeholder="Ex: Transmis au Procureur près le TPI de Toliara..."
                value={formData.observations || ""}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                className={inputClass}
              />
            </FormField>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--csi-border)]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-2 border border-[var(--csi-border)] rounded text-xs font-medium hover:bg-[var(--csi-bg)]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] disabled:opacity-50 text-white rounded text-xs font-medium shadow-2xs"
              >
                {isSubmitting ? "Enregistrement..." : selectedPv ? "Mettre à jour" : "Consigner le PV"}
              </button>
            </div>
          </form>
        </Dialog>
      </div>
    </AppShell>
  );
}
