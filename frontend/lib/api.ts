// frontend/lib/api.ts
import axios from "axios";

// ------------------------------
// Base API URL
// ------------------------------
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const API_BASE_URL = `${API_BASE.replace(/\/$/, "")}/api`;

// ------------------------------
// Axios instances
// ------------------------------
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ------------------------------
// Auth token management
// ------------------------------
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

// Attach token interceptor
authApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ------------------------------
// Fetch wrapper (server-friendly)
// ------------------------------
export async function apiFetch(
  path: string,
  opts: RequestInit = {},
  expectJson = true
): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(opts.headers as Record<string, string> || {}),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "same-origin",
    ...opts,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    let payload: any = text;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
    const err: any = new Error("API request failed");
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  if (!expectJson) return res;
  return res.json();
}

// ------------------------------
// Endpoints map
// ------------------------------
export const ENDPOINTS = {
  // --- Auth & Users ---
  auth: {
    token: "/auth/token/",
    tokenRefresh: "/auth/token/refresh/",
    passwordReset: "/auth/password-reset/",
    passwordResetConfirm: "/auth/password-reset/confirm/",
  },
  users: {
    me: "/users/me/",
    register: "/users/register/",
    kyc: "/users/kyc/",
  },

  // --- Properties / Listings ---
  properties: {
    base: "/properties/listings/",
    detail: (id: number | string) => `/properties/listings/${id}/`,
    boost: (id: number | string) => `/properties/${id}/boost/`,
    search: "/properties/?ordering=-ranking_score",
  },

  // --- Wallet ---
  wallet: {
    base: "/wallets/",
    balances: "/wallets/",
    validate: "/wallets/validate/",
    fundConfirm: "/wallets/fund/confirm/",
    transfer: "/wallets/transfer/",
    standingOrders: "/wallets/standing_orders/",
    bills: "/wallets/bills/",
    savings: "/wallets/savings/",
    withdrawals: "/wallets/withdrawals/",
    transactions: "/wallets/transactions/",
    audit: "/wallet/audit/",
    refunds: "/wallet/refunds/",
    disputes: "/wallet/disputes/",
  },

  // --- Finance ---
  finance: {
    fees: "/finance/fees/",
    audits: "/finance/audits/",
    disputes: "/finance/disputes/",
  },

  // --- Payments ---
  payments: {
    webhook: "/payments/webhooks/paystack/",
  },

  // --- Rent Management ---
  rents: {
    tenancies: "/rents/tenancies/",
    invoices: "/rents/invoices/",
    payments: "/rents/payments/",
    lateFeeRules: "/rents/late-fee-rules/",
    reports: "/rents/reports/",
  },
};

// ------------------------------
// Filters typing
// ------------------------------
export interface ListingFilters {
  search?: string;
  min_price?: number;
  max_price?: number;
  property_type?: string; // e.g. "apartment", "house"
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: string; // e.g. "furnished", "unfurnished"
  lng?: number;
  lat?: number;
  radius?: number; // km
  ordering?: string; // e.g. "-price" or "price"
  page?: number;
  page_size?: number;
}

// ------------------------------
// Helpers for Listings
// ------------------------------

// Client-side fetch (axios)
export async function fetchListings(filters: ListingFilters = {}) {
  const res = await api.get(ENDPOINTS.properties.base, { params: filters });
  return res.data;
}

// Server-side fetch (Next.js)
export async function fetchListingsServer(filters: ListingFilters = {}) {
  const q = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    q.append(k, String(v));
  });
  const url = `${API_BASE_URL}${ENDPOINTS.properties.base}?${q.toString()}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch listings: ${res.status}`);
  }
  return res.json();
}

export async function fetchListingServer(id: string) {
  const url = `${API_BASE_URL}${ENDPOINTS.properties.detail(id)}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch listing ${id}`);
  return res.json();
}

// ------------------------------
// Auth Helpers
// ------------------------------
export async function signOut() {
  try {
    removeToken();
    return true;
  } catch (err) {
    console.error("Sign out failed:", err);
    return false;
  }
}

// ------------------------------
// Default export
// ------------------------------
export default {
  api,
  authApi,
  apiFetch,
  ENDPOINTS,
  getToken,
  setToken,
  removeToken,
  fetchListings,
  fetchListingsServer,
  fetchListingServer,
  API_BASE_URL,
};
