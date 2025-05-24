
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
} from "@/components/ui/sidebar";
import { ScanLine, History, Settings, Briefcase, BarChart3 } from "lucide-react"; // Added Briefcase, BarChart3 for variety

const navItems = [
  { href: "/", label: "Pindai Grafik", icon: <ScanLine /> },
  { href: "/history", label: "Riwayat", icon: <History /> },
  { href: "/admin/ai-integration", label: "Integrasi AI", icon: <Settings />, adminOnly: true },
];

// Placeholder for admin check, in a real app this would use auth context
const isAdmin = true; 

export default function AppContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <>
      <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r">
        <SidebarHeader className="p-0">
          <div className="flex h-14 items-center justify-between border-b px-4 py-2 lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-primary hover:text-sidebar-primary/90">
              <BarChart3 className="h-6 w-6" />
              <span>ChartSight AI</span>
            </Link>
            {/* SidebarTrigger for desktop to collapse/expand icon sidebar, hidden on mobile as sidebar becomes a sheet */}
            <SidebarTrigger className="hidden md:flex" />
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
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
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 shadow-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden"> {/* Mobile header */}
            <SidebarTrigger /> {/* This trigger opens the sheet on mobile */}
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
