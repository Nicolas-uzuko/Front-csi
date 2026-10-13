"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { FormField, inputClass } from "@/components/ui/FormField";

export default function LoginPage() {
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifiant.trim() || !motDePasse) {
      setError("Veuillez renseigner votre identifiant et votre mot de passe.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(identifiant.trim(), motDePasse);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Échec de la connexion. Vérifiez vos identifiants.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--csi-bg)] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        {/* En-tête Institutionnelle */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--csi-vert-inst)] text-white text-lg font-bold shadow-sm mb-3">
            CSI
          </div>
          <h1 className="text-base font-bold text-[var(--csi-vert-deep)] uppercase tracking-wider">
            CSI Sakaraha
          </h1>
          <p className="text-xs text-[var(--csi-text-secondary)] font-medium">
            Gendarmerie Nationale de Madagascar
          </p>
          <div className="mt-2 inline-block px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-[var(--csi-vert-soft)] text-[var(--csi-vert-deep)]">
            Système de Gestion Documentaire & Registres
          </div>
        </div>

        {/* Formulaire de Connexion */}
        <div className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-semibold text-[var(--csi-text-primary)] mb-4 pb-2 border-b border-[var(--csi-border-subtle)]">
            Authentification Sécurisée
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Identifiant (Nom utilisateur, Email ou Matricule)" id="identifiant">
              <input
                id="identifiant"
                type="text"
                autoComplete="username"
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                placeholder="Ex: admin ou matricule"
                required
                className={inputClass}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Mot de passe" id="mot_de_passe">
              <input
                id="mot_de_passe"
                type="password"
                autoComplete="current-password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="••••••••"
                required
                className={inputClass}
                disabled={isSubmitting}
              />
            </FormField>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] disabled:opacity-50 text-white font-medium text-xs rounded transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Vérification en cours..." : "Accéder à l'application"}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-[var(--csi-border-subtle)] text-center">
            <a
              href="/reset-password"
              className="text-[11px] text-[var(--csi-vert-deep)] hover:underline"
            >
              Mot de passe oublié ?
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] text-[var(--csi-text-secondary)]">
          Accès strictement réservé au personnel habilité de la Gendarmerie.
        </p>
      </div>
    </div>
  );
}
