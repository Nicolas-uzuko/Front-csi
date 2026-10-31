import { apiClient, tokenStorage } from "./client";
import {
  CourrierArrivee,
  CourrierArriveeCreate,
  CourrierArriveeUpdate,
  CourrierDepart,
  CourrierDepartCreate,
  CourrierDepartUpdate,
  DocumentArchive,
  DocumentPhysicalCreate,
  HistoriqueAction,
  PaginatedResponse,
  Plainte,
  PlainteCreate,
  PlainteUpdate,
  ProcesVerbal,
  ProcesVerbalCreate,
  ProcesVerbalUpdate,
  ServiceCourant,
  ServiceCourantCreate,
  ServiceCourantUpdate,
  SituationPriseArme,
  SituationPriseArmeCreate,
  SituationPriseArmeUpdate,
  TokenResponse,
  Utilisateur,
  UtilisateurChangePassword,
  UtilisateurChangeRole,
  UtilisateurCreate,
  UtilisateurUpdate,
} from "@/types/api";

export const api = {
  // Auth
  auth: {
    login: (identifiant: string, mot_de_passe: string) =>
      apiClient<TokenResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifiant, mot_de_passe }),
      }),
    requestReset: (email: string) =>
      apiClient<{ message: string }>("/auth/password-reset/request", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    confirmReset: (token: string, nouveau_mot_de_passe: string) =>
      apiClient<void>("/auth/password-reset/confirm", {
        method: "POST",
        body: JSON.stringify({ token, nouveau_mot_de_passe }),
      }),
  },

  // Courriers Arrivée
  courriersArrivee: {
    list: (skip = 0, limit = 50, categorie?: string) => {
      const q = new URLSearchParams({ skip: String(skip), limit: String(limit) });
      if (categorie) q.set("categorie", categorie);
      return apiClient<PaginatedResponse<CourrierArrivee>>(`/courriers-arrivee?${q}`);
    },
    get: (id: number) => apiClient<CourrierArrivee>(`/courriers-arrivee/${id}`),
    create: (data: CourrierArriveeCreate) =>
      apiClient<CourrierArrivee>("/courriers-arrivee", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: CourrierArriveeUpdate) =>
      apiClient<CourrierArrivee>(`/courriers-arrivee/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiClient<void>(`/courriers-arrivee/${id}`, {
        method: "DELETE",
      }),
  },

  // Courriers Départ
  courriersDepart: {
    list: (skip = 0, limit = 50, categorie?: string) => {
      const q = new URLSearchParams({ skip: String(skip), limit: String(limit) });
      if (categorie) q.set("categorie", categorie);
      return apiClient<PaginatedResponse<CourrierDepart>>(`/courriers-depart?${q}`);
    },
    get: (id: number) => apiClient<CourrierDepart>(`/courriers-depart/${id}`),
    create: (data: CourrierDepartCreate) =>
      apiClient<CourrierDepart>("/courriers-depart", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: CourrierDepartUpdate) =>
      apiClient<CourrierDepart>(`/courriers-depart/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiClient<void>(`/courriers-depart/${id}`, {
        method: "DELETE",
      }),
  },

  // Services Courants (Ordres de Mission)
  servicesCourants: {
    list: (skip = 0, limit = 50) =>
      apiClient<PaginatedResponse<ServiceCourant>>(`/services-courants?skip=${skip}&limit=${limit}`),
    get: (id: number) => apiClient<ServiceCourant>(`/services-courants/${id}`),
    create: (data: ServiceCourantCreate) =>
      apiClient<ServiceCourant>("/services-courants", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: ServiceCourantUpdate) =>
      apiClient<ServiceCourant>(`/services-courants/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiClient<void>(`/services-courants/${id}`, {
        method: "DELETE",
      }),
    // Upload d'un fichier attaché à un ordre de mission
    uploadFichier: (id: number, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiClient<DocumentArchive>(`/services-courants/${id}/upload`, {
        method: "POST",
        body: formData,
      });
    },
    // Info du fichier attaché
    getFichierInfo: (id: number) =>
      apiClient<DocumentArchive>(`/services-courants/${id}/fichier-info`),
    // URL de téléchargement du fichier
    downloadFichierBlob: async (id: number): Promise<{ blob: Blob; filename: string }> => {
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const token = tokenStorage.getAccess();
      const res = await fetch(`${base}/services-courants/${id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Impossible de télécharger le fichier");
      const disposition = res.headers.get("Content-Disposition");
      let filename = `ordre_mission_${id}`;
      if (disposition && disposition.includes("filename=")) {
        const matches = disposition.match(/filename\*?=['"']?(?:UTF-8'')?([^'";\\n]+)['"']?/i);
        if (matches && matches[1]) filename = decodeURIComponent(matches[1]);
      }
      const blob = await res.blob();
      return { blob, filename };
    },
  },

  // Situations Prise d'Arme
  situations: {
    list: (skip = 0, limit = 50) =>
      apiClient<PaginatedResponse<SituationPriseArme>>(`/situations-prise-arme?skip=${skip}&limit=${limit}`),
    get: (id: number) => apiClient<SituationPriseArme>(`/situations-prise-arme/${id}`),
    create: (data: SituationPriseArmeCreate) =>
      apiClient<SituationPriseArme>("/situations-prise-arme", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: SituationPriseArmeUpdate) =>
      apiClient<SituationPriseArme>(`/situations-prise-arme/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiClient<void>(`/situations-prise-arme/${id}`, {
        method: "DELETE",
      }),
  },

  // Plaintes
  plaintes: {
    list: (skip = 0, limit = 50) =>
      apiClient<PaginatedResponse<Plainte>>(`/plaintes?skip=${skip}&limit=${limit}`),
    get: (id: number) => apiClient<Plainte>(`/plaintes/${id}`),
    create: (data: PlainteCreate) =>
      apiClient<Plainte>("/plaintes", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: PlainteUpdate) =>
      apiClient<Plainte>(`/plaintes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiClient<void>(`/plaintes/${id}`, {
        method: "DELETE",
      }),
  },

  // Procès-Verbaux
  procesVerbaux: {
    list: (skip = 0, limit = 50) =>
      apiClient<PaginatedResponse<ProcesVerbal>>(`/proces-verbaux?skip=${skip}&limit=${limit}`),
    get: (id: number) => apiClient<ProcesVerbal>(`/proces-verbaux/${id}`),
    create: (data: ProcesVerbalCreate) =>
      apiClient<ProcesVerbal>("/proces-verbaux", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: ProcesVerbalUpdate) =>
      apiClient<ProcesVerbal>(`/proces-verbaux/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiClient<void>(`/proces-verbaux/${id}`, {
        method: "DELETE",
      }),
  },

  // Documents & Archives
  documents: {
    list: (skip = 0, limit = 50, categorie_archive?: "A" | "B", table_source?: string) => {
      const q = new URLSearchParams({ skip: String(skip), limit: String(limit) });
      if (categorie_archive) q.set("categorie_archive", categorie_archive);
      if (table_source) q.set("table_source", table_source);
      return apiClient<PaginatedResponse<DocumentArchive>>(`/documents?${q}`);
    },
    get: (id: number) => apiClient<DocumentArchive>(`/documents/${id}`),
    createPhysical: (data: DocumentPhysicalCreate) =>
      apiClient<DocumentArchive>("/documents", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    upload: (formData: FormData) =>
      apiClient<DocumentArchive>("/documents/upload", {
        method: "POST",
        body: formData,
      }),
    delete: (id: number) =>
      apiClient<void>(`/documents/${id}`, {
        method: "DELETE",
      }),
    downloadUrl: (id: number) => {
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      return `${base}/documents/${id}/download`;
    },
    downloadBlob: async (id: number): Promise<{ blob: Blob; filename: string }> => {
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const token = tokenStorage.getAccess();
      const res = await fetch(`${base}/documents/${id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Impossible de télécharger le document");
      const disposition = res.headers.get("Content-Disposition");
      let filename = `document_${id}`;
      if (disposition && disposition.includes("filename=")) {
        const matches = disposition.match(/filename\*?=['"]?(?:UTF-8'')?([^'";\n]+)['"]?/i);
        if (matches && matches[1]) filename = decodeURIComponent(matches[1]);
      }
      const blob = await res.blob();
      return { blob, filename };
    },
  },

  // Utilisateurs
  utilisateurs: {
    checkAdminExists: () =>
      apiClient<{ admin_exists: boolean }>("/utilisateurs/admin-exists"),
    list: (skip = 0, limit = 50) =>
      apiClient<PaginatedResponse<Utilisateur>>(`/utilisateurs?skip=${skip}&limit=${limit}`),
    get: (id: number) => apiClient<Utilisateur>(`/utilisateurs/${id}`),
    create: (data: UtilisateurCreate) =>
      apiClient<Utilisateur>("/utilisateurs", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: UtilisateurUpdate) =>
      apiClient<Utilisateur>(`/utilisateurs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    changeRole: (id: number, data: UtilisateurChangeRole) =>
      apiClient<Utilisateur>(`/utilisateurs/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiClient<void>(`/utilisateurs/${id}`, {
        method: "DELETE",
      }),
    changeMyPassword: (data: UtilisateurChangePassword) =>
      apiClient<void>("/utilisateurs/me/password", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Audit
  audit: {
    list: (skip = 0, limit = 50, action?: string, table_cible?: string) => {
      const q = new URLSearchParams({ skip: String(skip), limit: String(limit) });
      if (action) q.set("action", action);
      if (table_cible) q.set("table_cible", table_cible);
      return apiClient<PaginatedResponse<HistoriqueAction>>(`/audit?${q}`);
    },
  },
};
