"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableSkeleton } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { FormField, inputClass, selectClass } from "@/components/ui/FormField";
import { IconArchive, IconUpload, IconBox, IconDownload, IconLock, IconRefresh, IconTrash } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth/context";
import {
  DocumentArchive,
  DocumentPhysicalCreate,
  TYPES_DOCUMENTS_CAT_A,
  TYPES_DOCUMENTS_CAT_B,
  CATEGORIES_ARCHIVE,
  archiveTypeLabel,
  CategorieArchive,
  TypeConfidentialite,
} from "@/types/api";

const LIMIT = 25;


// ── Types disponibles par catégorie ───────────────────────────────────────────
const TYPE_OPTIONS: Record<CategorieArchive, readonly string[]> = {
  A: TYPES_DOCUMENTS_CAT_A,
  B: TYPES_DOCUMENTS_CAT_B,
};

// ── Confidentialité déduite automatiquement ───────────────────────────────────
function confidentialiteFromCategorie(cat: CategorieArchive): TypeConfidentialite {
  return cat === "A" ? "NON_CONFIDENTIEL" : "CONFIDENTIEL";
}

// ── Libellé condensé pour le badge catégorie ─────────────────────────────────
const CAT_BADGE_LABEL: Record<CategorieArchive, string> = {
  A: "Cat. A — Non confidentiel",
  B: "Cat. B — Confidentiel",
};

// ─────────────────────────────────────────────────────────────────────────────
export default function ArchivesPage() {
  const { isAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  // ── Données de la liste ───────────────────────────────────────────────────
  const [items, setItems] = useState<DocumentArchive[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [catFilter, setCatFilter] = useState<CategorieArchive | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── États modals ──────────────────────────────────────────────────────────
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPhysicalModalOpen, setIsPhysicalModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<DocumentArchive | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  // ── Formulaire Document Physique ──────────────────────────────────────────
  const [physCat, setPhysCat] = useState<CategorieArchive | "">("");
  const [physType, setPhysType] = useState<string>("");
  const [physEmplacement, setPhysEmplacement] = useState<string>("");

  // ── Formulaire Upload Fichier Numérique ───────────────────────────────────
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCat, setUploadCat] = useState<CategorieArchive | "">("");
  const [uploadType, setUploadType] = useState<string>("");
  const [uploadMode, setUploadMode] = useState<"NUMERIQUE" | "MIXTE">("NUMERIQUE");
  const [uploadEmplacement, setUploadEmplacement] = useState<string>("");

  // ── Chargement des données ────────────────────────────────────────────────
  const loadData = async (offset = skip, cat = catFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.documents.list(offset, LIMIT, cat || undefined);
      setItems(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de chargement des archives");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(skip, catFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, catFilter]);

  // ── Réinitialisation formulaire physique ──────────────────────────────────
  const openPhysicalModal = () => {
    setPhysCat("");
    setPhysType("");
    setPhysEmplacement("");
    setFormError(null);
    setIsPhysicalModalOpen(true);
  };

  // ── Réinitialisation formulaire upload ────────────────────────────────────
  const openUploadModal = () => {
    setUploadCat("");
    setUploadType("");
    setUploadMode("NUMERIQUE");
    setUploadEmplacement("");
    setUploadFile(null);
    setFormError(null);
    setIsUploadModalOpen(true);
  };

  // ── Gestion du changement de catégorie (physique) ────────────────────────
  const handlePhysCatChange = (cat: CategorieArchive | "") => {
    setPhysCat(cat);
    setPhysType(""); // toujours réinitialiser le type
  };

  // ── Gestion du changement de catégorie (upload) ───────────────────────────
  const handleUploadCatChange = (cat: CategorieArchive | "") => {
    setUploadCat(cat);
    setUploadType(""); // toujours réinitialiser le type
  };

  // ── Téléchargement ────────────────────────────────────────────────────────
  const handleDownload = async (doc: DocumentArchive) => {
    if (doc.mode_conservation === "PHYSIQUE") return;
    setDownloadingId(doc.id_document);
    try {
      const { blob, filename } = await api.documents.downloadBlob(doc.id_document);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Erreur lors du téléchargement : " + (err instanceof Error ? err.message : "Erreur inconnue"));
    } finally {
      setDownloadingId(null);
    }
  };

  // ── Soumission document physique ──────────────────────────────────────────
  const handlePhysicalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!physCat || !physType) {
      setFormError("Veuillez sélectionner une catégorie et un type de document.");
      return;
    }
    const payload: DocumentPhysicalCreate = {
      categorie_archive: physCat,
      type_document: physType,
      confidentialite: confidentialiteFromCategorie(physCat),
      mode_conservation: "PHYSIQUE",
      emplacement_physique: physEmplacement,
    };
    setIsSubmitting(true);
    setFormError(null);
    try {
      await api.documents.createPhysical(payload);
      setIsPhysicalModalOpen(false);
      success("Cotation physique enregistrée", "Le document a été classé avec succès dans le rayon.");
      loadData(skip, catFilter);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors du classement";
      setFormError(msg);
      toastError("Échec de l'enregistrement", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Soumission upload numérique ───────────────────────────────────────────
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadCat) {
      setFormError("Veuillez sélectionner une catégorie d'archive.");
      return;
    }
    if (!uploadType) {
      setFormError("Veuillez sélectionner un type de document réglementaire.");
      return;
    }
    if (!uploadFile) {
      setFormError("Veuillez sélectionner un fichier à importer.");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("categorie_archive", uploadCat);
      formData.append("type_document", uploadType);
      formData.append("confidentialite", confidentialiteFromCategorie(uploadCat));
      formData.append("mode_conservation", uploadMode);
      if (uploadMode === "MIXTE" && uploadEmplacement) {
        formData.append("emplacement_physique", uploadEmplacement);
      }
      await api.documents.upload(formData);
      setIsUploadModalOpen(false);
      success("Fichier téléversé et classé", `Le document a été archivé en Catégorie ${uploadCat}.`);
      loadData(skip, catFilter);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'import";
      setFormError(msg);
      toastError("Échec de l'importation", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Suppression avec confirmation ─────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      await api.documents.delete(docToDelete.id_document);
      success("Document supprimé", `La pièce #${docToDelete.id_document} a été retirée du fond d'archives.`);
      setDocToDelete(null);
      loadData(skip, catFilter);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la suppression";
      toastError("Échec de la suppression", msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <AppShell>
      <div className="space-y-4">

        {/* ── Barre d'outils ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--csi-surface)] px-4 py-3 border border-[var(--csi-border)] rounded-2xl">
          {/* Titre + total */}
          <div className="flex items-center gap-2.5">
            <span className="text-[var(--csi-text-secondary)]">
              <IconArchive size={18} />
            </span>
            <div>
              <h1 className="text-sm font-bold text-[var(--csi-vert-deep)] leading-tight">
                Archives &amp; Pièces
              </h1>
              <p className="text-[11px] text-[var(--csi-text-secondary)] leading-tight">
                {isLoading ? "Chargement…" : `${total} pièce${total !== 1 ? "s" : ""} cotée${total !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          {/* Filtre catégorie + boutons d'action */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filtre catégorie */}
            <select
              value={catFilter}
              onChange={(e) => {
                setCatFilter(e.target.value as CategorieArchive | "");
                setSkip(0);
              }}
              className="text-xs bg-[var(--csi-bg)] border border-[var(--csi-border)] rounded-full px-3 py-1.5 focus:outline-none focus:border-[var(--csi-vert-inst)] transition-colors cursor-pointer"
            >
              <option value="">Toutes les catégories</option>
              <option value="A">Catégorie A — Non confidentielles</option>
              {isAdmin && <option value="B">Catégorie B — Confidentielles</option>}
            </select>

            {/* Recharger */}
            <button
              onClick={() => loadData(skip, catFilter)}
              title="Actualiser"
              className="p-1.5 text-[var(--csi-text-secondary)] hover:text-[var(--csi-vert-deep)] hover:bg-[var(--csi-bg)] rounded-full border border-transparent hover:border-[var(--csi-border)] transition-colors"
            >
              <IconRefresh size={15} />
            </button>

            {/* Cotation physique */}
            <button
              onClick={openPhysicalModal}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--csi-border)] hover:bg-[var(--csi-bg)] hover:border-[var(--csi-vert-inst)] text-[var(--csi-text-primary)] text-xs font-medium rounded-full transition-colors"
            >
              <IconBox size={14} />
              Cotation Physique
            </button>

            {/* Import numérique */}
            <button
              onClick={openUploadModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] text-white text-xs font-medium rounded-full transition-colors shadow-sm"
            >
              <IconUpload size={14} />
              Importer Fichier
            </button>
          </div>
        </div>

        {/* ── Tableau des archives ──────────────────────────────────────── */}
        {error ? (
          <ErrorState message={error} onRetry={() => loadData(skip, catFilter)} />
        ) : isLoading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Aucun document classé"
            description="Le fond d'archives ne contient aucune pièce dans cette catégorie."
            action={{ label: "Importer un document", onClick: openUploadModal }}
          />
        ) : (
          <div className="space-y-0 bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">N° ID</TableHead>
                  <TableHead className="w-36">Catégorie</TableHead>
                  <TableHead>Type Document Réglementaire</TableHead>
                  <TableHead className="w-36">Conservation</TableHead>
                  <TableHead>Fichier / Emplacement</TableHead>
                  <TableHead className="w-28">Date Import</TableHead>
                  <TableHead className="w-24 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {items.map((doc) => (
                  <TableRow key={doc.id_document}>
                    <TableCell className="font-semibold text-xs text-[var(--csi-vert-deep)]">
                      #{doc.id_document}
                    </TableCell>
                    <TableCell>
                      <Badge variant={doc.categorie_archive === "B" ? "warning" : "default"}>
                        {CAT_BADGE_LABEL[doc.categorie_archive]}
                      </Badge>
                      {doc.categorie_archive === "B" && (
                        <span className="ml-1 inline-flex text-[var(--csi-warning)]">
                          <IconLock size={11} />
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-[var(--csi-text-primary)]">
                      {/* Libellé FR lisible depuis le référentiel centralisé */}
                      {archiveTypeLabel(doc.type_document)}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          doc.mode_conservation === "PHYSIQUE"
                            ? "bg-gray-50 text-gray-600 border-gray-200"
                            : doc.mode_conservation === "NUMERIQUE"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {doc.mode_conservation === "PHYSIQUE"
                          ? "Physique"
                          : doc.mode_conservation === "NUMERIQUE"
                          ? "Numérique"
                          : "Mixte"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      {doc.nom_original ? (
                        <div>
                          <div className="font-medium truncate max-w-xs text-[var(--csi-text-primary)]">
                            {doc.nom_original}
                          </div>
                          <div className="text-[10px] text-[var(--csi-text-secondary)]">
                            {doc.taille_octets ? `${(doc.taille_octets / 1024).toFixed(1)} Ko` : ""}
                            {doc.mime_type ? ` • ${doc.mime_type}` : ""}
                          </div>
                        </div>
                      ) : doc.emplacement_physique ? (
                        <span className="text-[var(--csi-text-secondary)] italic text-[11px]">
                          {doc.emplacement_physique}
                        </span>
                      ) : (
                        <span className="text-[var(--csi-text-secondary)] italic text-[11px]">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--csi-text-secondary)]">
                      {new Date(doc.date_import).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {doc.mode_conservation !== "PHYSIQUE" ? (
                          <button
                            onClick={() => handleDownload(doc)}
                            disabled={downloadingId === doc.id_document}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-[var(--csi-bg)] text-[var(--csi-text-primary)] hover:bg-[var(--csi-vert-soft)] hover:text-[var(--csi-vert-deep)] border border-[var(--csi-border)] rounded-full font-medium transition-colors disabled:opacity-50"
                            title="Télécharger"
                          >
                            {downloadingId === doc.id_document ? (
                              <span className="animate-spin">↺</span>
                            ) : (
                              <IconDownload size={12} />
                            )}
                          </button>
                        ) : (
                          <span className="text-[10px] text-[var(--csi-text-secondary)] italic mr-1">En rayon</span>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => setDocToDelete(doc)}
                            className="p-1 text-[var(--csi-text-secondary)] hover:text-[var(--csi-danger)] hover:bg-[var(--csi-danger-soft)]/50 rounded-full transition-colors"
                            title="Supprimer la pièce"
                          >
                            <IconTrash size={13} />
                          </button>
                        )}
                      </div>
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

        {/* ── Modal Import Fichier Numérique ───────────────────────────── */}
        <Dialog
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="Importer une Pièce Numérique"
          description="Téléversement sécurisé dans le stockage privé du CSI Sakaraha."
          maxWidth="lg"
        >
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
            {/* ── Bloc classification ─────────────────────────────────── */}
            <div className="p-4 bg-[var(--csi-bg)] rounded-xl border border-[var(--csi-border-subtle)] space-y-3">
              <p className="text-[11px] font-semibold text-[var(--csi-text-secondary)] uppercase tracking-wider">
                Classification réglementaire
              </p>

              {/* Champ 1 : Catégorie */}
              <FormField label="Catégorie d'archive" id="upload_cat">
                <select
                  id="upload_cat"
                  value={uploadCat}
                  onChange={(e) => handleUploadCatChange(e.target.value as CategorieArchive | "")}
                  className={selectClass}
                  required
                >
                  <option value="" disabled>— Sélectionner une catégorie —</option>
                  {CATEGORIES_ARCHIVE.map((c) =>
                    c.value === "B" && !isAdmin ? null : (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    )
                  )}
                </select>
              </FormField>

              {/* Champ 2 : Type de document (dépendant de la catégorie) */}
              <FormField
                label="Type de document réglementaire"
                id="upload_type"
                hint={!uploadCat ? "Sélectionnez d'abord une catégorie." : undefined}
              >
                <select
                  id="upload_type"
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className={`${selectClass} ${!uploadCat ? "opacity-50 cursor-not-allowed" : ""}`}
                  required
                  disabled={!uploadCat}
                >
                  <option value="" disabled>— Sélectionner un type —</option>
                  {uploadCat &&
                    TYPE_OPTIONS[uploadCat].map((t) => (
                      <option key={t} value={t}>
                        {archiveTypeLabel(t)}
                      </option>
                    ))}
                </select>
              </FormField>

              {/* Info confidentialité auto-déduite */}
              {uploadCat && (
                <div className={`text-[11px] px-3 py-2 rounded-lg flex items-center gap-1.5 ${
                  uploadCat === "B"
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : "bg-[var(--csi-vert-light)] text-[var(--csi-vert-deep)] border border-[var(--csi-vert-inst)]/20"
                }`}>
                  {uploadCat === "B" && <IconLock size={12} />}
                  Confidentialité :&nbsp;
                  <strong>
                    {uploadCat === "B" ? "CONFIDENTIEL — accès restreint" : "Non confidentiel"}
                  </strong>
                </div>
              )}
            </div>

            {/* ── Mode de conservation ────────────────────────────────── */}
            <FormField label="Mode de conservation" id="upload_mode">
              <select
                id="upload_mode"
                value={uploadMode}
                onChange={(e) => setUploadMode(e.target.value as "NUMERIQUE" | "MIXTE")}
                className={selectClass}
              >
                <option value="NUMERIQUE">Numérique uniquement</option>
                <option value="MIXTE">Mixte — numérique + support papier en rayon</option>
              </select>
            </FormField>

            {/* Emplacement physique (si MIXTE) */}
            {uploadMode === "MIXTE" && (
              <FormField label="Emplacement physique du support papier" id="upload_empl">
                <input
                  id="upload_empl"
                  type="text"
                  required
                  placeholder="Ex : Armoire 2, Classeur PV 2026"
                  value={uploadEmplacement}
                  onChange={(e) => setUploadEmplacement(e.target.value)}
                  className={inputClass}
                />
              </FormField>
            )}

            {/* Fichier */}
            <FormField label="Fichier à importer" id="file_input">
              <input
                id="file_input"
                type="file"
                required
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-[var(--csi-text-primary)] file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-[var(--csi-vert-soft)] file:text-[var(--csi-vert-deep)] hover:file:bg-[var(--csi-vert-light)] cursor-pointer"
              />
            </FormField>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--csi-border)]">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 border border-[var(--csi-border)] rounded-full text-xs font-medium hover:bg-[var(--csi-bg)] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !uploadCat || !uploadType}
                className="flex items-center gap-1.5 px-4 py-2 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full text-xs font-medium shadow-sm transition-colors"
              >
                <IconUpload size={13} />
                {isSubmitting ? "Importation en cours…" : "Téléverser et classer"}
              </button>
            </div>
          </form>
        </Dialog>

        {/* ── Modal Enregistrement Physique Seul ───────────────────────── */}
        <Dialog
          isOpen={isPhysicalModalOpen}
          onClose={() => setIsPhysicalModalOpen(false)}
          title="Cotation d'un Document Physique"
          description="Enregistrement d'une pièce papier conservée dans les rayonnages du CSI Sakaraha."
          maxWidth="md"
        >
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handlePhysicalSubmit} className="space-y-4 text-xs">
            {/* ── Bloc classification ─────────────────────────────────── */}
            <div className="p-4 bg-[var(--csi-bg)] rounded-xl border border-[var(--csi-border-subtle)] space-y-3">
              <p className="text-[11px] font-semibold text-[var(--csi-text-secondary)] uppercase tracking-wider">
                Classification réglementaire
              </p>

              {/* Champ 1 : Catégorie */}
              <FormField label="Catégorie d'archive" id="phys_cat">
                <select
                  id="phys_cat"
                  value={physCat}
                  onChange={(e) => handlePhysCatChange(e.target.value as CategorieArchive | "")}
                  className={selectClass}
                  required
                >
                  <option value="" disabled>— Sélectionner une catégorie —</option>
                  {CATEGORIES_ARCHIVE.map((c) =>
                    c.value === "B" && !isAdmin ? null : (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    )
                  )}
                </select>
              </FormField>

              {/* Champ 2 : Type de document (dépendant de la catégorie) */}
              <FormField
                label="Type de document réglementaire"
                id="phys_type"
                hint={!physCat ? "Sélectionnez d'abord une catégorie." : undefined}
              >
                <select
                  id="phys_type"
                  value={physType}
                  onChange={(e) => setPhysType(e.target.value)}
                  className={`${selectClass} ${!physCat ? "opacity-50 cursor-not-allowed" : ""}`}
                  required
                  disabled={!physCat}
                >
                  <option value="" disabled>— Sélectionner un type —</option>
                  {physCat &&
                    TYPE_OPTIONS[physCat].map((t) => (
                      <option key={t} value={t}>
                        {archiveTypeLabel(t)}
                      </option>
                    ))}
                </select>
              </FormField>

              {/* Info confidentialité */}
              {physCat && (
                <div className={`text-[11px] px-3 py-2 rounded-lg flex items-center gap-1.5 ${
                  physCat === "B"
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : "bg-[var(--csi-vert-light)] text-[var(--csi-vert-deep)] border border-[var(--csi-vert-inst)]/20"
                }`}>
                  {physCat === "B" && <IconLock size={12} />}
                  Confidentialité :&nbsp;
                  <strong>
                    {physCat === "B" ? "CONFIDENTIEL — accès restreint" : "Non confidentiel"}
                  </strong>
                </div>
              )}
            </div>

            {/* Emplacement */}
            <FormField label="Emplacement physique (rayonnage / boîte)" id="phys_empl">
              <input
                id="phys_empl"
                type="text"
                required
                placeholder="Ex : Rayon 3, Boîte Archive N° 12"
                value={physEmplacement}
                onChange={(e) => setPhysEmplacement(e.target.value)}
                className={inputClass}
              />
            </FormField>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--csi-border)]">
              <button
                type="button"
                onClick={() => setIsPhysicalModalOpen(false)}
                className="px-4 py-2 border border-[var(--csi-border)] rounded-full text-xs font-medium hover:bg-[var(--csi-bg)] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !physCat || !physType}
                className="flex items-center gap-1.5 px-4 py-2 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full text-xs font-medium shadow-sm transition-colors"
              >
                <IconBox size={13} />
                {isSubmitting ? "Enregistrement…" : "Enregistrer la cotation"}
              </button>
            </div>
          </form>
        </Dialog>

        {/* ── Confirmation de suppression d'archive ─────────────────────── */}
        <ConfirmDialog
          isOpen={!!docToDelete}
          onClose={() => setDocToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Suppression d'une pièce d'archive"
          description={`Êtes-vous sûr de vouloir supprimer définitivement la pièce #${docToDelete?.id_document} (${docToDelete ? archiveTypeLabel(docToDelete.type_document) : ""}) ? Cette action est irréversible.`}
          confirmLabel="Supprimer définitivement"
          cancelLabel="Annuler"
          variant="danger"
          isLoading={isDeleting}
        />

      </div>
    </AppShell>
  );
}
