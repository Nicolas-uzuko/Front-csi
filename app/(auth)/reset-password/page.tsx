"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api/endpoints";
import { FormField, inputClass } from "@/components/ui/FormField";

export default function ResetPasswordPage() {
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      const res = await api.auth.requestReset(email.trim());
      setMessage(res.message);
      setStep("confirm");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la demande");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || newPassword.length < 8) {
      setError("Le mot de passe doit comporter au moins 8 caractères, une majuscule et un chiffre.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.auth.confirmReset(token.trim(), newPassword);
      setMessage("Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la réinitialisation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--csi-bg)] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--csi-vert-inst)] text-white text-base font-bold mb-2">
            CSI
          </div>
          <h1 className="text-sm font-bold text-[var(--csi-vert-deep)] uppercase tracking-wider">
            Réinitialisation du mot de passe
          </h1>
        </div>

        <div className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-lg shadow-sm p-6">
          {message && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800">
              ✓ {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              ⚠️ {error}
            </div>
          )}

          {step === "request" ? (
            <form onSubmit={handleRequest} className="space-y-4">
              <p className="text-xs text-[var(--csi-text-secondary)]">
                Entrez votre adresse email enregistrée. Si elle correspond à un compte actif, des instructions vous seront transmises.
              </p>
              <FormField label="Email" id="email">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@gendarmerie.mg"
                  className={inputClass}
                  disabled={isSubmitting}
                />
              </FormField>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] disabled:opacity-50 text-white font-medium text-xs rounded transition-colors"
              >
                {isSubmitting ? "Envoi..." : "Envoyer la demande"}
              </button>

              <button
                type="button"
                onClick={() => setStep("confirm")}
                className="w-full text-center text-[11px] text-[var(--csi-vert-deep)] hover:underline pt-2 block"
              >
                Vous avez déjà un jeton de réinitialisation ?
              </button>
            </form>
          ) : (
            <form onSubmit={handleConfirm} className="space-y-4">
              <FormField label="Jeton de réinitialisation" id="token">
                <input
                  id="token"
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Jeton reçu"
                  className={inputClass}
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField
                label="Nouveau mot de passe"
                id="newPassword"
                hint="Au moins 8 caractères, une majuscule et un chiffre"
              >
                <input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField label="Confirmer le mot de passe" id="confirmPassword">
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  disabled={isSubmitting}
                />
              </FormField>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[var(--csi-vert-inst)] hover:bg-[var(--csi-vert-hover)] disabled:opacity-50 text-white font-medium text-xs rounded transition-colors"
              >
                {isSubmitting ? "Mise à jour..." : "Valider le nouveau mot de passe"}
              </button>
            </form>
          )}

          <div className="mt-4 pt-3 border-t border-[var(--csi-border-subtle)] text-center">
            <Link
              href="/login"
              className="text-[11px] text-[var(--csi-text-secondary)] hover:text-black"
            >
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
