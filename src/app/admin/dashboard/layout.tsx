
"use client";
import React, { useState, useEffect, Suspense } from 'react';
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
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from '@/types';


export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().role === 'admin') {
          setAdminUser({ id: docSnap.id, ...docSnap.data() } as User);
        } else {
          // Not an admin or no user doc, redirect
          toast({ title: "Access Denied", description: "You must be an admin to view this page.", variant: "destructive" });
          router.push("/login");
        }
      } else {
        // Not logged in, redirect
        router.push("/login");
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router, toast]);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push("/login");
    } catch (error) {
      console.error("Logout Error: ", error);
      toast({ title: "Logout Failed", description: "An error occurred during logout.", variant: "destructive" });
    }
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase();

  if (isLoading || !adminUser) {
    return <div className="flex h-screen items-center justify-center">Loading Admin Dashboard...</div>;
  }

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
                <AvatarImage src={adminUser.avatarUrl || "https://placehold.co/40x40.png"} alt="Admin Avatar" data-ai-hint="person face formal" />
                <AvatarFallback>{getInitials(adminUser.name)}</AvatarFallback>
              </Avatar>
              <div className="group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-medium">{adminUser.name}</p>
                <p className="text-xs text-sidebar-foreground/70">{adminUser.email}</p>
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
          <main className="flex-1 p-4 sm:p-6 overflow-auto">
            <Suspense>
              {children}
            </Suspense>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
