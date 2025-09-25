// lib/api.ts
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_BASE_URL = `${API_BASE}/api`;

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: false
});

const TOKEN_KEY = "fluxrent:jwt";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

function removeToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

// Auth header interceptor
API.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export async function requestAccess(payload: { first_name: string; last_name: string; email: string; phone: string; }) {
  const res = await API.post("/users/request-access/", payload);
  return res.data;
}

/**
 * Listings endpoints - using axios for consistency
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
 * Server-side fetch functions (for Next.js server components)
 * These use native fetch and are separate from the axios instance
 */
export async function fetchListingsServer() {
  const res = await fetch(`${API_BASE_URL}/properties/listings/`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch listings");
  return res.json();
}

export async function fetchListingServer(id: string) {
  const res = await fetch(`${API_BASE_URL}/properties/listings/${id}/`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch listing");
  return res.json();
}

export default API;
