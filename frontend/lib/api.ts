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

// ------------------------------
// Request Interceptor - Add Auth Token
// ------------------------------
api.interceptors.request.use(
  (config) => {
    // Safely access localStorage only on client side
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

// ------------------------------
// Response Interceptor - Handle Token Refresh & Errors
// ------------------------------
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          // Attempt to refresh tokens
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          });

          const { access } = refreshResponse.data;
          localStorage.setItem('access_token', access);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error status (4xx, 5xx)
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error: No response received');
    } else {
      // Request setup error
      console.error('Request Error:', error.message);
    }

    return Promise.reject(error);
  }
);

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
  ENDPOINTS,
  getToken,
  setTokens,
  removeTokens,
  signOut,
  API_BASE_URL,
};
