
"use client";

import Link from 'next/link';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, UserCircle, LogOut, LayoutDashboardIcon, ListOrdered, Search as SearchIcon, MapPin } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import type { UserRole } from '@/types';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { useCart } from '@/context/CartContext';
import { PRODUCT_REGIONS, GHANA_REGIONS_AND_TOWNS } from '@/lib/constants';

interface AuthStatus {
  isAuthenticated: boolean;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: UserRole | null;
}

const HEADER_SCROLL_THRESHOLD = 50;

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ isAuthenticated: false });
  const { cartCount } = useCart();

  // State for search filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedTown, setSelectedTown] = useState("All");
  const [availableTowns, setAvailableTowns] = useState<string[]>([]);

  const _isMobileHookValue = useIsMobile();
  const [isMobileClient, setIsMobileClient] = useState(false);
  const [showHeaderOnMobile, setShowHeaderOnMobile] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Conditionally show search bar based on path
  const showSearchBar = pathname !== '/market';

  useEffect(() => {
    setIsMobileClient(_isMobileHookValue);
  }, [_isMobileHookValue]);

  useEffect(() => {
    if (!isMobileClient) {
      setShowHeaderOnMobile(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < HEADER_SCROLL_THRESHOLD) {
        setShowHeaderOnMobile(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > HEADER_SCROLL_THRESHOLD) {
        setShowHeaderOnMobile(false);
      } else if (currentScrollY < lastScrollY) {
        setShowHeaderOnMobile(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      setLastScrollY(0);
    };
  }, [isMobileClient, lastScrollY]);
  
  // Effect to sync URL params with local state
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || "");
    setSelectedRegion(searchParams.get('region') || "All");
    setSelectedTown(searchParams.get('town') || "All");
  }, [searchParams]);

  // Effect to manage available towns based on selected region
  useEffect(() => {
    if (selectedRegion && selectedRegion !== "All") {
      const townsForRegion = GHANA_REGIONS_AND_TOWNS[selectedRegion] || [];
      setAvailableTowns(townsForRegion);
      if (selectedTown !== 'All' && !townsForRegion.includes(selectedTown)) {
          setSelectedTown("All");
      }
    } else {
      setAvailableTowns([]);
      if (selectedTown !== 'All') {
        setSelectedTown("All");
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
    const newParams = new URLSearchParams();
    
    if (searchTerm.trim()) newParams.set('search', searchTerm.trim());
    if (selectedRegion && selectedRegion !== "All") newParams.set('region', selectedRegion);
    if (selectedTown && selectedTown !== "All" && selectedRegion !== "All") newParams.set('town', selectedTown);
    
    router.push(`/market?${newParams.toString()}`);
  };

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setSelectedTown("All");
  };

  const SearchBarForm = ({ isMobileLayout }: { isMobileLayout?: boolean }) => (
    <form onSubmit={handleSearchSubmit} className={`flex w-full items-center gap-2 ${isMobileLayout ? 'flex-col' : 'flex-grow max-w-2xl'}`}>
      <div className={`${isMobileLayout ? 'w-full' : 'flex-grow'}`}>
        <Input
          type="search"
          placeholder="Search products..."
          className="h-9 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search products"
        />
      </div>
      <div className={`grid gap-2 grid-cols-2 ${isMobileLayout ? 'w-full' : 'min-w-[360px]'}`}>
          <Select value={selectedRegion} onValueChange={handleRegionChange}>
            <SelectTrigger className="h-9 text-xs">
              <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Regions</SelectItem>
              {PRODUCT_REGIONS.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
              value={selectedTown} 
              onValueChange={setSelectedTown}
              disabled={selectedRegion === "All" || availableTowns.length === 0}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="All Towns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Towns</SelectItem>
              {availableTowns.map(town => (
                <SelectItem key={town} value={town}>{town}</SelectItem>
              ))}
            </SelectContent>
          </Select>
      </div>
      {!isMobileLayout && (
         <Button type="submit" size="icon" className="h-9 w-9 shrink-0">
           <SearchIcon className="h-4 w-4" />
           <span className="sr-only">Search</span>
         </Button>
       )}
       {isMobileLayout && (
          <Button type="submit" className="w-full h-9">
            <SearchIcon className="h-4 w-4 mr-2" />
            Search
          </Button>
        )}
    </form>
  );

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md transition-transform duration-300 ease-in-out ${isMobileClient && !showHeaderOnMobile ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="container px-4 sm:px-12 flex h-16 max-w-screen-2xl items-center justify-between gap-2 sm:gap-4">
        <div className="hidden sm:block"> <Logo /> </div>
        <div className="sm:hidden"> <Logo className="text-xl" /></div>

        <nav className="flex items-center gap-2 md:gap-4 flex-grow">
          {showSearchBar && (
            <div className="hidden sm:flex flex-grow justify-center">
               <SearchBarForm />
            </div>
          )}
          
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
             <Button variant="outline" size="icon" asChild className="relative h-9 w-9">
              <Link href="/checkout">
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 -translate-y-1/2 translate-x-1/2 transform items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {cartCount}
                  </span>
                )}
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
              </Link>
            </Button>
          </div>
        </nav>
      </div>
      {showSearchBar && (
        <div className="container px-4 sm:px-12 pb-3 sm:hidden border-t border-border/40 pt-3">
          <SearchBarForm isMobileLayout />
        </div>
      )}
    </header>
  );
}
