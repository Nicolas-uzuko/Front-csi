"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableSkeleton } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { FormField, inputClass, textareaClass } from "@/components/ui/FormField";
import { IconPencil, IconTrash, IconDownload } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth/context";
import { ServiceCourant, ServiceCourantCreate, DocumentArchive } from "@/types/api";

const LIMIT = 25;

// Types de fichiers acceptés
const ACCEPTED_FILE_TYPES = ".pdf,.docx,.doc,.png,.jpg,.jpeg";
const MAX_FILE_SIZE_MB = 10;

export default function ServicesCourantsPage() {
  const { isAdmin } = useAuth();
  const { success, error: toastError } = useToast();
  const [items, setItems] = useState<ServiceCourant[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceCourant | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceCourant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Gestion du fichier à uploader
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fichierInfo, setFichierInfo] = useState<Record<number, DocumentArchive | null>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ServiceCourantCreate>({
    grade_nom: "",
    type_arme: "",
    tenue: "Treillis de combat",
    moyen: "Pied / Patrouille",
    mission: "",
    date_depart: "",
    date_retour: "",
    numero_ordre: "",
    signataire: "",
  });

  const loadData = async (offset = skip) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.servicesCourants.list(offset, LIMIT);
      setItems(res.items);
      setTotal(res.total);
      // Charger les infos de fichiers pour les items existants
      loadFichiersInfo(res.items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de chargement des ordres de mission");
    } finally {
      setIsLoading(false);
    }
  };

  const loadFichiersInfo = async (serviceItems: ServiceCourant[]) => {
    const infos: Record<number, DocumentArchive | null> = {};
    await Promise.all(
      serviceItems.map(async (item) => {
        try {
          const doc = await api.servicesCourants.getFichierInfo(item.id_service);
          infos[item.id_service] = doc;
        } catch {
          infos[item.id_service] = null;
        }
      })
    );
    setFichierInfo((prev) => ({ ...prev, ...infos }));
  };

  useEffect(() => {
    loadData(skip);
  }, [skip]);

  const handleOpenCreate = () => {
    setSelectedService(null);
    setSelectedFile(null);
    setFormData({
      grade_nom: "",
      type_arme: "MAT-49 / PA",
      tenue: "Treillis de combat",
      moyen: "Véhicule 4x4 / Moto",
      mission: "",
      date_depart: new Date().toISOString().slice(0, 16),
      date_retour: "",
      numero_ordre: "",
      signataire: "",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleRowClick = (item: ServiceCourant) => {
    setSelectedService(item);
    setSelectedFile(null);
    setFormData({
      grade_nom: item.grade_nom || "",
      type_arme: item.type_arme || "",
      tenue: item.tenue || "",
      moyen: item.moyen || "",
      mission: item.mission || "",
      date_depart: item.date_depart ? item.date_depart.slice(0, 16) : "",
      date_retour: item.date_retour ? item.date_retour.slice(0, 16) : "",
      numero_ordre: item.numero_ordre || "",
      signataire: item.signataire || "",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toastError("Fichier trop volumineux", `La taille maximale est ${MAX_FILE_SIZE_MB} Mo.`);
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload: ServiceCourantCreate = {
        ...formData,
        date_depart: formData.date_depart ? new Date(formData.date_depart).toISOString() : null,
        date_retour: formData.date_retour ? new Date(formData.date_retour).toISOString() : null,
        grade_nom: formData.grade_nom || null,
        type_arme: formData.type_arme || null,
        tenue: formData.tenue || null,
        moyen: formData.moyen || null,
        mission: formData.mission || null,
        numero_ordre: formData.numero_ordre || null,
        signataire: formData.signataire || null,
      };

      let savedId: number;

      if (selectedService) {
        await api.servicesCourants.update(selectedService.id_service, payload);
        savedId = selectedService.id_service;
        success("Ordre de mission mis à jour", `L'ordre #${selectedService.id_service} a été actualisé.`);
      } else {
        const created = await api.servicesCourants.create(payload);
        savedId = created.id_service;
        success("Ordre de mission enregistré", "L'ordre de mission a été consigné avec succès.");
      }

      // Upload du fichier si sélectionné
      if (selectedFile && savedId) {
        setIsUploading(true);
        try {
          const doc = await api.servicesCourants.uploadFichier(savedId, selectedFile);
          setFichierInfo((prev) => ({ ...prev, [savedId]: doc }));
          success("Fichier attaché", `"${selectedFile.name}" a été associé à l'ordre de mission.`);
        } catch (uploadErr: unknown) {
          const msg = uploadErr instanceof Error ? uploadErr.message : "Erreur lors de l'upload";
          toastError("Échec de l'upload", msg);
        } finally {
          setIsUploading(false);
        }
      }

      setIsModalOpen(false);
      loadData(skip);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'enregistrement";
      setFormError(msg);
      toastError("Erreur d'enregistrement", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async (item: ServiceCourant) => {
    setIsDownloading(item.id_service);
    try {
      const { blob, filename } = await api.servicesCourants.downloadFichierBlob(item.id_service);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Impossible de télécharger";
      toastError("Échec du téléchargement", msg);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    setIsDeleting(true);
    try {
      await api.servicesCourants.delete(serviceToDelete.id_service);
      success("Ordre supprimé", `L'ordre de mission #${serviceToDelete.id_service} a été supprimé.`);
      setServiceToDelete(null);
      loadData(skip);
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
      (it) =>
        it.grade_nom?.toLowerCase().includes(s) ||
        it.mission?.toLowerCase().includes(s) ||
        it.moyen?.toLowerCase().includes(s) ||
        it.type_arme?.toLowerCase().includes(s) ||
        it.numero_ordre?.toLowerCase().includes(s)
    );
  }, [items, search]);

  // Icône selon le type de fichier
  const getFileIcon = (mime?: string | null) => {
    if (!mime) return "📎";
    if (mime === "application/pdf") return "📄";
    if (mime.startsWith("image/")) return "🖼️";
    if (mime.includes("word") || mime.includes("docx")) return "📝";
    return "📎";
  };

  return (
    <AppShell
      searchTerm={search}
      onSearchChange={setSearch}
      searchPlaceholder="Rechercher par militaire, arme, mission, numéro..."
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--csi-surface)] p-3 border border-[var(--csi-border)] rounded-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--csi-vert-deep)] uppercase tracking-wider">
              Ordres de Mission
            </span>
            <Badge variant="neutral">{total} ordres consignés</Badge>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] text-white text-xs font-medium rounded transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <span>＋</span> Nouvel Ordre de Mission
          </button>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={() => loadData(skip)} />
        ) : isLoading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="Aucun ordre de mission consigné"
            description="Le registre des départs en mission et services de garde est actuellement vide."
            action={{ label: "Consigner un ordre de mission", onClick: handleOpenCreate }}
          />
        ) : (
          <div className="space-y-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">N° Ordre</TableHead>
                  <TableHead>Militaire (Grade & Nom)</TableHead>
                  <TableHead>Armement & Tenue</TableHead>
                  <TableHead>Mission / Destination</TableHead>
                  <TableHead>Moyen</TableHead>
                  <TableHead className="w-36">Départ / Retour</TableHead>
                  <TableHead className="w-28 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {filteredItems.map((item) => {
                  const docInfo = fichierInfo[item.id_service];
                  const hasFichier = !!docInfo;
                  return (
                    <TableRow
                      key={item.id_service}
                      onClick={() => handleRowClick(item)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-semibold text-xs text-[var(--csi-vert-deep)]">
                        {item.numero_ordre || `#${item.id_service}`}
                      </TableCell>
                      <TableCell className="font-medium text-xs text-[var(--csi-text-primary)]">
                        {item.grade_nom || "Non renseigné"}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div>{item.type_arme || "-"}</div>
                        <div className="text-[10px] text-[var(--csi-text-secondary)]">
                          {item.tenue || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs max-w-sm truncate">
                        {item.mission || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-[var(--csi-text-secondary)]">
                        {item.moyen || "-"}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div>D: {item.date_depart ? new Date(item.date_depart).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "-"}</div>
                        <div className="text-[10px] text-[var(--csi-text-secondary)]">
                          R: {item.date_retour ? new Date(item.date_retour).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "En cours"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {/* Bouton téléchargement — affiché seulement si un fichier existe */}
                          {hasFichier && (
                            <button
                              onClick={() => handleDownload(item)}
                              disabled={isDownloading === item.id_service}
                              className="p-1.5 text-[var(--csi-text-secondary)] hover:text-[var(--csi-vert-deep)] hover:bg-[var(--csi-vert-soft)] rounded-full transition-colors"
                              title={`Télécharger ${docInfo?.nom_original || "le fichier"}`}
                            >
                              {isDownloading === item.id_service ? (
                                <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin inline-block" />
                              ) : (
                                <span className="text-xs">{getFileIcon(docInfo?.mime_type)}</span>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleRowClick(item)}
                            className="p-1.5 text-[var(--csi-text-secondary)] hover:text-[var(--csi-vert-deep)] hover:bg-[var(--csi-vert-soft)] rounded-full transition-colors"
                            title="Modifier"
                          >
                            <IconPencil size={13} />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setServiceToDelete(item)}
                              className="p-1.5 text-[var(--csi-text-secondary)] hover:text-[var(--csi-danger)] hover:bg-[var(--csi-danger-soft)]/50 rounded-full transition-colors"
                              title="Supprimer"
                            >
                              <IconTrash size={13} />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
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

        {/* Modal Formulaire */}
        <Dialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedService ? `Ordre de Mission #${selectedService.id_service}` : "Consigner un Ordre de Mission"}
          description="Enregistrement d'un départ en patrouille, escorte, mission ou service de garde."
          maxWidth="lg"
        >
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Numéro d'Ordre" optional id="numero_ordre">
                <input
                  id="numero_ordre"
                  type="text"
                  placeholder="Ex: 045/OM"
                  value={formData.numero_ordre || ""}
                  onChange={(e) => setFormData({ ...formData, numero_ordre: e.target.value })}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Grade et Nom" optional id="grade_nom">
                <input
                  id="grade_nom"
                  type="text"
                  placeholder="Ex: Gendarme RAKOTO"
                  value={formData.grade_nom || ""}
                  onChange={(e) => setFormData({ ...formData, grade_nom: e.target.value })}
                  className={inputClass}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label="Type d'Arme" optional id="type_arme">
                <input
                  id="type_arme"
                  type="text"
                  placeholder="Ex: MAS-36, MAT-49"
                  value={formData.type_arme || ""}
                  onChange={(e) => setFormData({ ...formData, type_arme: e.target.value })}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Tenue" optional id="tenue">
                <input
                  id="tenue"
                  type="text"
                  value={formData.tenue || ""}
                  onChange={(e) => setFormData({ ...formData, tenue: e.target.value })}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Moyen de Transport" optional id="moyen">
                <input
                  id="moyen"
                  type="text"
                  placeholder="Ex: Moto, Véhicule"
                  value={formData.moyen || ""}
                  onChange={(e) => setFormData({ ...formData, moyen: e.target.value })}
                  className={inputClass}
                />
              </FormField>
            </div>

            <FormField label="Mission / Itinéraire" optional id="mission">
              <textarea
                id="mission"
                rows={2}
                placeholder="Détails de la mission ordonnée..."
                value={formData.mission || ""}
                onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                className={textareaClass}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Date & Heure de Départ" optional id="date_depart">
                <input
                  id="date_depart"
                  type="datetime-local"
                  value={formData.date_depart || ""}
                  onChange={(e) => setFormData({ ...formData, date_depart: e.target.value })}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Date & Heure de Retour" optional id="date_retour">
                <input
                  id="date_retour"
                  type="datetime-local"
                  value={formData.date_retour || ""}
                  onChange={(e) => setFormData({ ...formData, date_retour: e.target.value })}
                  className={inputClass}
                />
              </FormField>
            </div>

            <FormField label="Signataire / Donneur d'Ordre" optional id="signataire">
              <input
                id="signataire"
                type="text"
                placeholder="Ex: Adjudant-Chef"
                value={formData.signataire || ""}
                onChange={(e) => setFormData({ ...formData, signataire: e.target.value })}
                className={inputClass}
              />
            </FormField>

            {/* ── Zone d'import de fichier ── */}
            <div className="border border-dashed border-[var(--csi-border)] rounded-lg p-3 bg-[var(--csi-bg)]">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-xs font-semibold text-[var(--csi-text-primary)]">
                    Fichier de l&apos;ordre de mission
                  </p>
                  <p className="text-[10px] text-[var(--csi-text-secondary)] mt-0.5">
                    PDF, DOCX, PNG ou JPG · Max {MAX_FILE_SIZE_MB} Mo
                  </p>
                </div>
                {/* Afficher le fichier existant */}
                {selectedService && fichierInfo[selectedService.id_service] && !selectedFile && (
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--csi-vert-deep)] bg-[var(--csi-vert-soft)] px-2 py-1 rounded">
                    <span>{getFileIcon(fichierInfo[selectedService.id_service]?.mime_type)}</span>
                    <span className="truncate max-w-[140px]">
                      {fichierInfo[selectedService.id_service]?.nom_original || "Fichier attaché"}
                    </span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                onChange={handleFileChange}
                className="hidden"
                id="fichier_ordre"
              />

              {selectedFile ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-[var(--csi-vert-deep)]">
                    <span>{getFileIcon(selectedFile.type)}</span>
                    <span className="truncate max-w-[200px] font-medium">{selectedFile.name}</span>
                    <span className="text-[10px] text-[var(--csi-text-secondary)]">
                      ({(selectedFile.size / 1024).toFixed(0)} Ko)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-[10px] text-red-500 hover:text-red-700"
                  >
                    Retirer
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="fichier_ordre"
                  className="flex items-center gap-2 cursor-pointer text-xs text-[var(--csi-text-secondary)] hover:text-[var(--csi-vert-deep)] transition-colors"
                >
                  <IconDownload size={14} />
                  <span>
                    {selectedService && fichierInfo[selectedService.id_service]
                      ? "Remplacer le fichier existant"
                      : "Sélectionner un fichier à attacher"}
                  </span>
                </label>
              )}
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
                disabled={isSubmitting || isUploading}
                className="px-4 py-2 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] disabled:opacity-50 text-white rounded text-xs font-medium shadow-2xs"
              >
                {isSubmitting
                  ? "Enregistrement..."
                  : isUploading
                  ? "Upload en cours..."
                  : selectedService
                  ? "Mettre à jour"
                  : "Consigner"}
              </button>
            </div>
          </form>
        </Dialog>

        {/* Modal Confirmation de suppression */}
        <ConfirmDialog
          isOpen={!!serviceToDelete}
          onClose={() => setServiceToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Suppression d'un ordre de mission"
          description={`Êtes-vous certain de vouloir supprimer l'ordre de mission #${serviceToDelete?.id_service} (${serviceToDelete?.numero_ordre || "Sans numéro"}) ? Cette action est irréversible.`}
          confirmLabel="Supprimer définitivement"
          cancelLabel="Annuler"
          variant="danger"
          isLoading={isDeleting}
        />
      </div>
    </AppShell>
  );
}
