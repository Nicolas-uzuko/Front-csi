"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableSkeleton } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { FormField, inputClass, selectClass } from "@/components/ui/FormField";
import { api } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth/context";
import { Utilisateur, UtilisateurCreate, RoleUtilisateur } from "@/types/api";

const LIMIT = 25;

export default function UtilisateursPage() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<Utilisateur[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Utilisateur | null>(null);
  const [newRole, setNewRole] = useState<RoleUtilisateur>("UTILISATEUR");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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



  const handleOpenCreate = () => {
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
      loadData(skip);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Erreur lors de la création de l'utilisateur");
    } finally {
      setIsSubmitting(false);
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
      loadData(skip);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Erreur lors de la modification du rôle");
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
                      <button
                        onClick={() => handleOpenRoleModal(u)}
                        className="px-2 py-1 text-xs border border-[var(--csi-border)] rounded hover:bg-[var(--csi-bg)] text-[var(--csi-text-primary)] transition-colors"
                      >
                        Rôle
                      </button>
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
              <FormField label="Rôle Attribué" id="role_u">
                <select
                  id="role_u"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleUtilisateur })}
                  className={selectClass}
                  required
                >
                  <option value="UTILISATEUR">UTILISATEUR (Registres courants)</option>
                  <option value="ADMIN">ADMIN (Accès total & sensible)</option>
                </select>
              </FormField>

              <FormField
                label="Mot de passe Initial"
                id="mdp_u"
                hint="Au moins 8 car., 1 majuscule, 1 chiffre"
              >
                <input
                  id="mdp_u"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.mot_de_passe}
                  onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
                  className={inputClass}
                />
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
      </div>
    </AppShell>
  );
}
