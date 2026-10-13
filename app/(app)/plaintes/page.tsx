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
import { Plainte, PlainteCreate } from "@/types/api";

const LIMIT = 25;

export default function PlaintesPage() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<Plainte[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlainte, setSelectedPlainte] = useState<Plainte | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<PlainteCreate>({
    numero_ordre: "",
    nom_plaignant: "",
    nom_personne_en_cause: "",
    motif_plainte: "",
    lieu_acte: "",
    telephone_plaignant: "",
    observation: "",
  });

  const loadData = async (offset = skip) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.plaintes.list(offset, LIMIT);
      setItems(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de chargement des plaintes");
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
      (p) =>
        p.numero_ordre?.toLowerCase().includes(s) ||
        p.nom_plaignant?.toLowerCase().includes(s) ||
        p.nom_personne_en_cause?.toLowerCase().includes(s) ||
        p.motif_plainte?.toLowerCase().includes(s)
    );
  }, [items, search]);

  const handleOpenCreate = () => {
    setSelectedPlainte(null);
    setFormData({
      numero_ordre: "",
      nom_plaignant: "",
      nom_personne_en_cause: "",
      motif_plainte: "",
      lieu_acte: "Sakaraha",
      telephone_plaignant: "",
      observation: "",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleRowClick = (item: Plainte) => {
    setSelectedPlainte(item);
    setFormData({
      numero_ordre: item.numero_ordre || "",
      nom_plaignant: item.nom_plaignant || "",
      nom_personne_en_cause: item.nom_personne_en_cause || "",
      motif_plainte: item.motif_plainte || "",
      lieu_acte: item.lieu_acte || "",
      telephone_plaignant: item.telephone_plaignant || "",
      observation: item.observation || "",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload: PlainteCreate = {
        numero_ordre: formData.numero_ordre || null,
        nom_plaignant: formData.nom_plaignant || null,
        nom_personne_en_cause: formData.nom_personne_en_cause || null,
        motif_plainte: formData.motif_plainte || null,
        lieu_acte: formData.lieu_acte || null,
        telephone_plaignant: formData.telephone_plaignant || null,
        observation: formData.observation || null,
      };

      if (selectedPlainte) {
        await api.plaintes.update(selectedPlainte.id_plainte, payload);
      } else {
        await api.plaintes.create(payload);
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
            ⚠️ Accès Restreint : Registre des Plaintes
          </p>
          <p className="text-xs text-[var(--csi-text-secondary)] mt-1">
            Ce registre contient des données nominatives sensibles réservées au Commandement et aux Officiers habilités.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      searchTerm={search}
      onSearchChange={setSearch}
      searchPlaceholder="Rechercher par N° ordre, plaignant, mis en cause, motif..."
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--csi-surface)] p-3 border border-[var(--csi-border)] rounded-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--csi-vert-deep)] uppercase tracking-wider">
              Registre des Plaintes & Dénonciations
            </span>
            <Badge variant="danger">Sensible</Badge>
            <Badge variant="neutral">{total} plaintes enregistrées</Badge>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] text-white text-xs font-medium rounded transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <span>＋</span> Enregistrer Plainte
          </button>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={() => loadData(skip)} />
        ) : isLoading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="Aucune plainte répertoriée"
            description="Le registre des plaintes de la brigade est actuellement vierge."
            action={{ label: "Enregistrer une plainte", onClick: handleOpenCreate }}
          />
        ) : (
          <div className="space-y-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">N° Ordre</TableHead>
                  <TableHead>Plaignant(e)</TableHead>
                  <TableHead>Personne mise en cause</TableHead>
                  <TableHead>Motif de la Plainte</TableHead>
                  <TableHead>Lieu des Faits</TableHead>
                  <TableHead className="w-28">Contact</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {filteredItems.map((p) => (
                  <TableRow
                    key={p.id_plainte}
                    onClick={() => handleRowClick(p)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-semibold text-xs text-[var(--csi-vert-deep)]">
                      {p.numero_ordre || `#${p.id_plainte}`}
                    </TableCell>
                    <TableCell className="font-medium text-xs text-[var(--csi-text-primary)]">
                      {p.nom_plaignant || "-"}
                    </TableCell>
                    <TableCell className="text-xs text-red-950 font-medium">
                      {p.nom_personne_en_cause || "X (Inconnu)"}
                    </TableCell>
                    <TableCell className="text-xs max-w-sm truncate">
                      {p.motif_plainte || "-"}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--csi-text-secondary)]">
                      {p.lieu_acte || "-"}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--csi-text-secondary)]">
                      {p.telephone_plaignant || "-"}
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
          title={selectedPlainte ? `Dossier Plainte #${selectedPlainte.id_plainte}` : "Enregistrer une Plainte"}
          description="Renseignement de la fiche de plainte au registre confidentiel."
          maxWidth="lg"
        >
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <FormField label="Numéro d'Ordre" optional id="num_ordre_p">
              <input
                id="num_ordre_p"
                type="text"
                placeholder="Ex: 012/PL-2026"
                value={formData.numero_ordre || ""}
                onChange={(e) => setFormData({ ...formData, numero_ordre: e.target.value })}
                className={inputClass}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Nom du Plaignant" optional id="nom_plaignant">
                <input
                  id="nom_plaignant"
                  type="text"
                  placeholder="Nom complet"
                  value={formData.nom_plaignant || ""}
                  onChange={(e) => setFormData({ ...formData, nom_plaignant: e.target.value })}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Téléphone du Plaignant" optional id="tel_plaignant">
                <input
                  id="tel_plaignant"
                  type="text"
                  placeholder="034..."
                  value={formData.telephone_plaignant || ""}
                  onChange={(e) => setFormData({ ...formData, telephone_plaignant: e.target.value })}
                  className={inputClass}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Personne en Cause (Auteur présumé)" optional id="nom_cause">
                <input
                  id="nom_cause"
                  type="text"
                  placeholder="Nom ou X"
                  value={formData.nom_personne_en_cause || ""}
                  onChange={(e) => setFormData({ ...formData, nom_personne_en_cause: e.target.value })}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Lieu des Faits" optional id="lieu_acte">
                <input
                  id="lieu_acte"
                  type="text"
                  placeholder="Ex: Sakaraha centre"
                  value={formData.lieu_acte || ""}
                  onChange={(e) => setFormData({ ...formData, lieu_acte: e.target.value })}
                  className={inputClass}
                />
              </FormField>
            </div>

            <FormField label="Motif de la Plainte & Circonstances" optional id="motif_plainte">
              <textarea
                id="motif_plainte"
                rows={3}
                placeholder="Description des faits reprochés..."
                value={formData.motif_plainte || ""}
                onChange={(e) => setFormData({ ...formData, motif_plainte: e.target.value })}
                className={textareaClass}
              />
            </FormField>

            <FormField label="Observations / Suites Données" optional id="obs_plainte">
              <input
                id="obs_plainte"
                type="text"
                placeholder="Ex: Transmis pour enquête, conciliation..."
                value={formData.observation || ""}
                onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
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
                {isSubmitting ? "Enregistrement..." : selectedPlainte ? "Mettre à jour" : "Consigner la Plainte"}
              </button>
            </div>
          </form>
        </Dialog>
      </div>
    </AppShell>
  );
}
