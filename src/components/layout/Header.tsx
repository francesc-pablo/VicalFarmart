
"use client";

import Link from 'next/link';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { ShoppingCart, UserCircle, LogOut, LayoutDashboardIcon, ListOrdered } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import type { UserRole } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

interface AuthStatus {
  isAuthenticated: boolean;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: UserRole | null;
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ isAuthenticated: false });

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
      const userName = localStorage.getItem("userName");
      const userEmail = localStorage.getItem("userEmail");
      const userRole = localStorage.getItem("userRole") as UserRole | null;
      setAuthStatus({ isAuthenticated, userName, userEmail, userRole });
    };

    checkAuth(); // Initial check
    window.addEventListener('storage', checkAuth); // Listen for storage changes from other tabs
    window.addEventListener('authChange', checkAuth); // Listen for custom auth change event

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    setAuthStatus({ isAuthenticated: false });
    window.dispatchEvent(new Event("authChange")); // Notify other components
    router.push("/login");
  };

  const getUserInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const isMarketActive = pathname === '/' || pathname === '/market' || pathname.startsWith('/market/');


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-4">
          <Link
            href="/market"
            className={cn(
              "text-sm font-medium transition-colors rounded-md px-3 py-1 border",
              isMarketActive
                ? "text-primary font-semibold border-primary bg-primary/5"
                : "text-foreground/70 hover:text-foreground border-border hover:border-primary/50"
            )}
          >
            Market
          </Link>

          {authStatus.isAuthenticated ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://placehold.co/40x40.png?text=${getUserInitials(authStatus.userName)}`} alt={authStatus.userName || "User"} data-ai-hint="person face"/>
                      <AvatarFallback>{getUserInitials(authStatus.userName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{authStatus.userName || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {authStatus.userEmail || "No email"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(authStatus.userRole === 'customer' || authStatus.userRole === 'seller') && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/profile"><UserCircle className="mr-2 h-4 w-4" /> My Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/my-orders"><ListOrdered className="mr-2 h-4 w-4" /> My Orders</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {authStatus.userRole === 'admin' && (
                     <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard"><LayoutDashboardIcon className="mr-2 h-4 w-4" /> Admin Dashboard</Link>
                     </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
           <Button variant="outline" size="icon" asChild>
            <Link href="/checkout">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
