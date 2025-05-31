
"use client";
import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded credentials for prototype
const MOCK_USER = "admin";
const MOCK_PASS = "admin123";
const AUTH_COOKIE_NAME = 'merendaInteligenteAuth';

// Helper function to manage cookies
const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return undefined;
};

const setCookie = (name: string, value: string, days: number) => {
  if (typeof document === 'undefined') return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
};

const removeCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = name + '=; Max-Age=-99999999; path=/';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check cookie for persisted auth state
    const authCookie = getCookie(AUTH_COOKIE_NAME);
    if (authCookie === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (user: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    if (user === MOCK_USER && pass === MOCK_PASS) {
      setIsAuthenticated(true);
      setCookie(AUTH_COOKIE_NAME, 'true', 1); // Set cookie for 1 day
      setIsLoading(false);
      return true;
    }
    setIsAuthenticated(false);
    removeCookie(AUTH_COOKIE_NAME);
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    removeCookie(AUTH_COOKIE_NAME);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
