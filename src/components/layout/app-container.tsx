
"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { ScanLine, History, Settings, BarChart3, Ticket, LogOut, UserCircle, Users } from "lucide-react"; 
import { useAuth } from "@/contexts/AuthContext";

const baseNavItems = [
  { href: "/", label: "Pindai Grafik", icon: <ScanLine />, roles: ['admin', 'guest'] },
  { href: "/history", label: "Riwayat", icon: <History />, roles: ['admin'] },
  { href: "/admin/user-data", label: "Data Pengguna", icon: <Users />, roles: ['admin'] },
  { href: "/token", label: "Token Saya", icon: <Ticket />, roles: ['guest'] },
  { href: "/admin/ai-integration", label: "Integrasi AI", icon: <Settings />, roles: ['admin'] },
];

export default function AppContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();

  const filteredNavItems = baseNavItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  if (!currentUser) {
    return <div className="flex justify-center items-center h-screen">Mengalihkan ke login...</div>;
  }

  return (
    <>
      <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r">
        <SidebarHeader className="p-0">
          <div className="flex h-14 items-center justify-between border-b px-4 py-2 lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-primary hover:text-sidebar-primary/90">
              <BarChart3 className="h-6 w-6" />
              <span>ChartSight AI</span>
            </Link>
            <SidebarTrigger className="hidden md:flex" />
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2 flex flex-col justify-between">
          <SidebarMenu>
            {filteredNavItems.map(item => (
              <SidebarMenuItem key={item.href} className="mb-1">
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton 
                    isActive={pathname === item.href} 
                    tooltip={{content: item.label, side:"right", align:"center"}}
                    className="justify-start"
                  >
                    {item.icon}
                    <span className="group-data-[collapsible=icon]:sr-only">{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <SidebarFooter className="p-2 border-t mt-auto">
            <div className="flex items-center gap-2 p-2 rounded-md bg-sidebar-accent/10 mb-2 group-data-[collapsible=icon]:justify-center">
                <UserCircle className="h-5 w-5 text-sidebar-foreground"/>
                <span className="text-xs text-sidebar-foreground group-data-[collapsible=icon]:sr-only">
                    {currentUser.username} ({currentUser.role})
                </span>
            </div>
            <SidebarMenuButton
              onClick={logout}
              tooltip={{content: "Logout", side:"right", align:"center"}}
              className="justify-start w-full"
              variant="ghost"
            >
              <LogOut />
              <span className="group-data-[collapsible=icon]:sr-only">Logout</span>
            </SidebarMenuButton>
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 shadow-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden"> 
            <SidebarTrigger /> 
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span className="text-lg">ChartSight AI</span>
            </Link>
        </header>
        <main className="flex flex-1 flex-col bg-background">
          <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
            {children}
          </div>
          <footer className="border-t bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-3 text-center text-sm text-muted-foreground">
              ChartSight AI &copy; {new Date().getFullYear()}. Analisis AI hanya untuk tujuan informasi dan bukan merupakan nasihat keuangan.
            </div>
          </footer>
        </main>
      </SidebarInset>
    </>
  );
}
