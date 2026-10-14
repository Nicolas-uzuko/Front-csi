"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableSkeleton } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { FormField, inputClass, selectClass, textareaClass } from "@/components/ui/FormField";
import { IconTrash, IconPlus } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth/context";
import { CourrierDepart, CourrierDepartCreate } from "@/types/api";

const LIMIT = 25;

export default function CourriersDepartPage() {
  const { isAdmin } = useAuth();
  const { success, error: toastError } = useToast();
  const [items, setItems] = useState<CourrierDepart[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal Création / Édition
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourrier, setSelectedCourrier] = useState<CourrierDepart | null>(null);
  const [courrierToDelete, setCourrierToDelete] = useState<CourrierDepart | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CourrierDepartCreate>({
    categorie: "/2",
    categorie_archive: "A",
    fm: "",
    to: "",
    info: "",
    heure_depart: "",
    priorite: "R",
    indicatif: "",
    reference_message: "",
    objet: "",
    date_piece: "",
    ref: "",
    corps_message: "",
    observation: "",
    signataire: "",
    date_envoi: "",
  });

  const loadData = async (offset = skip, cat = categoryFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.courriersDepart.list(offset, LIMIT, cat || undefined);
      setItems(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de chargement des courriers envoyés");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(skip, categoryFilter);
  }, [skip, categoryFilter]);

  const handleOpenCreate = () => {
    setSelectedCourrier(null);
    const now = new Date();
    const currentHour = now.toTimeString().slice(0, 5); // "HH:MM"
    setFormData({
      categorie: "/2",
      categorie_archive: "A",
      fm: "CSI SAKARAHA",
      to: "",
      info: "",
      heure_depart: currentHour,
      priorite: "R",
      indicatif: "",
      reference_message: "",
      objet: "",
      date_piece: now.toISOString().split("T")[0],
      ref: "",
      corps_message: "",
      observation: "",
      signataire: "",
      date_envoi: now.toISOString().split("T")[0],
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleRowClick = (item: CourrierDepart) => {
    setSelectedCourrier(item);
    setFormData({
      categorie: item.categorie,
      categorie_archive: item.categorie_archive,
      fm: item.fm || "",
      to: item.to || "",
      info: item.info || "",
      heure_depart: item.heure_depart || "",
      priorite: item.priorite || "R",
      indicatif: item.indicatif || "",
      reference_message: item.reference_message || "",
      objet: item.objet || "",
      date_piece: item.date_piece || "",
      ref: item.ref || "",
      corps_message: item.corps_message || "",
      observation: item.observation || "",
      signataire: item.signataire || "",
      date_envoi: item.date_envoi || "",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload: CourrierDepartCreate = {
        ...formData,
        date_piece: formData.date_piece || null,
        date_envoi: formData.date_envoi || null,
        fm: formData.fm || null,
        to: formData.to || null,
        info: formData.info || null,
        heure_depart: formData.heure_depart || null,
        priorite: formData.priorite || null,
        indicatif: formData.indicatif || null,
        reference_message: formData.reference_message || null,
        objet: formData.objet || null,
        ref: formData.ref || null,
        corps_message: formData.corps_message || null,
        observation: formData.observation || null,
        signataire: formData.signataire || null,
      };

      if (selectedCourrier) {
        await api.courriersDepart.update(selectedCourrier.id_courrier, payload);
        success("Courrier mis à jour", `Le courrier départ #${selectedCourrier.id_courrier} a été actualisé.`);
      } else {
        await api.courriersDepart.create(payload);
        success("Courrier expédié enregistré", "Le message départ a été consigné avec succès.");
      }

      setIsModalOpen(false);
      loadData(skip, categoryFilter);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'enregistrement";
      setFormError(msg);
      toastError("Erreur d'enregistrement", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!courrierToDelete) return;
    setIsDeleting(true);
    try {
      await api.courriersDepart.delete(courrierToDelete.id_courrier);
      success("Courrier supprimé", `Le courrier départ #${courrierToDelete.id_courrier} a été supprimé.`);
      setCourrierToDelete(null);
      loadData(skip, categoryFilter);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la suppression";
      toastError("Échec de la suppression", msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const s = search.toLowerCase();
    return items.filter(
      (c) =>
        c.reference_message?.toLowerCase().includes(s) ||
        c.to?.toLowerCase().includes(s) ||
        c.objet?.toLowerCase().includes(s) ||
        c.signataire?.toLowerCase().includes(s) ||
        c.corps_message?.toLowerCase().includes(s)
    );
  }, [items, search]);

  return (
    <AppShell
      searchTerm={search}
      onSearchChange={setSearch}
      searchPlaceholder="Rechercher par référence, destinataire (TO), objet, signataire..."
    >
      <div className="space-y-4">
        {/* Barre d'outils */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--csi-surface)] p-3 border border-[var(--csi-border)] rounded-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--csi-vert-deep)] uppercase tracking-wider">
              Courriers Départ
            </span>
            <Badge variant="neutral">{total} enregistrés</Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Filtre de catégorie (/2 ou /4) */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setSkip(0);
              }}
              className="text-xs bg-[var(--csi-bg)] border border-[var(--csi-border)] rounded px-2.5 py-1.5 focus:outline-none"
            >
              <option value="">Toutes les catégories</option>
              <option value="/2">Catégorie /2 (Ordinaire émis)</option>
              <option value="/4">Catégorie /4 (Confidentiel émis)</option>
            </select>

            <button
              onClick={handleOpenCreate}
              className="px-3 py-1.5 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] text-white text-xs font-medium rounded transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <span>＋</span> Émettre un Courrier
            </button>
          </div>
        </div>

        {/* Tableau */}
        {error ? (
          <ErrorState message={error} onRetry={() => loadData(skip, categoryFilter)} />
        ) : isLoading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="Aucun courrier envoyé trouvé"
            description={
              search
                ? "Aucun résultat ne correspond à votre recherche."
                : "Aucun courrier n'a encore été consigné dans ce registre d'expédition."
            }
            action={!search ? { label: "Émettre un premier courrier", onClick: handleOpenCreate } : undefined}
          />
        ) : (
          <div className="space-y-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Réf. Message</TableHead>
                  <TableHead className="w-20">Cat.</TableHead>
                  <TableHead className="w-24">Date Envoi</TableHead>
                  <TableHead>Destinataire (TO)</TableHead>
                  <TableHead>Objet / Message Radio</TableHead>
                  <TableHead className="w-32">Signataire</TableHead>
                  <TableHead className="w-20 text-center">Archive</TableHead>
                  <TableHead className="w-16 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {filteredItems.map((item) => (
                  <TableRow
                    key={item.id_courrier}
                    onClick={() => handleRowClick(item)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-semibold text-xs text-[var(--csi-vert-deep)]">
                      {item.reference_message || `#${item.id_courrier}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.categorie === "/4" ? "danger" : "default"}>
                        {item.categorie}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-[var(--csi-text-secondary)]">
                      {item.date_envoi || item.date_piece || "-"}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {item.to || "Non renseigné"}
                      {item.info && (
                        <div className="text-[10px] text-[var(--csi-text-secondary)]">
                          Info: {item.info}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs max-w-md">
                      <div className="truncate text-[var(--csi-text-primary)] font-medium">
                        {item.objet || item.corps_message || "Sans objet"}
                      </div>
                      {item.indicatif && (
                        <span className="text-[10px] text-[var(--csi-text-secondary)]">
                          HVRC: {item.indicatif} {item.heure_depart ? `• HD: ${item.heure_depart}` : ""}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {item.signataire || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={item.categorie_archive === "B" ? "warning" : "neutral"}>
                        Cat. {item.categorie_archive}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      {isAdmin && (
                        <button
                          onClick={() => setCourrierToDelete(item)}
                          className="p-1.5 text-[var(--csi-text-secondary)] hover:text-[var(--csi-danger)] hover:bg-[var(--csi-danger-soft)]/50 rounded-full transition-colors"
                          title="Supprimer ce courrier"
                        >
                          <IconTrash size={13} />
                        </button>
                      )}
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

        {/* Modal Création / Édition */}
        <Dialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedCourrier ? `Fiche Courrier Expédié #${selectedCourrier.id_courrier}` : "Émettre un Courrier Départ"}
          description="Enregistrement dans le registre de départ du CSI Sakaraha."
          maxWidth="2xl"
        >
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[var(--csi-vert-light)]/40 rounded border border-[var(--csi-border-subtle)]">
              <FormField label="Catégorie Courrier" id="categorie">
                <select
                  id="categorie"
                  value={formData.categorie}
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                  className={selectClass}
                  required
                >
                  <option value="/2">/2 (Courrier Ordinaire Expédié)</option>
                  <option value="/4">/4 (Courrier Confidentiel Expédié)</option>
                </select>
              </FormField>

              <FormField label="Catégorie d'Archive" id="categorie_archive">
                <select
                  id="categorie_archive"
                  value={formData.categorie_archive}
                  onChange={(e) => setFormData({ ...formData, categorie_archive: e.target.value as "A" | "B" })}
                  className={selectClass}
                  required
                >
                  <option value="A">Catégorie A (Non Confidentiel)</option>
                  <option value="B">Catégorie B (Confidentiel / Réservé)</option>
                </select>
              </FormField>
            </div>

            <div className="border border-[var(--csi-border-subtle)] rounded p-3 space-y-3">
              <div className="font-semibold text-[11px] text-[var(--csi-vert-deep)] uppercase tracking-wider">
                Acheminement & En-tête Radio
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField label="Heure Départ (HD)" optional id="heure_depart">
                  <div className="flex items-center gap-1.5">
                    <input
                      id="heure_depart"
                      type="time"
                      value={formData.heure_depart || ""}
                      onChange={(e) => setFormData({ ...formData, heure_depart: e.target.value })}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const nowTime = new Date().toTimeString().slice(0, 5);
                        setFormData({ ...formData, heure_depart: nowTime });
                      }}
                      className="px-2.5 py-2 text-[11px] bg-[var(--csi-bg)] border border-[var(--csi-border)] rounded-md hover:bg-[var(--csi-vert-soft)] text-[var(--csi-vert-deep)] whitespace-nowrap font-medium transition-colors"
                      title="Régler sur l'heure actuelle"
                    >
                      Actuelle
                    </button>
                  </div>
                </FormField>

                <FormField label="Priorité" optional id="priorite">
                  <select
                    id="priorite"
                    value={formData.priorite || "R"}
                    onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
                    className={selectClass}
                  >
                    <option value="R">R (Routine)</option>
                    <option value="U">U (Urgent)</option>
                    <option value="P">P (Priorité)</option>
                  </select>
                </FormField>

                <FormField label="Indicatif HVRC" optional id="indicatif">
                  <input
                    id="indicatif"
                    type="text"
                    value={formData.indicatif || ""}
                    onChange={(e) => setFormData({ ...formData, indicatif: e.target.value })}
                    className={inputClass}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField label="Émetteur (FM)" optional id="fm">
                  <input
                    id="fm"
                    type="text"
                    value={formData.fm || ""}
                    onChange={(e) => setFormData({ ...formData, fm: e.target.value })}
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Destinataire (TO)" optional id="to">
                  <input
                    id="to"
                    type="text"
                    placeholder="Ex: CIE TOLIARA"
                    value={formData.to || ""}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Information (INFO)" optional id="info">
                  <input
                    id="info"
                    type="text"
                    value={formData.info || ""}
                    onChange={(e) => setFormData({ ...formData, info: e.target.value })}
                    className={inputClass}
                  />
                </FormField>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label="Référence Message" optional id="reference_message">
                <input
                  id="reference_message"
                  type="text"
                  placeholder="Ex: 088/CSI-SKR"
                  value={formData.reference_message || ""}
                  onChange={(e) => setFormData({ ...formData, reference_message: e.target.value })}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Date de la Pièce" optional id="date_piece">
                <input
                  id="date_piece"
                  type="date"
                  value={formData.date_piece || ""}
                  onChange={(e) => setFormData({ ...formData, date_piece: e.target.value })}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Date d'Envoi" optional id="date_envoi">
                <input
                  id="date_envoi"
                  type="date"
                  value={formData.date_envoi || ""}
                  onChange={(e) => setFormData({ ...formData, date_envoi: e.target.value })}
                  className={inputClass}
                />
              </FormField>
            </div>

            <FormField label="Objet du Message" optional id="objet">
              <input
                id="objet"
                type="text"
                placeholder="Objet de la correspondance émise..."
                value={formData.objet || ""}
                onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                className={inputClass}
              />
            </FormField>

            <FormField label="Corps du Message Radio" optional id="corps_message">
              <textarea
                id="corps_message"
                rows={3}
                placeholder="Texte intégral ou transcription radio..."
                value={formData.corps_message || ""}
                onChange={(e) => setFormData({ ...formData, corps_message: e.target.value })}
                className={textareaClass}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Signataire" optional id="signataire">
                <input
                  id="signataire"
                  type="text"
                  placeholder="Ex: Capitaine Commandant de Brigade"
                  value={formData.signataire || ""}
                  onChange={(e) => setFormData({ ...formData, signataire: e.target.value })}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Observations" optional id="observation">
                <input
                  id="observation"
                  type="text"
                  value={formData.observation || ""}
                  onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                  className={inputClass}
                />
              </FormField>
            </div>

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
                {isSubmitting ? "Enregistrement..." : selectedCourrier ? "Mettre à jour" : "Consigner le départ"}
              </button>
            </div>
          </form>
        </Dialog>

        {/* Modal Confirmation de suppression */}
        <ConfirmDialog
          isOpen={!!courrierToDelete}
          onClose={() => setCourrierToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Suppression d'un courrier départ"
          description={`Êtes-vous certain de vouloir supprimer le message départ #${courrierToDelete?.id_courrier} (${courrierToDelete?.reference_message || "Sans référence"}) ? Cette action est irréversible.`}
          confirmLabel="Supprimer définitivement"
          cancelLabel="Annuler"
          variant="danger"
          isLoading={isDeleting}
        />
      </div>
    </AppShell>
  );
}
