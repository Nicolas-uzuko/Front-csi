"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { JWTPayload, RoleUtilisateur } from "@/types/api";
import { tokenStorage } from "@/lib/api/client";
import { api } from "@/lib/api/endpoints";

export interface UserSession {
  id: number;
  role: RoleUtilisateur;
  nom_utilisateur?: string;
  email?: string;
  nom?: string;
  prenom?: string;
  matricule?: string;
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifiant: string, mot_de_passe: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Décodeur JWT léger et sécurisé sans dépendance externe
function parseJwt(token: string): JWTPayload | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restaurer la session existante
    const token = tokenStorage.getAccess();
    if (token) {
      const payload = parseJwt(token);
      if (payload && payload.exp * 1000 > Date.now()) {
        const storedUser = localStorage.getItem("csi_user_session");
        let sessionData: UserSession = {
          id: parseInt(payload.sub, 10),
          role: payload.role || "UTILISATEUR",
          email: payload.email,
          nom_utilisateur: payload.nom_utilisateur,
          nom: payload.nom,
          prenom: payload.prenom,
          matricule: payload.matricule,
        };
        if (storedUser) {
          try {
            sessionData = { ...sessionData, ...JSON.parse(storedUser) };
          } catch {
            // parse error fallback
          }
        }
        setUser(sessionData);
      } else {
        tokenStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (identifiant: string, mot_de_passe: string) => {
    const res = await api.auth.login(identifiant, mot_de_passe);
    tokenStorage.setAccess(res.access_token);
    tokenStorage.setRefresh(res.refresh_token);

    const payload = parseJwt(res.access_token);
    const sessionData: UserSession = {
      id: payload ? parseInt(payload.sub, 10) : 1,
      role: payload?.role || "UTILISATEUR",
      nom_utilisateur: payload?.nom_utilisateur || identifiant,
      email: payload?.email || (identifiant.includes("@") ? identifiant : undefined),
      nom: payload?.nom,
      prenom: payload?.prenom,
      matricule: payload?.matricule,
    };

    setUser(sessionData);
    localStorage.setItem("csi_user_session", JSON.stringify(sessionData));
  };

  const logout = () => {
    tokenStorage.clear();
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    } else {
      setUser(null);
    }
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur de AuthProvider");
  }
  return context;
}
