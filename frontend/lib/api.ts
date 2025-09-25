// lib/api.ts
import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
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

// auth header
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

// Sign in - exchange credentials for JWT (expects backend JWT)
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
  // If you maintain refresh tokens/cookies, call backend logout here.
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

/**
 * Request access (signup-like flow)
 * POST /users/request-access/  (backend must expose endpoint)
 * payload: { first_name, last_name, email, phone }
 */
export async function requestAccess(payload: { first_name: string; last_name: string; email: string; phone: string; }) {
  const res = await API.post("/users/request-access/", payload);
  return res.data;
}

/**
 * Generic helpers for listings (used later)
 */
export async function fetchListings(params?: Record<string, any>) {
  const res = await API.get("/properties/listings/", { params });
  return res.data;
}

export default API;
