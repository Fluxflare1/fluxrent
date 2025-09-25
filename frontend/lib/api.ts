// lib/api.ts
import axios, { type AxiosRequestConfig } from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const API_BASE_URL = `${API_BASE}/api`;

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

const TOKEN_KEY = "fluxrent:jwt";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

// Auth header interceptor
API.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Query string builder
 */
function buildQuery(params: Record<string, any> = {}): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) {
      v.forEach((val) => q.append(k, String(val)));
    } else {
      q.append(k, String(v));
    }
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

/**
 * Auth endpoints
 */
export async function signIn(email: string, password: string) {
  const res = await API.post("/users/token/", { email, password });
  if (res.data?.access) {
    setToken(res.data.access);
    return res.data;
  }
  throw new Error("Invalid response from auth server");
}

export async function signOut() {
  removeToken();
  return;
}

export async function getCurrentUser() {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await API.get("/users/me/");
    return res.data;
  } catch {
    removeToken();
    return null;
  }
}

export async function requestAccess(payload: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}) {
  const res = await API.post("/users/request-access/", payload);
  return res.data;
}

/**
 * Client-side listings endpoints (axios)
 */
export async function fetchListings(params?: Record<string, any>) {
  const res = await API.get("/properties/listings/", { params });
  return res.data;
}

export async function fetchListing(id: string) {
  const res = await API.get(`/properties/listings/${id}/`);
  return res.data;
}

/**
 * Server-side listings endpoints (native fetch, for Next.js server components)
 */
export async function fetchListingsServer(
  params: Record<string, any> = {},
  options: RequestInit = {}
) {
  const query = buildQuery(params);
  const res = await fetch(`${API_BASE_URL}/properties/listings/${query}`, {
    next: { revalidate: 60 },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch listings: ${res.status} ${text}`);
  }
  return res.json();
}

export async function fetchListingServer(id: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE_URL}/properties/listings/${id}/`, {
    next: { revalidate: 60 },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch listing: ${res.status} ${text}`);
  }
  return res.json();
}

export default API;
