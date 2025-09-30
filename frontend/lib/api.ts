// frontend/lib/api.ts
import axios from "axios";

// ------------------------------
// API Base
// ------------------------------
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({ baseURL: API_BASE_URL });
export const authApi = axios.create({ baseURL: API_BASE_URL });

// ------------------------------
// Endpoints map (single definition only!)
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

  // --- Boost ---
  boost: {
    packages: "/api/properties/boost/packages/",
    purchase: "/api/properties/boost/purchase/",
    confirm: "/api/properties/boost/confirm/",
  },

  // --- Admin ---
  admin: {
    boostAnalytics: "/api/properties/admin/boost-analytics/",
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
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: string;
  lng?: number;
  lat?: number;
  radius?: number;
  ordering?: string;
  page?: number;
  page_size?: number;
}

// ------------------------------
// Helpers for Listings
// ------------------------------
export async function fetchListings(filters: ListingFilters = {}) {
  const res = await api.get(ENDPOINTS.properties.base, { params: filters });
  return res.data;
}

export async function fetchListingsServer(filters: ListingFilters = {}) {
  const q = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    q.append(k, String(v));
  });
  const url = `${API_BASE_URL}${ENDPOINTS.properties.base}?${q.toString()}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch listings: ${res.status}`);
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
export function getToken() {
  return localStorage.getItem("access_token");
}

export function setToken(token: string) {
  localStorage.setItem("access_token", token);
}

export function removeToken() {
  localStorage.removeItem("access_token");
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

// ------------------------------
// Default export
// ------------------------------
export default {
  api,
  authApi,
  ENDPOINTS,
  fetchListings,
  fetchListingsServer,
  fetchListingServer,
  getToken,
  setToken,
  removeToken,
  API_BASE_URL,
};
