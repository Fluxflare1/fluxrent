// frontend/lib/api.ts
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const API_BASE_URL = `${API_BASE}`.replace(/\/$/, "");

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

/**
 * Simple fetch wrapper that includes Authorization header when available.
 * Uses fetch instead of axios for server-compatibility with Next.js server components.
 */
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

// API endpoints map
export const ENDPOINTS = {
  // Auth
  token: "/api/auth/token/",
  tokenRefresh: "/api/auth/token/refresh/",
  me: "/api/users/me/",
  register: "/api/users/register/",
  kyc: "/api/users/kyc/",
  passwordReset: "/api/auth/password-reset/",
  passwordResetConfirm: "/api/auth/password-reset/confirm/",

  // Properties
  listings: "/api/properties/listings/",
  properties: {
    listings: "/api/properties/listings/",
  },

  // Wallet
  wallet: {
    base: "/api/wallets/",
    balances: "/api/wallets/",
    validate: "/api/wallets/validate/",
    fundConfirm: "/api/wallets/fund/confirm/",
    transfer: "/api/wallets/transfer/",
    standingOrders: "/api/wallets/standing_orders/",
    bills: "/api/wallets/bills/",
    savings: "/api/wallets/savings/",
    withdrawals: "/api/wallets/withdrawals/",
    transactions: "/api/wallets/transactions/",
    audit: "/api/wallet/audit/",
    refunds: "/api/wallet/refunds/",
    disputes: "/api/wallet/disputes/",
  },

  // Finance
  finance: {
    fees: "/api/finance/fees/",
    audits: "/api/finance/audits/",
    disputes: "/api/finance/disputes/",
  },

  // Payments
  payments: {
    webhook: "/api/payments/webhooks/paystack/",
  },
};

// Helpers
export async function fetchListings(params?: Record<string, any>) {
  const res = await api.get(ENDPOINTS.listings, { params });
  return res.data;
}

export async function signOut() {
  try {
    removeToken();
    return true;
  } catch (err) {
    console.error("Sign out failed:", err);
    return false;
  }
}

export default { 
  apiFetch, 
  ENDPOINTS, 
  getToken, 
  setToken, 
  removeToken, 
  api, 
  authApi,
  API_BASE_URL 
};






export const ENDPOINTS = {
  wallet: {
    refunds: "/api/wallet/refunds/",
    audit: "/api/wallet/audit/",
    disputes: "/api/wallet/disputes/",
  },
};
