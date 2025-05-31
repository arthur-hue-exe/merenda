
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Archive,
  UtensilsCrossed,
  MessageSquare, 
  FileText,
  Utensils,
  PanelLeftOpen,
  PanelRightOpen,
  Lightbulb // Ícone para Ideias de Receitas/Biblioteca Culinária
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/stock', label: 'Estoque', icon: Archive },
  { href: '/consumption', label: 'Consumo', icon: UtensilsCrossed },
  { href: '/forecasting', label: 'Chat IA', icon: MessageSquare },
  { href: '/recipe-ideas', label: 'Chat Culinário', icon: Lightbulb }, // Novo item para Chat de Receitas
  { href: '/reports', label: 'Relatórios', icon: FileText },
];

export function AppSidebar() {
  const pathname = usePathname(); 
  const { open, toggleSidebar, isMobile, setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2 p-2" onClick={handleLinkClick}>
          <Utensils className="h-8 w-8 text-primary-foreground group-data-[collapsible=icon]:mx-auto" />
          <span className="text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Merenda Inteligente
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, className: "bg-primary text-primary-foreground" }}
                  onClick={handleLinkClick}
                  className={pathname === item.href ? 
                    "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" :
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2 group-data-[collapsible=icon]:hidden">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={toggleSidebar}>
          {open ? <PanelLeftOpen className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
          <span>{open ? "Recolher Menu" : "Expandir Menu"}</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
