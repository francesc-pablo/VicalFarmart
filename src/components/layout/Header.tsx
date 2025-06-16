
"use client";

import Link from 'next/link';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, UserCircle, LogOut, LayoutDashboardIcon, ListOrdered, Search as SearchIcon } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import type { UserRole } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
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
} from "@/components/ui/select";
import { PRODUCT_REGIONS, GHANA_REGIONS_AND_TOWNS } from '@/lib/constants';
import { useIsMobile } from '@/hooks/use-mobile';

interface AuthStatus {
  isAuthenticated: boolean;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: UserRole | null;
}

const NO_REGION_SELECTED = "All";
const NO_TOWN_SELECTED = "All";
const HEADER_SCROLL_THRESHOLD = 50; // Pixels after which header hiding can occur

export function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ isAuthenticated: false });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>(NO_REGION_SELECTED);
  const [selectedTown, setSelectedTown] = useState<string>(NO_TOWN_SELECTED);
  const [availableTowns, setAvailableTowns] = useState<string[]>([]);

  const _isMobileHookValue = useIsMobile();
  const [isMobileClient, setIsMobileClient] = useState(false);
  const [showHeaderOnMobile, setShowHeaderOnMobile] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    setIsMobileClient(_isMobileHookValue);
  }, [_isMobileHookValue]);

  useEffect(() => {
    if (!isMobileClient) {
      setShowHeaderOnMobile(true); // Always show header on non-mobile
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < HEADER_SCROLL_THRESHOLD) { // Near the top, always show
        setShowHeaderOnMobile(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > HEADER_SCROLL_THRESHOLD) { // Scrolling down
        setShowHeaderOnMobile(false);
      } else if (currentScrollY < lastScrollY) { // Scrolling up
        setShowHeaderOnMobile(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      setLastScrollY(0); // Reset scroll position on cleanup
    };
  }, [isMobileClient, lastScrollY]);


  useEffect(() => {
    setSearchTerm(searchParams.get('search') || "");
    const urlRegion = searchParams.get('region') || NO_REGION_SELECTED;
    const urlTown = searchParams.get('town') || NO_TOWN_SELECTED;

    if (urlRegion !== selectedRegion) {
        setSelectedRegion(urlRegion);
    }
    if (urlTown !== selectedTown) {
        setSelectedTown(urlTown);
    }
  }, [searchParams]); // removed selectedRegion, selectedTown to avoid loops

  useEffect(() => {
    if (selectedRegion && selectedRegion !== NO_REGION_SELECTED) {
      const townsForCurrentRegion = GHANA_REGIONS_AND_TOWNS[selectedRegion] || [];
      setAvailableTowns(townsForCurrentRegion);
      if (selectedTown !== NO_TOWN_SELECTED && !townsForCurrentRegion.includes(selectedTown)) {
        setSelectedTown(NO_TOWN_SELECTED);
      }
    } else {
      setAvailableTowns([]);
      if (selectedTown !== NO_TOWN_SELECTED) {
        setSelectedTown(NO_TOWN_SELECTED);
      }
    }
  }, [selectedRegion, selectedTown]);

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
    if (selectedRegion && selectedRegion !== NO_REGION_SELECTED) {
      queryParams.set('region', selectedRegion);
    }
    if (selectedRegion && selectedRegion !== NO_REGION_SELECTED && selectedTown && selectedTown !== NO_TOWN_SELECTED && availableTowns.includes(selectedTown)) {
      queryParams.set('town', selectedTown);
    }
    router.push(`/market?${queryParams.toString()}`);
  };

  const handleRegionChange = (newRegion: string) => {
    setSelectedRegion(newRegion);
    setSelectedTown(NO_TOWN_SELECTED);
  };
  
  const SearchBarForm = ({ isMobileLayout }: { isMobileLayout?: boolean }) => (
    <form onSubmit={handleSearchSubmit} className={`flex w-full items-center gap-2 ${isMobileLayout ? 'flex-col sm:flex-row' : 'flex-grow max-w-2xl'}`}>
      <Input
        type="search"
        placeholder="Search products..."
        className={`h-9 ${isMobileLayout ? 'w-full' : 'flex-grow'}`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search products"
      />
      <div className={`flex gap-2 ${isMobileLayout ? 'w-full' : ''}`}>
        <Select value={selectedRegion} onValueChange={handleRegionChange}>
          <SelectTrigger className={`h-9 ${isMobileLayout ? 'flex-1' : 'w-[150px] sm:w-[130px] md:w-[150px]'}`}>
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_REGION_SELECTED}>All Regions</SelectItem>
            {PRODUCT_REGIONS.map(region => (
              <SelectItem key={region} value={region}>{region}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
            value={selectedTown}
            onValueChange={setSelectedTown}
            disabled={selectedRegion === NO_REGION_SELECTED || availableTowns.length === 0}
        >
          <SelectTrigger className={`h-9 ${isMobileLayout ? 'flex-1' : 'w-[150px] sm:w-[130px] md:w-[150px]'}`}>
            <SelectValue placeholder="Town" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_TOWN_SELECTED}>All Towns</SelectItem>
            {availableTowns.map((town) => (
              <SelectItem key={town} value={town}>
                {town}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" size="sm" variant="outline" className={`h-9 px-3 ${isMobileLayout ? 'w-full sm:w-auto' : ''}`}>
        <SearchIcon className="h-4 w-4" />
        <span className={`${isMobileLayout ? '' : 'sr-only md:not-sr-only md:ml-1'}`}>{isMobileLayout ? 'Search' : ''}</span>
         <span className="sr-only">Search</span>
      </Button>
    </form>
  );

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md transition-transform duration-300 ease-in-out ${isMobileClient && !showHeaderOnMobile ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="container px-4 sm:px-12 flex h-16 max-w-screen-2xl items-center justify-between gap-2 sm:gap-4">
        <div className="hidden sm:block"> <Logo /> </div>
        <div className="sm:hidden"> <Logo className="text-xl" /></div>

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
      {/* Changed prop name from isMobile to isMobileLayout to avoid conflict */}
      <div className="container px-4 sm:px-12 pb-3 sm:hidden border-t border-border/40 pt-3">
        <SearchBarForm isMobileLayout />
      </div>
    </header>
  );
}
