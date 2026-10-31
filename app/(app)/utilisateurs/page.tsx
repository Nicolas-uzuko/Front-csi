"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableSkeleton } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { FormField, inputClass, selectClass } from "@/components/ui/FormField";
import { IconPencil, IconTrash, IconPlus } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth/context";
import { Utilisateur, UtilisateurCreate, UtilisateurUpdate, RoleUtilisateur } from "@/types/api";

const LIMIT = 25;

export default function UtilisateursPage() {
  const { isAdmin } = useAuth();
  const { success, error: toastError } = useToast();
  const [items, setItems] = useState<Utilisateur[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Utilisateur | null>(null);
  const [userToDelete, setUserToDelete] = useState<Utilisateur | null>(null);
  const [newRole, setNewRole] = useState<RoleUtilisateur>("UTILISATEUR");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [adminExists, setAdminExists] = useState(false);

  const [formData, setFormData] = useState<UtilisateurCreate>({
    nom: "",
    prenom: "",
    matricule: "",
    nom_utilisateur: "",
    email: "",
    telephone: "",
    mot_de_passe: "",
    role: "UTILISATEUR",
  });

  const [editFormData, setEditFormData] = useState<UtilisateurUpdate>({
    nom: "",
    prenom: "",
    matricule: "",
    nom_utilisateur: "",
    email: "",
    telephone: "",
    statut: "ACTIF",
  });

  const loadData = async (offset = skip) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.utilisateurs.list(offset, LIMIT);
      setItems(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de chargement des utilisateurs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData(skip);
    }
  }, [skip, isAdmin]);



  const handleOpenCreate = async () => {
    setFormData({
      nom: "",
      prenom: "",
      matricule: "",
      nom_utilisateur: "",
      email: "",
      telephone: "",
      mot_de_passe: "",
      role: "UTILISATEUR",
    });
    setFormError(null);

    // Vérifier si un admin existe déjà
    try {
      const res = await api.utilisateurs.checkAdminExists();
      setAdminExists(res.admin_exists);
    } catch {
      // Fallback : vérifier sur les éléments déjà chargés
      const existsInLoaded = items.some((u) => u.role === "ADMIN");
      setAdminExists(existsInLoaded);
    }

    setIsCreateModalOpen(true);
  };

  const handleOpenRoleModal = (user: Utilisateur) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setFormError(null);
    setIsRoleModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    if (formData.telephone && !/^[0-9]{10}$/.test(formData.telephone)) {
      setFormError("Le numéro de téléphone doit comporter exactement 10 chiffres.");
      setIsSubmitting(false);
      return;
    }

    if (!/[A-Z]/.test(formData.mot_de_passe) || !/[0-9]/.test(formData.mot_de_passe) || formData.mot_de_passe.length < 8) {
      setFormError("Le mot de passe doit comporter au moins 8 caractères, une majuscule et un chiffre.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload: UtilisateurCreate = {
        ...formData,
        prenom: formData.prenom || null,
        matricule: formData.matricule || null,
        telephone: formData.telephone || null,
      };

      await api.utilisateurs.create(payload);
      setIsCreateModalOpen(false);
      success("Utilisateur créé", `Le compte ${formData.nom_utilisateur} a été créé avec succès.`);
      loadData(skip);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la création de l'utilisateur";
      setFormError(msg);
      toastError("Erreur de création", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (user: Utilisateur) => {
    setSelectedUser(user);
    setEditFormData({
      nom: user.nom,
      prenom: user.prenom || "",
      matricule: user.matricule || "",
      nom_utilisateur: user.nom_utilisateur,
      email: user.email,
      telephone: user.telephone || "",
      statut: user.statut,
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSubmitting(true);
    setFormError(null);

    if (editFormData.telephone && !/^[0-9]{10}$/.test(editFormData.telephone)) {
      setFormError("Le numéro de téléphone doit comporter exactement 10 chiffres.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload: UtilisateurUpdate = {
        nom: editFormData.nom,
        prenom: editFormData.prenom || null,
        matricule: editFormData.matricule || null,
        nom_utilisateur: editFormData.nom_utilisateur,
        email: editFormData.email,
        telephone: editFormData.telephone || null,
        statut: editFormData.statut,
      };

      await api.utilisateurs.update(selectedUser.id, payload);
      setIsEditModalOpen(false);
      success("Utilisateur mis à jour", `Les informations de ${selectedUser.nom_utilisateur} ont été modifiées.`);
      loadData(skip);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la modification";
      setFormError(msg);
      toastError("Erreur de modification", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await api.utilisateurs.delete(userToDelete.id);
      success("Compte supprimé", `Le compte de ${userToDelete.nom_utilisateur} a été supprimé.`);
      setUserToDelete(null);
      loadData(skip);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la suppression";
      toastError("Échec de la suppression", msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSubmitting(true);
    setFormError(null);

    try {
      await api.utilisateurs.changeRole(selectedUser.id, { role: newRole });
      setIsRoleModalOpen(false);
      success("Rôle modifié", `Le rôle de ${selectedUser.nom_utilisateur} est désormais ${newRole}.`);
      loadData(skip);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la modification du rôle";
      setFormError(msg);
      toastError("Erreur de rôle", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const s = search.toLowerCase();
    return items.filter(
      (u) =>
        u.nom.toLowerCase().includes(s) ||
        u.nom_utilisateur.toLowerCase().includes(s) ||
        u.matricule?.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s)
    );
  }, [items, search]);

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="p-8 text-center bg-[var(--csi-surface)] border border-red-200 rounded-md">
          <p className="text-sm font-semibold text-red-800">
            ⚠️ Accès Restreint : Administration des Utilisateurs
          </p>
          <p className="text-xs text-[var(--csi-text-secondary)] mt-1">
            Seul l'administrateur du système peut gérer les comptes et habilitations.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      searchTerm={search}
      onSearchChange={setSearch}
      searchPlaceholder="Rechercher par nom, matricule, identifiant, email..."
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--csi-surface)] p-3 border border-[var(--csi-border)] rounded-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--csi-vert-deep)] uppercase tracking-wider">
              Gestion des Utilisateurs & Rôles
            </span>
            <Badge variant="neutral">{total} comptes</Badge>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] text-white text-xs font-medium rounded transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <span>＋</span> Créer un Utilisateur
          </button>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={() => loadData(skip)} />
        ) : isLoading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="Aucun utilisateur trouvé"
            description="Aucun personnel correspondant aux critères de recherche."
          />
        ) : (
          <div className="space-y-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Matricule</TableHead>
                  <TableHead>Identifiant & Email</TableHead>
                  <TableHead>Nom & Prénom</TableHead>
                  <TableHead className="w-24">Téléphone</TableHead>
                  <TableHead className="w-20 text-center">Rôle</TableHead>
                  <TableHead className="w-20 text-center">Statut</TableHead>
                  <TableHead className="w-24 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {filteredItems.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-semibold text-xs text-[var(--csi-vert-deep)]">
                      {u.matricule || `ID-${u.id}`}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-medium text-[var(--csi-text-primary)]">{u.nom_utilisateur}</div>
                      <div className="text-[10px] text-[var(--csi-text-secondary)]">{u.email}</div>
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {u.nom} {u.prenom || ""}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--csi-text-secondary)]">
                      {u.telephone || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={u.role === "ADMIN" ? "danger" : "default"}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={u.statut === "ACTIF" ? "success" : "neutral"}>
                        {u.statut}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-[var(--csi-text-secondary)] hover:text-[var(--csi-vert-deep)] hover:bg-[var(--csi-vert-soft)] rounded-full transition-colors"
                          title="Modifier l'utilisateur"
                        >
                          <IconPencil size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenRoleModal(u)}
                          className="px-2 py-1 text-xs border border-[var(--csi-border)] rounded hover:bg-[var(--csi-bg)] text-[var(--csi-text-primary)] transition-colors"
                          title="Changer les permissions"
                        >
                          Rôle
                        </button>
                        <button
                          onClick={() => setUserToDelete(u)}
                          className="p-1.5 text-[var(--csi-text-secondary)] hover:text-[var(--csi-danger)] hover:bg-[var(--csi-danger-soft)]/50 rounded-full transition-colors"
                          title="Supprimer le compte"
                        >
                          <IconTrash size={13} />
                        </button>
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

        {/* Modal Création Utilisateur */}
        <Dialog
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Créer un Compte Personnel"
          description="Création sécurisée d'un nouvel agent habilité."
          maxWidth="lg"
        >
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Nom" id="nom_u">
                <input
                  id="nom_u"
                  type="text"
                  required
                  placeholder="Ex: RAKOTO"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Prénom" optional id="prenom_u">
                <input
                  id="prenom_u"
                  type="text"
                  placeholder="Ex: Jean"
                  value={formData.prenom || ""}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className={inputClass}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Matricule Militaire" optional id="matr_u">
                <input
                  id="matr_u"
                  type="text"
                  placeholder="Ex: 104-589"
                  value={formData.matricule || ""}
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Téléphone (10 chiffres)" optional id="tel_u">
                <input
                  id="tel_u"
                  type="text"
                  placeholder="0341234567"
                  value={formData.telephone || ""}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className={inputClass}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Nom d'Utilisateur (Identifiant)" id="user_u">
                <input
                  id="user_u"
                  type="text"
                  required
                  placeholder="Ex: j.rakoto"
                  value={formData.nom_utilisateur}
                  onChange={(e) => setFormData({ ...formData, nom_utilisateur: e.target.value })}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Adresse Email" id="email_u">
                <input
                  id="email_u"
                  type="email"
                  required
                  placeholder="j.rakoto@gendarmerie.mg"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputClass}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                label="Rôle Attribué"
                id="role_u"
                hint={adminExists ? "Un administrateur est déjà enregistré. Seul le rôle Utilisateur est disponible." : undefined}
              >
                <select
                  id="role_u"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleUtilisateur })}
                  className={selectClass}
                  required
                >
                  <option value="UTILISATEUR">UTILISATEUR (Registres courants)</option>
                  {!adminExists && (
                    <option value="ADMIN">ADMIN (Accès total & sensible)</option>
                  )}
                </select>
              </FormField>

              <FormField
                label="Mot de passe Initial"
                id="mdp_u"
                hint="Au moins 8 car., 1 majuscule, 1 chiffre"
              >
                <div className="relative">
                  <input
                    id="mdp_u"
                    type={showCreatePassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={formData.mot_de_passe}
                    onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
                    className={inputClass + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword((v) => !v)}
                    aria-label={showCreatePassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--csi-text-secondary)] hover:text-[var(--csi-vert-inst)] transition-colors"
                  >
                    {showCreatePassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </FormField>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--csi-border)]">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3 py-2 border border-[var(--csi-border)] rounded text-xs font-medium hover:bg-[var(--csi-bg)]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] disabled:opacity-50 text-white rounded text-xs font-medium shadow-2xs"
              >
                {isSubmitting ? "Création..." : "Créer le Compte"}
              </button>
            </div>
          </form>
        </Dialog>

        {/* Modal Changement de Rôle */}
        <Dialog
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          title={`Modifier les Droits — ${selectedUser?.nom_utilisateur}`}
          description="Changement du rôle et des privilèges d'accès aux registres sensibles."
          maxWidth="sm"
        >
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleRoleSubmit} className="space-y-4 text-xs">
            <FormField label="Nouveau Rôle" id="new_role">
              <select
                id="new_role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as RoleUtilisateur)}
                className={selectClass}
              >
                <option value="UTILISATEUR">UTILISATEUR (Standard)</option>
                <option value="ADMIN">ADMIN (Commandement & Sensible)</option>
              </select>
            </FormField>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--csi-border)]">
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="px-3 py-2 border border-[var(--csi-border)] rounded text-xs font-medium hover:bg-[var(--csi-bg)]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] disabled:opacity-50 text-white rounded text-xs font-medium shadow-2xs"
              >
                {isSubmitting ? "Enregistrement..." : "Appliquer le Rôle"}
              </button>
            </div>
          </form>
        </Dialog>

        {/* Modal Modification Utilisateur */}
        <Dialog
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Modifier l'Agent — ${selectedUser?.nom_utilisateur}`}
          description="Mise à jour des coordonnées et de l'état du compte."
          maxWidth="lg"
        >
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Nom" id="edit_nom">
                <input
                  id="edit_nom"
                  type="text"
                  required
                  value={editFormData.nom || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, nom: e.target.value })}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Prénom" optional id="edit_prenom">
                <input
                  id="edit_prenom"
                  type="text"
                  value={editFormData.prenom || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, prenom: e.target.value })}
                  className={inputClass}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Matricule de Service" optional id="edit_matricule">
                <input
                  id="edit_matricule"
                  type="text"
                  value={editFormData.matricule || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, matricule: e.target.value })}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Identifiant Unique" id="edit_username">
                <input
                  id="edit_username"
                  type="text"
                  required
                  value={editFormData.nom_utilisateur || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, nom_utilisateur: e.target.value })}
                  className={inputClass}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Adresse Email" id="edit_email">
                <input
                  id="edit_email"
                  type="email"
                  required
                  value={editFormData.email || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Téléphone (10 chiffres)" optional id="edit_tel">
                <input
                  id="edit_tel"
                  type="tel"
                  placeholder="0341234567"
                  value={editFormData.telephone || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, telephone: e.target.value })}
                  className={inputClass}
                />
              </FormField>
            </div>

            <FormField label="Statut du Compte" id="edit_statut">
              <select
                id="edit_statut"
                value={editFormData.statut || "ACTIF"}
                onChange={(e) => setEditFormData({ ...editFormData, statut: e.target.value as any })}
                className={selectClass}
              >
                <option value="ACTIF">ACTIF (Accès autorisé)</option>
                <option value="DESACTIVE">DESACTIVE (Accès bloqué)</option>
              </select>
            </FormField>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--csi-border)]">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-3 py-2 border border-[var(--csi-border)] rounded text-xs font-medium hover:bg-[var(--csi-bg)]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] disabled:opacity-50 text-white rounded text-xs font-medium shadow-2xs"
              >
                {isSubmitting ? "Enregistrement..." : "Sauvegarder les modifications"}
              </button>
            </div>
          </form>
        </Dialog>

        {/* Modal Confirmation de suppression */}
        <ConfirmDialog
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Suppression d'un compte utilisateur"
          description={`Êtes-vous sûr de vouloir supprimer définitivement le compte de ${userToDelete?.nom_utilisateur} (${userToDelete?.nom}) ? Cette opération révoquera immédiatement tous ses accès.`}
          confirmLabel="Supprimer définitivement"
          cancelLabel="Annuler"
          variant="danger"
          isLoading={isDeleting}
        />
      </div>
    </AppShell>
  );
}
