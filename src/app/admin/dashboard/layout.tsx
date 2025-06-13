
"use client";
import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { LogOut, UserCog } from "lucide-react"; // Changed icon for admin
import { SidebarNav } from "@/components/layout/SidebarNav";
import { ADMIN_DASHBOARD_NAV_ITEMS } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation'; // Added for logout redirection
import { useToast } from '@/hooks/use-toast'; // Added for logout toast

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    window.dispatchEvent(new Event("authChange")); // Notify other components like header
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push("/auth/login");
  };

  // Mock admin user details, in a real app this would come from auth state
  const adminName = localStorage.getItem("userName") || "Admin User";
  const adminEmail = localStorage.getItem("userEmail") || "admin@agrishop.com";
  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase();


  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen">
        <Sidebar className="border-r bg-sidebar text-sidebar-foreground" collapsible="icon">
          <SidebarHeader className="p-4 flex items-center justify-between">
            <Logo className="text-xl group-data-[collapsible=icon]:hidden" />
             <div className="group-data-[collapsible=icon]:hidden">
                <SidebarTrigger className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent" />
             </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarNav items={ADMIN_DASHBOARD_NAV_ITEMS} />
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-sidebar-border">
             <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/40x40.png" alt="Admin Avatar" data-ai-hint="person face formal" />
                <AvatarFallback>{getInitials(adminName)}</AvatarFallback>
              </Avatar>
              <div className="group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-medium">{adminName}</p>
                <p className="text-xs text-sidebar-foreground/70">{adminEmail}</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start mt-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:aspect-square" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
              <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
         <SidebarInset className="flex-1 bg-background">
           <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
            <div className="md:hidden"> {/* Only show trigger on mobile for the main content area's sidebar */}
              <SidebarTrigger className="text-foreground hover:text-accent-foreground hover:bg-accent" />
            </div>
            {/* Admin-specific header elements if any */}
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
