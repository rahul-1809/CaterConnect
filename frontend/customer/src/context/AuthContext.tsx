"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, OTPRequestResult } from "@/lib/types";
import { getCurrentUser, logoutUser, requestOTP, verifyOTP } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (onSuccessCallback?: () => void) => void;
  closeAuthModal: () => void;
  requestOtp: (phone: string, countryCode?: string) => Promise<{ challengeId?: string; devOtp?: string | null; error?: string }>;
  verifyOtp: (challengeId: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = "caterconnect_session_token";
const USER_STORAGE_KEY = "caterconnect_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [onSuccessCb, setOnSuccessCb] = useState<(() => void) | null>(null);

  // Restore session from localStorage & verify with /auth/me on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);

        if (storedToken) {
          setToken(storedToken);
        }
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // ignore JSON parse failure
          }
        }

        // Always check fresh /auth/me if token exists
        if (storedToken) {
          const res = await getCurrentUser(storedToken);
          if (res.data) {
            setUser(res.data);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data));
          } else {
            // token expired or invalid
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            localStorage.removeItem(USER_STORAGE_KEY);
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Error restoring session:", err);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const openAuthModal = (callback?: () => void) => {
    if (callback) {
      setOnSuccessCb(() => callback);
    } else {
      setOnSuccessCb(null);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setOnSuccessCb(null);
  };

  const requestOtp = async (phone: string, countryCode: string = "+91") => {
    const res = await requestOTP(phone, countryCode);
    if (res.error || !res.data) {
      return { error: res.error || "Failed to request OTP" };
    }
    return {
      challengeId: res.data.challenge_id,
      devOtp: res.data.dev_otp,
    };
  };

  const verifyOtp = async (challengeId: string, otp: string) => {
    const res = await verifyOTP(challengeId, otp);
    if (res.error || !res.data) {
      return { success: false, error: res.error || "Verification failed" };
    }

    const { user: authedUser, session_token } = res.data;
    setUser(authedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authedUser));

    if (session_token) {
      setToken(session_token);
      localStorage.setItem(TOKEN_STORAGE_KEY, session_token);
    }

    setIsAuthModalOpen(false);

    if (onSuccessCb) {
      onSuccessCb();
      setOnSuccessCb(null);
    }

    return { success: true };
  };

  const logout = async () => {
    try {
      await logoutUser(token || undefined);
    } catch {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        requestOtp,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
