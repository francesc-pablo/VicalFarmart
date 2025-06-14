
"use client";

import Link from 'next/link';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, UserCircle, LogOut, LayoutDashboardIcon, ListOrdered, Search } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import type { UserRole } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation'; // Added useSearchParams
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Added Select
import { PRODUCT_REGIONS } from '@/lib/constants'; // Added PRODUCT_REGIONS

interface AuthStatus {
  isAuthenticated: boolean;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: UserRole | null;
}

export function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ isAuthenticated: false });
  
  // Initialize searchTerm and selectedRegion from URL query parameters
  const initialSearchTerm = searchParams.get('search') || "";
  const initialRegion = searchParams.get('region') || "All";

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);

  useEffect(() => {
    // Update local state if URL params change (e.g., browser back/forward)
    setSearchTerm(searchParams.get('search') || "");
    setSelectedRegion(searchParams.get('region') || "All");
  }, [searchParams]);

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
      const userName = localStorage.getItem("userName");
      const userEmail = localStorage.getItem("userEmail");
      const userRole = localStorage.getItem("userRole") as UserRole | null;
      setAuthStatus({ isAuthenticated, userName, userEmail, userRole });
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('authChange', checkAuth);

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
    window.dispatchEvent(new Event("authChange"));
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

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchTerm.trim()) {
      queryParams.set('search', searchTerm.trim());
    }
    if (selectedRegion && selectedRegion !== "All") {
      queryParams.set('region', selectedRegion);
    }
    router.push(`/market?${queryParams.toString()}`);
  };

  const SearchBarForm = ({ isMobile }: { isMobile?: boolean }) => (
    <form onSubmit={handleSearchSubmit} className={`flex w-full items-center gap-2 ${isMobile ? '' : 'flex-grow max-w-xl'}`}>
      <Input
        type="search"
        placeholder="Search products..."
        className="h-9 flex-grow"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search products"
      />
      <Select value={selectedRegion} onValueChange={setSelectedRegion}>
        <SelectTrigger className={`h-9 ${isMobile ? 'w-[130px]' : 'w-[150px]'}`}>
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Regions</SelectItem>
          {PRODUCT_REGIONS.map(region => (
            <SelectItem key={region} value={region}>{region}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" size="sm" variant="outline" className="h-9 px-3">
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-6 flex h-16 max-w-screen-2xl items-center justify-between gap-4">
        <Logo />
        <nav className="flex items-center gap-2 md:gap-4 flex-grow">
          <div className="hidden sm:flex flex-grow justify-center">
             <SearchBarForm />
          </div>
          
          <div className="flex items-center gap-2 md:gap-3 ml-auto">
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
             <Button variant="outline" size="icon" asChild className="h-9 w-9">
              <Link href="/checkout">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
              </Link>
            </Button>
          </div>
        </nav>
      </div>
      <div className="container px-6 pb-3 sm:hidden">
        <SearchBarForm isMobile />
      </div>
    </header>
  );
}
