"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useIntegratedAuth } from "@/src/libs/useIntegratedAuth";
import { User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
    loading: boolean;
    initialLoading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useIntegratedAuth();
  
    if (auth.initialLoading) {
      return <div></div>
  }

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthentication() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthentication must be within an AuthProvider");
  }
  return context;
}
