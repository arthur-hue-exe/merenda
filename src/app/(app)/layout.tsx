
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader'; 
import { SidebarInset } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';


const pageTitles: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/stock': 'Gerenciamento de Estoque',
  // '/deliveries': 'Rastreamento de Entregas', // Removido
  '/consumption': 'Registro de Consumo',
  '/forecasting': 'Chat com IA', // Atualizado
  '/reports': 'Relatórios e Prestação de Contas',
};


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const currentPageKey = pathname.replace('/app', ''); // Ensure /app prefix is removed if present
  const pageTitle = pageTitles[currentPageKey] || 'Merenda Inteligente';


  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <AppHeader pageTitle={pageTitle} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}
