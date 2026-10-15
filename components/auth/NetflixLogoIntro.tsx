"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface NetflixLogoIntroProps {
  onComplete: () => void;
}

export default function NetflixLogoIntro({ onComplete }: NetflixLogoIntroProps) {
  // Phases :
  // "glow" : 0 - 1.1s (lueur mysterieuse, pulsation, ondes)
  // "reveal" : 1.1s - 2.8s (apparition du logo + faisceaux lumineux verticaux vert/or facon Netflix)
  // "zoom" : 2.8s - 3.8s (zoom avant dramatique plongeant dans le logo)
  // "fadeout" : 3.8s - 4.5s (fondu vers le formulaire de login)
  const [phase, setPhase] = useState<"glow" | "reveal" | "zoom" | "fadeout">("glow");
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 1100);
    const t2 = setTimeout(() => setPhase("zoom"), 2800);
    const t3 = setTimeout(() => {
      setPhase("fadeout");
      setIsExiting(true);
    }, 3800);
    const t4 = setTimeout(() => {
      onComplete();
    }, 4500);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden select-none transition-opacity duration-700 ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-label="Introduction cinematique CSI Sakaraha"
    >
      {/* Bouton Passer l'intro en haut a droite */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-6 right-6 z-50 text-white/50 hover:text-white text-xs font-medium tracking-widest uppercase px-3.5 py-1.5 rounded-full border border-white/10 hover:border-white/30 backdrop-blur-sm transition-all duration-300"
      >
        Passer &#10140;
      </button>

      {/* Fond cinematographique & vignette sombre */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_20%,_rgba(0,0,0,0.85)_80%,_#000000_100%)] z-10" />

      {/* Lueurs volumetriques d'ambiance */}
      <div
        className={`absolute w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 ${
          phase === "glow"
            ? "bg-[#24563B]/30 scale-75 animate-pulse"
            : phase === "reveal"
            ? "bg-[#34d399]/35 scale-125"
            : "bg-[#10b981]/50 scale-150"
        }`}
      />
      <div
        className={`absolute w-[350px] h-[350px] rounded-full blur-[100px] bg-amber-500/20 pointer-events-none transition-opacity duration-700 ${
          phase === "reveal" ? "opacity-100 scale-110" : "opacity-20 scale-75"
        }`}
      />

      {/* Faisceaux verticaux spectraux facon rubans Netflix */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-15">
        <div
          className={`relative w-[340px] h-full flex justify-between opacity-0 transition-opacity duration-700 ${
            phase === "reveal" || phase === "zoom" ? "!opacity-85" : ""
          }`}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-[2px] h-full opacity-60 netflix-light-beam"
              style={{
                background:
                  i % 3 === 0
                    ? "linear-gradient(to bottom, transparent, #24563B, #10b981, #34d399, transparent)"
                    : i % 3 === 1
                    ? "linear-gradient(to bottom, transparent, #064e3b, #059669, #6ee7b7, transparent)"
                    : "linear-gradient(to bottom, transparent, #d97706, #fbbf24, #fef08a, transparent)",
                animationDelay: `${(i * 0.07).toFixed(2)}s`,
                animationDuration: `${1.3 + (i % 5) * 0.2}s`,
                transform: phase === "zoom" ? `scaleY(3.5) scaleX(${1 + i * 0.25})` : "scaleY(1)",
                transition: "transform 1s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Ondes de choc circulaires (impact) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div
          className={`w-[220px] h-[220px] rounded-full border border-emerald-500/40 opacity-0 ${
            phase === "reveal" ? "animate-netflix-ripple" : ""
          }`}
        />
        <div
          className={`w-[220px] h-[220px] rounded-full border border-amber-400/30 opacity-0 ${
            phase === "reveal" ? "animate-netflix-ripple-delayed" : ""
          }`}
        />
      </div>

      {/* Logo CSI avec zoom cinematographique */}
      <div
        className={`relative z-20 flex flex-col items-center justify-center cursor-pointer transition-all duration-1000 ${
          phase === "glow"
            ? "opacity-0 scale-75 blur-md"
            : phase === "reveal"
            ? "opacity-100 scale-100 blur-0 netflix-logo-shine"
            : phase === "zoom"
            ? "scale-[7] opacity-0 blur-xl transition-all duration-1000 ease-in"
            : "scale-[10] opacity-0"
        }`}
        onClick={handleSkip}
      >
        <div className="relative w-36 h-36 md:w-44 md:h-44 flex items-center justify-center drop-shadow-[0_0_45px_rgba(36,86,59,0.9)]">
          <Image
            src="/logo.png"
            alt="Logo CSI Sakaraha"
            width={180}
            height={180}
            priority
            className="object-contain w-full h-full drop-shadow-[0_0_30px_rgba(52,211,153,0.7)]"
          />

          {/* Flash transversal qui balaye le logo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-full">
            <div className="netflix-shine-glare" />
          </div>
        </div>

        {/* Titre cinematographique sous le logo */}
        <div
          className={`mt-6 text-center transition-all duration-700 ${
            phase === "reveal" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="text-white font-extrabold text-2xl md:text-3xl tracking-[0.35em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-white to-emerald-200 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            CSI Sakaraha
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-amber-400" />
            <p className="text-amber-400/90 text-xs md:text-sm font-semibold tracking-[0.4em] uppercase">
              Gendarmerie Nationale
            </p>
            <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-amber-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
