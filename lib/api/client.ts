/**
 * Client HTTP standardisé pour communiquer avec l'API FastAPI CSI Sakaraha.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Helpers pour gestion du token en mémoire / sessionStorage
let memoryAccessToken: string | null = null;

export const tokenStorage = {
  getAccess: (): string | null => {
    if (typeof window === "undefined") return memoryAccessToken;
    return memoryAccessToken || sessionStorage.getItem("csi_access_token");
  },
  setAccess: (token: string | null) => {
    memoryAccessToken = token;
    if (typeof window !== "undefined") {
      if (token) sessionStorage.setItem("csi_access_token", token);
      else sessionStorage.removeItem("csi_access_token");
    }
  },
  getRefresh: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("csi_refresh_token");
  },
  setRefresh: (token: string | null) => {
    if (typeof window !== "undefined") {
      if (token) localStorage.setItem("csi_refresh_token", token);
      else localStorage.removeItem("csi_refresh_token");
    }
  },
  clear: () => {
    memoryAccessToken = null;
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("csi_access_token");
      localStorage.removeItem("csi_refresh_token");
      localStorage.removeItem("csi_user_session");
    }
  }
};

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  const headers = new Headers(options.headers || {});

  const token = tokenStorage.getAccess();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Tenter le refresh automatique en cas de 401 si un refresh token existe
  if (response.status === 401 && !endpoint.includes("/auth/")) {
    let refreshed = false;
    if (tokenStorage.getRefresh()) {
      refreshed = await tryRefreshToken();
    }
    if (refreshed) {
      headers.set("Authorization", `Bearer ${tokenStorage.getAccess()}`);
      response = await fetch(url, {
        ...options,
        headers,
      });
    } else {
      tokenStorage.clear();
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
  }

  if (!response.ok) {
    let errorDetail = "Une erreur est survenue";
    let errorData = null;
    try {
      errorData = await response.json();
      if (typeof errorData?.detail === "string") {
        errorDetail = errorData.detail;
      } else if (Array.isArray(errorData?.detail)) {
        errorDetail = errorData.detail.map((d: { msg?: string }) => d.msg || "Erreur de validation").join(", ");
      }
    } catch {
      // Ignorer l'erreur de parsing JSON si la réponse n'est pas du JSON
    }
    throw new ApiError(response.status, errorDetail, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

async function tryRefreshToken(): Promise<boolean> {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (data.access_token) {
      tokenStorage.setAccess(data.access_token);
      if (data.refresh_token) {
        tokenStorage.setRefresh(data.refresh_token);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
