
"use client";
import type React from 'react';
import { AuthProvider } from './AuthContext';
import { AppDataProvider } from './AppDataContext';
import { SidebarProvider } from "@/components/ui/sidebar";


export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <AppDataProvider>
        <SidebarProvider>
         {children}
        </SidebarProvider>
      </AppDataProvider>
    </AuthProvider>
  );
};
