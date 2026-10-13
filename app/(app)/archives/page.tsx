"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableSkeleton } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { FormField, inputClass, selectClass } from "@/components/ui/FormField";
import { api } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth/context";
import {
  DocumentArchive,
  DocumentPhysicalCreate,
  TYPES_DOCUMENTS_CAT_A,
  TYPES_DOCUMENTS_CAT_B,
} from "@/types/api";

const LIMIT = 25;

export default function ArchivesPage() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<DocumentArchive[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [catFilter, setCatFilter] = useState<"A" | "B" | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPhysicalModalOpen, setIsPhysicalModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  // Formulaire Document Physique
  const [physicalForm, setPhysicalForm] = useState<DocumentPhysicalCreate>({
    categorie_archive: "A",
    type_document: TYPES_DOCUMENTS_CAT_A[0],
    confidentialite: "NON_CONFIDENTIEL",
    mode_conservation: "PHYSIQUE",
    emplacement_physique: "Armoire 1 - Rayon B",
  });

  // Formulaire Upload Fichier Numérique
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<"A" | "B">("A");
  const [uploadType, setUploadType] = useState<string>(TYPES_DOCUMENTS_CAT_A[0]);
  const [uploadEmplacement, setUploadEmplacement] = useState<string>("");
  const [uploadMode, setUploadMode] = useState<"NUMERIQUE" | "MIXTE">("NUMERIQUE");

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
  }, [skip, catFilter]);

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

  const handlePhysicalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      await api.documents.createPhysical(physicalForm);
      setIsPhysicalModalOpen(false);
      loadData(skip, catFilter);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Erreur lors du classement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setFormError("Veuillez sélectionner un fichier à importer.");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("categorie_archive", uploadCategory);
      formData.append("type_document", uploadType);
      formData.append("confidentialite", uploadCategory === "A" ? "NON_CONFIDENTIEL" : "CONFIDENTIEL");
      formData.append("mode_conservation", uploadMode);
      if (uploadMode === "MIXTE" && uploadEmplacement) {
        formData.append("emplacement_physique", uploadEmplacement);
      }

      await api.documents.upload(formData);
      setIsUploadModalOpen(false);
      loadData(skip, catFilter);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Erreur lors de l'import");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Barre d'outils et de classification A/B */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--csi-surface)] p-3 border border-[var(--csi-border)] rounded-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--csi-vert-deep)] uppercase tracking-wider">
              Archives & Pièces Jointes
            </span>
            <Badge variant="neutral">{total} pièces cotées</Badge>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={catFilter}
              onChange={(e) => {
                setCatFilter(e.target.value as "A" | "B" | "");
                setSkip(0);
              }}
              className="text-xs bg-[var(--csi-bg)] border border-[var(--csi-border)] rounded px-2.5 py-1.5 focus:outline-none"
            >
              <option value="">Toutes les Catégories</option>
              <option value="A">Catégorie A (Non Confidentiel)</option>
              {isAdmin && <option value="B">Catégorie B (Confidentiel / Sensible)</option>}
            </select>

            <button
              onClick={() => {
                setFormError(null);
                setIsPhysicalModalOpen(true);
              }}
              className="px-3 py-1.5 border border-[var(--csi-border)] hover:bg-[var(--csi-bg)] text-[var(--csi-text-primary)] text-xs font-medium rounded transition-colors"
            >
              📦 Cotation Physique
            </button>

            <button
              onClick={() => {
                setFormError(null);
                setUploadFile(null);
                setIsUploadModalOpen(true);
              }}
              className="px-3 py-1.5 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] text-white text-xs font-medium rounded transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <span>⬆️</span> Importer Fichier Numérique
            </button>
          </div>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={() => loadData(skip, catFilter)} />
        ) : isLoading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Aucun document classé"
            description="Le fond d'archives ne contient aucune pièce dans cette catégorie."
            action={{ label: "Importer un document", onClick: () => setIsUploadModalOpen(true) }}
          />
        ) : (
          <div className="space-y-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">N° ID</TableHead>
                  <TableHead className="w-20">Archive</TableHead>
                  <TableHead>Type Document Réglementaire</TableHead>
                  <TableHead>Conservation & Emplacement</TableHead>
                  <TableHead>Nom Fichier / Données Numériques</TableHead>
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
                        Cat. {doc.categorie_archive}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {doc.type_document}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-medium text-[var(--csi-text-primary)]">
                        {doc.mode_conservation}
                      </div>
                      {doc.emplacement_physique && (
                        <div className="text-[10px] text-[var(--csi-text-secondary)]">
                          Empl: {doc.emplacement_physique}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {doc.nom_original ? (
                        <div>
                          <div className="font-medium truncate max-w-xs">{doc.nom_original}</div>
                          <div className="text-[10px] text-[var(--csi-text-secondary)]">
                            {doc.taille_octets ? `${(doc.taille_octets / 1024).toFixed(1)} Ko` : ""} {doc.mime_type ? `• ${doc.mime_type}` : ""}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[var(--csi-text-secondary)] italic">Support physique uniquement</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--csi-text-secondary)]">
                      {new Date(doc.date_import).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-right">
                      {doc.mode_conservation !== "PHYSIQUE" ? (
                        <button
                          onClick={() => handleDownload(doc)}
                          disabled={downloadingId === doc.id_document}
                          className="px-2.5 py-1 text-xs bg-[var(--csi-vert-soft)] text-[var(--csi-vert-deep)] hover:bg-[var(--csi-vert-inst)] hover:text-white rounded font-medium transition-colors disabled:opacity-50"
                        >
                          {downloadingId === doc.id_document ? "..." : "Télécharger"}
                        </button>
                      ) : (
                        <span className="text-[10px] text-[var(--csi-text-secondary)]">En rayon</span>
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

        {/* Modal Import Fichier Numérique */}
        <Dialog
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="Importer une Pièce Numérique"
          description="Téléversement sécurisé dans le stockage privé du CSI Sakaraha."
          maxWidth="lg"
        >
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-[var(--csi-vert-light)]/40 rounded border border-[var(--csi-border-subtle)] space-y-3">
              <FormField label="Catégorie d'Archive" id="upload_cat">
                <select
                  id="upload_cat"
                  value={uploadCategory}
                  onChange={(e) => {
                    const c = e.target.value as "A" | "B";
                    setUploadCategory(c);
                    setUploadType(c === "A" ? TYPES_DOCUMENTS_CAT_A[0] : TYPES_DOCUMENTS_CAT_B[0]);
                  }}
                  className={selectClass}
                  required
                >
                  <option value="A">Catégorie A — Non Confidentiel</option>
                  {isAdmin && <option value="B">Catégorie B — Confidentiel (Réservé)</option>}
                </select>
              </FormField>

              <FormField label="Type de Document Réglementaire" id="upload_type">
                <select
                  id="upload_type"
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className={selectClass}
                  required
                >
                  {(uploadCategory === "A" ? TYPES_DOCUMENTS_CAT_A : TYPES_DOCUMENTS_CAT_B).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Mode de Conservation" id="upload_mode">
                <select
                  id="upload_mode"
                  value={uploadMode}
                  onChange={(e) => setUploadMode(e.target.value as "NUMERIQUE" | "MIXTE")}
                  className={selectClass}
                >
                  <option value="NUMERIQUE">Numérique Uniquement</option>
                  <option value="MIXTE">Mixte (Numérique + Support Papier en Rayon)</option>
                </select>
              </FormField>
            </div>

            {uploadMode === "MIXTE" && (
              <FormField label="Emplacement Physique du Support Papier" id="upload_empl">
                <input
                  id="upload_empl"
                  type="text"
                  required
                  placeholder="Ex: Armoire 2, Classeur PV 2026"
                  value={uploadEmplacement}
                  onChange={(e) => setUploadEmplacement(e.target.value)}
                  className={inputClass}
                />
              </FormField>
            )}

            <FormField label="Fichier à Importer" id="file_input">
              <input
                id="file_input"
                type="file"
                required
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-[var(--csi-text-primary)] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-[var(--csi-vert-soft)] file:text-[var(--csi-vert-deep)] hover:file:bg-[var(--csi-vert-light)] cursor-pointer"
              />
            </FormField>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--csi-border)]">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-3 py-2 border border-[var(--csi-border)] rounded text-xs font-medium hover:bg-[var(--csi-bg)]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] disabled:opacity-50 text-white rounded text-xs font-medium shadow-2xs"
              >
                {isSubmitting ? "Importation en cours..." : "Téléverser et Classer"}
              </button>
            </div>
          </form>
        </Dialog>

        {/* Modal Enregistrement Physique Seul */}
        <Dialog
          isOpen={isPhysicalModalOpen}
          onClose={() => setIsPhysicalModalOpen(false)}
          title="Cotation d'un Document Physique"
          description="Enregistrement d'une pièce papier conservée aux archives."
          maxWidth="md"
        >
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handlePhysicalSubmit} className="space-y-4 text-xs">
            <FormField label="Catégorie d'Archive" id="phys_cat">
              <select
                id="phys_cat"
                value={physicalForm.categorie_archive}
                onChange={(e) => {
                  const c = e.target.value as "A" | "B";
                  setPhysicalForm({
                    ...physicalForm,
                    categorie_archive: c,
                    confidentialite: c === "A" ? "NON_CONFIDENTIEL" : "CONFIDENTIEL",
                    type_document: c === "A" ? TYPES_DOCUMENTS_CAT_A[0] : TYPES_DOCUMENTS_CAT_B[0],
                  });
                }}
                className={selectClass}
                required
              >
                <option value="A">Catégorie A — Non Confidentiel</option>
                {isAdmin && <option value="B">Catégorie B — Confidentiel</option>}
              </select>
            </FormField>

            <FormField label="Type de Document Réglementaire" id="phys_type">
              <select
                id="phys_type"
                value={physicalForm.type_document}
                onChange={(e) => setPhysicalForm({ ...physicalForm, type_document: e.target.value })}
                className={selectClass}
                required
              >
                {(physicalForm.categorie_archive === "A" ? TYPES_DOCUMENTS_CAT_A : TYPES_DOCUMENTS_CAT_B).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Emplacement Physique (Rayonnage / Boîte)" id="phys_empl">
              <input
                id="phys_empl"
                type="text"
                required
                placeholder="Ex: Rayon 3, Boîte Archive N° 12"
                value={physicalForm.emplacement_physique}
                onChange={(e) => setPhysicalForm({ ...physicalForm, emplacement_physique: e.target.value })}
                className={inputClass}
              />
            </FormField>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--csi-border)]">
              <button
                type="button"
                onClick={() => setIsPhysicalModalOpen(false)}
                className="px-3 py-2 border border-[var(--csi-border)] rounded text-xs font-medium hover:bg-[var(--csi-bg)]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] disabled:opacity-50 text-white rounded text-xs font-medium shadow-2xs"
              >
                {isSubmitting ? "Enregistrement..." : "Enregistrer la Cotation"}
              </button>
            </div>
          </form>
        </Dialog>
      </div>
    </AppShell>
  );
}
