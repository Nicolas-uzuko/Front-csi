/**
 * Contrats d'interfaces TypeScript alignés sur les schémas Pydantic du backend FastAPI CSI Sakaraha.
 */

export type RoleUtilisateur = "ADMIN" | "UTILISATEUR";
export type StatutUtilisateur = "ACTIF" | "DESACTIVE";

export interface Utilisateur {
  id: number;
  nom: string;
  prenom?: string | null;
  matricule?: string | null;
  nom_utilisateur: string;
  email: string;
  telephone?: string | null;
  role: RoleUtilisateur;
  statut: StatutUtilisateur;
  date_creation: string;
  date_modification: string;
}

export interface UtilisateurCreate {
  nom: string;
  prenom?: string | null;
  matricule?: string | null;
  nom_utilisateur: string;
  email: string;
  telephone?: string | null;
  mot_de_passe: string;
  role: RoleUtilisateur;
}

export interface UtilisateurUpdate {
  nom?: string;
  prenom?: string | null;
  matricule?: string | null;
  nom_utilisateur?: string;
  email?: string;
  telephone?: string | null;
  statut?: StatutUtilisateur;
}

export interface UtilisateurChangeRole {
  role: RoleUtilisateur;
}

export interface UtilisateurChangePassword {
  ancien_mot_de_passe: string;
  nouveau_mot_de_passe: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

/* ----------------- AUTHENTIFICATION ----------------- */

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface JWTPayload {
  sub: string;
  exp: number;
  type: string;
  role?: RoleUtilisateur;
  email?: string;
  nom_utilisateur?: string;
  nom?: string;
  prenom?: string;
  matricule?: string;
}

/* ----------------- COURRIERS ARRIVÉE (/3, /3S) ----------------- */

export interface CourrierArrivee {
  id_courrier: number;
  categorie: "/3" | "/3S" | string;
  categorie_archive: "A" | "B";
  fm?: string | null;
  to?: string | null;
  info?: string | null;
  heure_depart?: string | null;
  priorite?: "P" | "U" | "R" | string | null;
  indicatif?: string | null;
  numero_ordre?: string | null;
  numero_piece?: string | null;
  date_piece?: string | null;
  date_reception?: string | null;
  origine_piece?: string | null;
  corps_message?: string | null;
  analyse?: string | null;
  observation?: string | null;
}

export type CourrierArriveeCreate = Omit<CourrierArrivee, "id_courrier">;
export type CourrierArriveeUpdate = Partial<CourrierArriveeCreate>;

/* ----------------- COURRIERS DÉPART (/2, /4) ----------------- */

export interface CourrierDepart {
  id_courrier: number;
  categorie: "/2" | "/4" | string;
  categorie_archive: "A" | "B";
  fm?: string | null;
  to?: string | null;
  info?: string | null;
  heure_depart?: string | null;
  priorite?: "P" | "U" | "R" | string | null;
  indicatif?: string | null;
  reference_message?: string | null;
  objet?: string | null;
  date_piece?: string | null;
  ref?: string | null;
  corps_message?: string | null;
  observation?: string | null;
  signataire?: string | null;
  date_envoi?: string | null;
}

export type CourrierDepartCreate = Omit<CourrierDepart, "id_courrier">;
export type CourrierDepartUpdate = Partial<CourrierDepartCreate>;

/* ----------------- SERVICES COURANTS (ORDRES DE MISSION) ----------------- */

export interface ServiceCourant {
  id_service: number;
  grade_nom?: string | null;
  type_arme?: string | null;
  tenue?: string | null;
  moyen?: string | null;
  mission?: string | null;
  date_depart?: string | null;
  date_retour?: string | null;
  numero_ordre?: string | null;
  signataire?: string | null;
  // Fichier attaché (renseigné après un upload)
  fichier_nom?: string | null;
  fichier_mime?: string | null;
}

export type ServiceCourantCreate = Omit<ServiceCourant, "id_service">;
export type ServiceCourantUpdate = Partial<ServiceCourantCreate>;

/* ----------------- SITUATIONS PRISE D'ARME ----------------- */

export interface SituationPriseArme {
  id_situation: number;
  effectif_realise?: number | null;
  absent?: number | null;
  present?: number | null;
  indisponible?: number | null;
  sur_le_rang?: number | null;
  motif_absent?: string | null;
  motif_indisponible?: string | null;
  date_situation?: string | null;
}

export type SituationPriseArmeCreate = Omit<SituationPriseArme, "id_situation">;
export type SituationPriseArmeUpdate = Partial<SituationPriseArmeCreate>;

/* ----------------- PLAINTES (SENSIBLE / ADMIN) ----------------- */

export interface Plainte {
  id_plainte: number;
  numero_ordre?: string | null;
  nom_plaignant?: string | null;
  nom_personne_en_cause?: string | null;
  motif_plainte?: string | null;
  lieu_acte?: string | null;
  telephone_plaignant?: string | null;
  observation?: string | null;
}

export type PlainteCreate = Omit<Plainte, "id_plainte">;
export type PlainteUpdate = Partial<PlainteCreate>;

/* ----------------- PROCÈS-VERBAUX (SENSIBLE / ADMIN) ----------------- */

export interface ProcesVerbal {
  id_pv: number;
  numero_pv?: string | null;
  date_piece?: string | null;
  noms_enqueteurs?: string | null;
  analyse_sommaire?: string | null;
  personne_en_cause?: string | null;
  nature_affaire?: string | null;
  observations?: string | null;
}

export type ProcesVerbalCreate = Omit<ProcesVerbal, "id_pv">;
export type ProcesVerbalUpdate = Partial<ProcesVerbalCreate>;

/* ----------------- DOCUMENTS & ARCHIVES ----------------- */

export type CategorieArchive = "A" | "B";
export type TypeConfidentialite = "NON_CONFIDENTIEL" | "CONFIDENTIEL";
export type ModeConservation = "PHYSIQUE" | "NUMERIQUE" | "MIXTE";

export const TYPES_DOCUMENTS_CAT_A = [
  "CORRESPONDANCE_ARRIVEE_3",
  "CAHIER_ENREGISTREMENT_3",
  "COPIE_CORRESPONDANCE_2",
  "AVIS_MUTATION",
  "ORDRE_GENDARMERIE_NATIONALE",
  "REGISTRE_PERMISSIONNAIRES",
] as const;

export const TYPES_DOCUMENTS_CAT_B = [
  "CORRESPONDANCE_ARRIVEE_3S",
  "CAHIER_ENREGISTREMENT_3S",
  "COPIE_CORRESPONDANCE_4",
  "ARCHIVE_PROCES_VERBAL",
  "REGISTRE_PROCES_VERBAUX",
  "CAHIER_SERVICE",
  "BULLETIN_SERVICE",
] as const;

/**
 * Source unique de vérité pour les libellés FR lisibles des types d'archives.
 * Les clés sont les identifiants techniques envoyés au backend FastAPI.
 * Les valeurs sont les libellés métier affichés à l'utilisateur.
 */
export const ARCHIVE_TYPES_LABELS: Record<string, string> = {
  // Catégorie A — Archives non confidentielles
  CORRESPONDANCE_ARRIVEE_3:    "Correspondances reçues et enregistrées au /3",
  CAHIER_ENREGISTREMENT_3:     "Cahier d'enregistrement /3",
  COPIE_CORRESPONDANCE_2:      "Copies des correspondances /2",
  AVIS_MUTATION:               "Avis de mutation",
  ORDRE_GENDARMERIE_NATIONALE: "Ordres de la Gendarmerie Nationale",
  REGISTRE_PERMISSIONNAIRES:   "Registre des permissionnaires",
  // Catégorie B — Archives confidentielles
  CORRESPONDANCE_ARRIVEE_3S:   "Correspondances reçues et enregistrées au /3S",
  CAHIER_ENREGISTREMENT_3S:    "Cahier d'enregistrement /3S",
  COPIE_CORRESPONDANCE_4:      "Copies des correspondances /4",
  ARCHIVE_PROCES_VERBAL:       "Archives des P.V.",
  REGISTRE_PROCES_VERBAUX:     "Registre des P.V.",
  CAHIER_SERVICE:              "Cahier de service",
  BULLETIN_SERVICE:            "Bulletin de service",
};

/** Libellé FR lisible d'un type d'archive (retourne la clé brute si non trouvé). */
export function archiveTypeLabel(key: string): string {
  return ARCHIVE_TYPES_LABELS[key] ?? key;
}

export const CATEGORIES_ARCHIVE: Array<{
  value: CategorieArchive;
  label: string;
  confidentialite: TypeConfidentialite;
}> = [
  { value: "A", label: "Catégorie A — Archives non confidentielles", confidentialite: "NON_CONFIDENTIEL" },
  { value: "B", label: "Catégorie B — Archives confidentielles",     confidentialite: "CONFIDENTIEL" },
];

export interface DocumentArchive {
  id_document: number;
  table_source?: string | null;
  id_source?: number | null;
  categorie_archive: CategorieArchive;
  type_document: string;
  confidentialite: TypeConfidentialite;
  mode_conservation: ModeConservation;
  emplacement_physique?: string | null;
  nom_original?: string | null;
  extension?: string | null;
  mime_type?: string | null;
  taille_octets?: number | null;
  sha256?: string | null;
  date_import: string;
  importe_par_id?: number | null;
}

export interface DocumentPhysicalCreate {
  table_source?: string | null;
  id_source?: number | null;
  categorie_archive: CategorieArchive;
  type_document: string;
  confidentialite: TypeConfidentialite;
  mode_conservation: "PHYSIQUE";
  emplacement_physique: string;
}

/* ----------------- HISTORIQUE D'ACTION (AUDIT / ADMIN) ----------------- */

export interface HistoriqueAction {
  id_historique: number;
  utilisateur_id?: number | null;
  identifiant_utilisateur?: string | null;
  action: string;
  table_cible?: string | null;
  id_enregistrement_cible?: string | null;
  date_action: string;
  details?: Record<string, unknown> | null;
  adresse_ip?: string | null;
  succes?: boolean | null;
}
