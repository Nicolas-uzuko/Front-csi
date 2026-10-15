"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import NetflixLogoIntro from "@/components/auth/NetflixLogoIntro";

/* ─── Icône utilisateur ─── */
function IconUser({ size = 18 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

/* ─── Icône cadenas ─── */
function IconLockField({ size = 18 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/* ─── Icône alerte ─── */
function IconAlertCircleSmall({ size = 16 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export default function LoginPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <>
      {showIntro && <NetflixLogoIntro onComplete={() => setShowIntro(false)} />}

      <div className="min-h-screen bg-[var(--csi-bg)] flex items-center justify-center p-4 login-perspective overflow-hidden">
        <div className="w-full max-w-5xl bg-[var(--csi-surface)] rounded-3xl shadow-xl overflow-hidden flex min-h-[560px] animate-login-card">

        {/* ── Colonne gauche : Formulaire ── */}
        <div className="flex-1 flex flex-col justify-center px-10 py-12 lg:px-14 animate-login-left">

          {/* Logo */}
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center cursor-pointer logo-spin-hover" title="CSI Sakaraha">
                <Image
                  src="/logo.png"
                  alt="Logo CSI Sakaraha"
                  width={40}
                  height={40}
                  className="object-contain w-full h-full drop-shadow-xs"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--csi-vert-deep)] tracking-wider uppercase leading-none">
                  CSI Sakaraha
                </p>
                <p className="text-[10px] text-[var(--csi-text-secondary)] leading-tight mt-0.5">
                  Gendarmerie Nationale
                </p>
              </div>
            </div>
            {/* ligne décorative sous le logo */}
            <div className="mt-3 w-12 h-0.5 rounded-full bg-[var(--csi-vert-inst)]" />
          </div>

          {/* Titre */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="text-[var(--csi-vert-inst)] shrink-0">
                <path d="M8 1v14M1 8h14M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <h1 className="text-3xl font-bold text-[var(--csi-text-primary)] tracking-tight">
                Bienvenue
              </h1>
            </div>
            <p className="text-sm text-[var(--csi-text-secondary)] ml-6">
              Connectez-vous à votre espace de travail
            </p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              <IconAlertCircleSmall size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Champ identifiant */}
            <div>
              <label htmlFor="identifiant" className="text-[11px] font-semibold text-[var(--csi-text-secondary)] uppercase tracking-wider mb-1.5 block">
                Identifiant
              </label>
              <div className="relative">
                <input
                  id="identifiant"
                  type="text"
                  autoComplete="username"
                  value={identifiant}
                  onChange={(e) => setIdentifiant(e.target.value)}
                  placeholder="Nom d'utilisateur, email ou matricule"
                  required
                  disabled={isSubmitting}
                  className="w-full pl-4 pr-11 py-3 text-sm rounded-xl border border-[var(--csi-border)] bg-[var(--csi-vert-light)] text-[var(--csi-text-primary)] placeholder:text-[var(--csi-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--csi-vert-inst)]/30 focus:border-[var(--csi-vert-inst)] transition-all disabled:opacity-60"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--csi-text-secondary)] pointer-events-none">
                  <IconUser size={17} />
                </span>
              </div>
            </div>

            {/* Champ mot de passe */}
            <div>
              <label htmlFor="mot_de_passe" className="text-[11px] font-semibold text-[var(--csi-text-secondary)] uppercase tracking-wider mb-1.5 block">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="mot_de_passe"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                  className="w-full pl-4 pr-20 py-3 text-sm rounded-xl border border-[var(--csi-border)] bg-[var(--csi-vert-light)] text-[var(--csi-text-primary)] placeholder:text-[var(--csi-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--csi-vert-inst)]/30 focus:border-[var(--csi-vert-inst)] transition-all disabled:opacity-60"
                />
                {/* Bouton toggle affichage mot de passe */}
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={isSubmitting}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-9 top-1/2 -translate-y-1/2 text-[var(--csi-text-secondary)] hover:text-[var(--csi-vert-inst)] transition-colors disabled:opacity-40"
                >
                  {showPassword ? (
                    /* Œil barré (masquer) */
                    <svg xmlns="http://www.w3.org/2000/svg" width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    /* Œil ouvert (afficher) */
                    <svg xmlns="http://www.w3.org/2000/svg" width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
                {/* Icône cadenas */}
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--csi-text-secondary)] pointer-events-none">
                  <IconLockField size={17} />
                </span>
              </div>
            </div>

            {/* Ligne mot de passe oublié + bouton Se connecter */}
            <div className="flex items-center justify-between pt-1">
              <a
                href="/reset-password"
                className="text-xs text-[var(--csi-text-secondary)] hover:text-[var(--csi-vert-inst)] transition-colors underline underline-offset-2"
              >
                Mot de passe oublié ?
              </a>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-[var(--csi-vert-deep)] hover:bg-[var(--csi-vert-hover)] disabled:opacity-60 text-white text-sm font-semibold rounded-full shadow-md transition-all duration-200 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Vérification…
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
            </div>
          </form>

          {/* Pied de page */}
          <p className="mt-10 text-[10px] text-[var(--csi-text-secondary)] text-center leading-relaxed">
            Accès strictement réservé au personnel habilité<br />de la Gendarmerie Nationale de Madagascar.
          </p>
        </div>

        {/* ── Colonne droite : Panneau décoratif ── */}
        <div className="hidden lg:flex flex-col items-center justify-center w-[45%] bg-[var(--csi-vert-deep)] relative overflow-hidden p-10 animate-login-right">

          {/* Cercles décoratifs de fond */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <div className="w-[500px] h-[500px] rounded-full border border-white/5 absolute" />
            <div className="w-[380px] h-[380px] rounded-full border border-white/5 absolute" />
            <div className="w-[260px] h-[260px] rounded-full border border-white/[0.08] absolute" />
          </div>

          {/* Grille subtile */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* Forme octogonale */}
          <div
            className="relative z-10 flex items-center justify-center"
            style={{
              width: 280,
              height: 280,
              clipPath:
                "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 8px 48px rgba(0,0,0,0.4)",
            }}
          >
            <div className="flex flex-col items-center justify-center gap-3 text-center p-8">
              {/* Logo */}
              <div className="w-24 h-24 flex items-center justify-center cursor-pointer logo-spin-hover" title="CSI Sakaraha">
                <Image
                  src="/logo.png"
                  alt="Logo CSI Sakaraha"
                  width={96}
                  height={96}
                  className="object-contain w-full h-full drop-shadow-md"
                />
              </div>
              <p className="text-white/90 font-bold text-sm tracking-wide uppercase leading-tight">
                CSI<br />Sakaraha
              </p>
              <div className="w-8 h-0.5 rounded-full bg-white/40" />
              <p className="text-white/55 text-[11px] tracking-wide text-center leading-snug">
                Gestion Documentaire<br />&amp; Registres
              </p>
            </div>
          </div>

          {/* Texte bas */}
          <div className="absolute bottom-8 left-0 right-0 text-center z-10">
            <p className="text-white/30 text-[10px] tracking-widest uppercase">
              Gendarmerie Nationale · Madagascar
            </p>
          </div>
        </div>

      </div>
    </div>
    </>
  );
}

