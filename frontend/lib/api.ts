// frontend/lib/api.ts
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Non-authenticated axios instance
export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Authenticated axios instance (token added at runtime)
export const authApi = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const TOKEN_KEY = "fluxrent:jwt";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

// Attach interceptor to authApi
authApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API endpoints map
export const ENDPOINTS = {
  token: "/api/auth/token/",
  tokenRefresh: "/api/auth/token/refresh/",
  me: "/api/users/me/",
  register: "/api/users/register/",
  kyc: "/api/users/kyc/",
  passwordReset: "/api/auth/password-reset/",
  passwordResetConfirm: "/api/auth/password-reset/confirm/",
  listings: "/api/properties/listings/",
};


export async function fetchListings(params?: Record<string, any>) {
  const res = await api.get("/api/properties/listings/", { params });
  return res.data;
}



// --- Add signOut ---
export async function signOut() {
  try {
    // If you have backend logout endpoint:
    await axios.post(`${API_URL}/auth/logout/`, {}, { withCredentials: true });

    // If using only frontend-based JWT, just clear token from localStorage:
    localStorage.removeItem("token");
    return true;
  } catch (err) {
    console.error("Sign out failed:", err);
    return false;
  }
}
