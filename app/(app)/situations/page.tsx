"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableSkeleton } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { FormField, inputClass, textareaClass } from "@/components/ui/FormField";
import { api } from "@/lib/api/endpoints";
import { SituationPriseArme, SituationPriseArmeCreate } from "@/types/api";

const LIMIT = 25;

export default function SituationsPage() {
  const [items, setItems] = useState<SituationPriseArme[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SituationPriseArme | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<SituationPriseArmeCreate>({
    effectif_realise: undefined,
    absent: undefined,
    present: undefined,
    indisponible: undefined,
    sur_le_rang: undefined,
    motif_absent: "",
    motif_indisponible: "",
    date_situation: "",
  });

  const loadData = async (offset = skip) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.situations.list(offset, LIMIT);
      setItems(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de chargement des situations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function fetchSituations() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.situations.list(skip, LIMIT);
        if (!ignore) {
          setItems(res.items);
          setTotal(res.total);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Erreur de chargement des situations");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchSituations();

    return () => {
      ignore = true;
    };
  }, [skip]);

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setFormData({
      effectif_realise: undefined,
      absent: undefined,
      present: undefined,
      indisponible: undefined,
      sur_le_rang: undefined,
      motif_absent: "",
      motif_indisponible: "",
      date_situation: new Date().toISOString().slice(0, 16),
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleRowClick = (item: SituationPriseArme) => {
    setSelectedItem(item);
    setFormData({
      effectif_realise: item.effectif_realise ?? undefined,
      absent: item.absent ?? undefined,
      present: item.present ?? undefined,
      indisponible: item.indisponible ?? undefined,
      sur_le_rang: item.sur_le_rang ?? undefined,
      motif_absent: item.motif_absent || "",
      motif_indisponible: item.motif_indisponible || "",
      date_situation: item.date_situation ? item.date_situation.slice(0, 16) : "",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload: SituationPriseArmeCreate = {
        effectif_realise: Number(formData.effectif_realise) || 0,
        absent: Number(formData.absent) || 0,
        present: Number(formData.present) || 0,
        indisponible: Number(formData.indisponible) || 0,
        sur_le_rang: Number(formData.sur_le_rang) || 0,
        motif_absent: formData.motif_absent || null,
        motif_indisponible: formData.motif_indisponible || null,
        date_situation: formData.date_situation ? new Date(formData.date_situation).toISOString() : null,
      };

      if (selectedItem) {
        await api.situations.update(selectedItem.id_situation, payload);
      } else {
        await api.situations.create(payload);
      }

      setIsModalOpen(false);
      loadData(skip);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--csi-surface)] p-3 border border-[var(--csi-border)] rounded-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--csi-vert-deep)] uppercase tracking-wider">
              Situation de Prise d&apos;Arme
            </span>
            <Badge variant="neutral">{total} états enregistrés</Badge>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] text-white text-xs font-medium rounded transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <span>＋</span> Établir Situation de prise d&apos;Arme
          </button>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={() => loadData(skip)} />
        ) : isLoading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Aucune situation consignée"
            description="Le registre des effectifs et situations d'armes de la prise d'armes est vide."
            action={{ label: "Établir une première situation", onClick: handleOpenCreate }}
          />
        ) : (
          <div className="space-y-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Date Situation</TableHead>
                  <TableHead className="text-center w-20">Réalisé</TableHead>
                  <TableHead className="text-center w-20">Présents</TableHead>
                  <TableHead className="text-center w-20">Sur le Rang</TableHead>
                  <TableHead className="text-center w-20">Absents</TableHead>
                  <TableHead className="text-center w-20">Indisponibles</TableHead>
                  <TableHead>Motifs & Justifications</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {items.map((item) => (
                  <TableRow
                    key={item.id_situation}
                    onClick={() => handleRowClick(item)}
                    className="cursor-pointer"
                  >
                    <TableCell className="text-xs font-medium text-[var(--csi-vert-deep)]">
                      {item.date_situation ? new Date(item.date_situation).toLocaleDateString("fr-FR", { dateStyle: "medium" }) : `#${item.id_situation}`}
                    </TableCell>
                    <TableCell className="text-center font-bold text-xs">
                      {item.effectif_realise ?? "-"}
                    </TableCell>
                    <TableCell className="text-center font-bold text-xs text-emerald-800">
                      {item.present ?? "-"}
                    </TableCell>
                    <TableCell className="text-center font-medium text-xs">
                      {item.sur_le_rang ?? "-"}
                    </TableCell>
                    <TableCell className="text-center text-xs text-amber-800 font-semibold">
                      {item.absent ?? "-"}
                    </TableCell>
                    <TableCell className="text-center text-xs text-red-800 font-semibold">
                      {item.indisponible ?? "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {item.motif_absent && (
                        <div>
                          <span className="font-semibold text-amber-800">Abs:</span> {item.motif_absent}
                        </div>
                      )}
                      {item.motif_indisponible && (
                        <div className="text-[10px] text-[var(--csi-text-secondary)]">
                          <span className="font-semibold text-red-800">Indisp:</span> {item.motif_indisponible}
                        </div>
                      )}
                      {!item.motif_absent && !item.motif_indisponible && "-"}
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
          title={selectedItem ? `Situation d'Arme #${selectedItem.id_situation}` : "Établir la Situation de Prise d'Arme"}
          description="Contrôle des effectifs réalisés, présents et sur le rang."
          maxWidth="md"
        >
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <FormField label="Date & Heure de la Situation" id="date_situation">
              <input
                id="date_situation"
                type="datetime-local"
                value={formData.date_situation || ""}
                onChange={(e) => setFormData({ ...formData, date_situation: e.target.value })}
                className={inputClass}
                required
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3 p-3 bg-[var(--csi-vert-light)]/40 rounded border border-[var(--csi-border-subtle)]">
              <FormField label="Effectif Réalisé" id="effectif_realise">
                <input
                  id="effectif_realise"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.effectif_realise ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      effectif_realise: e.target.value === "" ? undefined : parseInt(e.target.value, 10),
                    })
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Présents" id="present">
                <input
                  id="present"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.present ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      present: e.target.value === "" ? undefined : parseInt(e.target.value, 10),
                    })
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Sur le Rang" id="sur_le_rang">
                <input
                  id="sur_le_rang"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.sur_le_rang ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sur_le_rang: e.target.value === "" ? undefined : parseInt(e.target.value, 10),
                    })
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Absents" id="absent">
                <input
                  id="absent"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.absent ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      absent: e.target.value === "" ? undefined : parseInt(e.target.value, 10),
                    })
                  }
                  className={inputClass}
                />
              </FormField>
            </div>

            <FormField label="Indisponibles" id="indisponible">
              <input
                id="indisponible"
                type="number"
                min="0"
                placeholder="0"
                value={formData.indisponible ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    indisponible: e.target.value === "" ? undefined : parseInt(e.target.value, 10),
                  })
                }
                className={inputClass}
              />
            </FormField>

            <FormField label="Motif d'Absence" optional id="motif_absent">
              <input
                id="motif_absent"
                type="text"
                placeholder="Ex: Permission, mission extérieure..."
                value={formData.motif_absent || ""}
                onChange={(e) => setFormData({ ...formData, motif_absent: e.target.value })}
                className={inputClass}
              />
            </FormField>

            <FormField label="Motif d'Indisponibilité" optional id="motif_indisponible">
              <textarea
                id="motif_indisponible"
                rows={2}
                placeholder="Ex: Maladie, repos médical..."
                value={formData.motif_indisponible || ""}
                onChange={(e) => setFormData({ ...formData, motif_indisponible: e.target.value })}
                className={textareaClass}
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
                {isSubmitting ? "Enregistrement..." : selectedItem ? "Mettre à jour" : "Valider la situation"}
              </button>
            </div>
          </form>
        </Dialog>
      </div>
    </AppShell>
  );
}
