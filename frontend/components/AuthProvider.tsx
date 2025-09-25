// frontend/components/AuthProvider.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api, authApi, ENDPOINTS } from "@/lib/api";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "@/lib/auth";
import axios from "axios";

type User = {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (payload: any) => Promise<any>;
  refreshToken: () => Promise<string | null>;
  isAuthenticated: boolean;
  fetchUser: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // attach axios interceptor to add access token
  useEffect(() => {
    const requestInterceptor = authApi.interceptors.request.use((cfg) => {
      const access = getAccessToken();
      if (access) cfg.headers = { ...cfg.headers, Authorization: `Bearer ${access}` };
      return cfg;
    });

    const responseInterceptor = authApi.interceptors.response.use(
      (res) => res,
      async (error) => {
        const originalRequest = error.config;
        if (!originalRequest) return Promise.reject(error);

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newAccess = await refreshAccessToken();
          if (newAccess) {
            originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
            return authApi(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      authApi.interceptors.request.eject(requestInterceptor);
      authApi.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  async function refreshAccessToken(): Promise<string | null> {
    const refresh = getRefreshToken();
    if (!refresh) {
      clearTokens();
      setUser(null);
      return null;
    }
    try {
      const { data } = await api.post(ENDPOINTS.tokenRefresh, { refresh });
      if (data?.access) {
        setTokens({ access: data.access, refresh });
        return data.access;
      }
      clearTokens();
      setUser(null);
      return null;
    } catch (err) {
      clearTokens();
      setUser(null);
      return null;
    }
  }

  async function fetchUser() {
    try {
      const { data } = await authApi.get(ENDPOINTS.me);
      setUser(data);
      return data;
    } catch (err) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // On mount try to refresh or load user if token exists
    (async () => {
      const access = getAccessToken();
      if (!access) {
        // try to refresh to get access
        const got = await refreshAccessToken();
        if (got) {
          await fetchUser();
          return;
        }
      } else {
        await fetchUser();
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post(ENDPOINTS.token, { email, password });
    if (!data?.access) throw new Error("Invalid login response");
    setTokens({ access: data.access, refresh: data.refresh });
    await fetchUser();
  }

  function logout() {
    clearTokens();
    setUser(null);
  }

  async function register(payload: any) {
    // Register then optionally set tokens if API returns tokens
    const { data } = await api.post(ENDPOINTS.register, payload);
    return data;
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    refreshToken: refreshAccessToken,
    isAuthenticated: !!user,
    fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
