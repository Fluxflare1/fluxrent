// components/AuthProvider.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

// 1. Create the Auth Context
const AuthContext = createContext<{
  user: any | null;
  loginAction?: (data: any) => Promise<void>;
  logOut?: () => void;
}>({ user: null });

// 2. Create the Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);

  // Add your login logic here
  const loginAction = async (data: any) => {
    // ... your API call for login
    // setUser(res.data.user);
  };

  const logOut = () => {
    setUser(null);
    // ... clear tokens from localStorage
  };

  return (
    <AuthContext.Provider value={{ user, loginAction, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Create the custom hook for consuming the context
export function useAuth() {
  return useContext(AuthContext);
}
