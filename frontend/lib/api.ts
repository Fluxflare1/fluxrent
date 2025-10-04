// frontend/lib/api.ts
import axios, { AxiosResponse, AxiosError } from 'axios';

// ------------------------------
// API Base Configuration
// ------------------------------
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create Axios instance with defaults
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000, // 10 seconds
});

// Create auth API instance
export const authApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// ------------------------------
// Request Interceptor - Add Auth Token
// ------------------------------
const setupRequestInterceptor = (instance: typeof api | typeof authApi) => {
  instance.interceptors.request.use(
    (config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );
};

setupRequestInterceptor(api);
setupRequestInterceptor(authApi);

// ------------------------------
// Response Interceptor - Handle Token Refresh & Errors
// ------------------------------
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          });

          const { access } = refreshResponse.data;
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error: No response received');
    } else {
      console.error('Request Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// ------------------------------
// Core API Fetch Function
// ------------------------------
export const apiFetch = async <T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<T> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// ------------------------------
// Listing Functions
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

export const fetchListings = async (filters: ListingFilters = {}) => {
  const response = await api.get(ENDPOINTS.properties.base, { params: filters });
  return response.data;
};

export const fetchListingsServer = async (filters: ListingFilters = {}) => {
  const q = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    q.append(k, String(v));
  });
  
  const url = `${API_BASE_URL}${ENDPOINTS.properties.base}?${q.toString()}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  
  if (!res.ok) throw new Error(`Failed to fetch listings: ${res.status}`);
  return res.json();
};

export const fetchListingServer = async (id: string) => {
  const url = `${API_BASE_URL}${ENDPOINTS.properties.detail(id)}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  
  if (!res.ok) throw new Error(`Failed to fetch listing ${id}`);
  return res.json();
};

// ------------------------------
// Endpoints Configuration
// ------------------------------
export const ENDPOINTS = {
  auth: {
    token: '/auth/token/',
    tokenRefresh: '/auth/token/refresh/',
    passwordReset: '/auth/password-reset/',
    passwordResetConfirm: '/auth/password-reset/confirm/',
  },
  users: {
    me: '/users/me/',
    requestAccess: '/users/request-access/',
    kyc: (id: string) => `/users/${id}/kyc/`,
    setPassword: (id: string) => `/users/${id}/set_password/`,
  },
  properties: {
    base: '/properties/listings/',
    detail: (id: number | string) => `/properties/listings/${id}/`,
    search: '/properties/?ordering=-ranking_score',
  },
  wallet: {
    base: '/wallets/',
    transactions: '/wallets/transactions/',
  },
  rents: {
    tenancies: '/rents/tenancies/',
    invoices: '/rents/invoices/',
    payments: '/rents/payments/',
  },
  bills: {
    invoices: '/bills/invoices/',
    items: '/bills/items/',
  },
  finance: {
    fees: '/finance/fees/',
    audits: '/finance/audits/',
    disputes: '/finance/disputes/',
  },
  payments: {
    webhook: '/payments/webhooks/paystack/',
  },
} as const;

// ------------------------------
// Auth Helper Functions
// ------------------------------
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

export const setTokens = (access: string, refresh: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }
};

export const removeTokens = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

export const signOut = async (): Promise<boolean> => {
  try {
    removeTokens();
    return true;
  } catch (err) {
    console.error('Sign out failed:', err);
    return false;
  }
};

// ------------------------------
// Default Export as Object
// ------------------------------
export default {
  api,
  authApi,
  ENDPOINTS,
  getToken,
  setTokens,
  removeTokens,
  signOut,
  API_BASE_URL,
  apiFetch,
  fetchListings,
  fetchListingsServer,
  fetchListingServer,
};
