
"use client";

import Link from 'next/link';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, UserCircle, LogOut, LayoutDashboardIcon, ListOrdered, Search as SearchIcon, MapPin, Briefcase, Truck, Camera } from 'lucide-react';
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import type { User } from '@/types';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import dynamic from 'next/dynamic';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useIsMobile } from '@/hooks/use-mobile';
import { useCart } from '@/context/CartContext';
import { PRODUCT_REGIONS, GHANA_REGIONS_AND_TOWNS } from '@/lib/constants';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { ExternalLink } from 'lucide-react';

const QrScanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then(mod => mod.QrScanner),
  { ssr: false, loading: () => <p>Loading Scanner...</p> }
);


const QrCodeScannerDialog = () => {
    const [scannedUrl, setScannedUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleDecode = (result: string) => {
        try {
            if (result && (result.startsWith('http://') || result.startsWith('https://'))) {
                const url = new URL(result);
                setScannedUrl(url.href);
            } else {
                setError("Scanned QR code does not contain a valid URL.");
                setScannedUrl(null);
            }
        } catch (_) {
            setError("Scanned QR code is not a valid URL.");
            setScannedUrl(null);
        }
    };

    const handleError = (err: any) => {
        if (err && err.name === 'NotAllowedError') {
            setError('Camera access denied. Please allow camera permissions in your browser settings.');
        } else {
            console.error('QR Scanner Error:', err);
            setError('An unexpected error occurred with the camera.');
        }
    };

    const handleGoToUrl = () => {
        if (scannedUrl) {
            window.open(scannedUrl, '_blank', 'noopener,noreferrer');
            setIsOpen(false);
        }
    };
    
    // Reset state when dialog is closed
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setScannedUrl(null);
                setError(null);
            }, 300); // Delay to allow dialog to close smoothly
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Scan QR Code">
                    <Camera className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Scan QR Code</DialogTitle>
                    <DialogDescription>
                        Point your camera at a product or payment QR code to quickly access it.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>{error}</AlertTitle>
                        </Alert>
                    )}
                    {scannedUrl ? (
                        <div className="text-center space-y-3">
                            <Alert>
                                <AlertTitle>Scan Successful!</AlertTitle>
                                <p className="text-sm text-muted-foreground break-all">{scannedUrl}</p>
                            </Alert>
                            <Button onClick={handleGoToUrl} className="w-full">
                                <ExternalLink className="mr-2 h-4 w-4" /> Go to URL
                            </Button>
                        </div>
                    ) : (
                        <div className="w-full rounded-md overflow-hidden border">
                           <QrScanner
                                onDecode={handleDecode}
                                onError={handleError}
                                constraints={{ facingMode: 'environment' }}
                                videoStyle={{ width: '100%', height: '100%' }}
                                containerStyle={{ width: '100%' }}
                            />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};


interface AuthStatus {
  isAuthenticated: boolean;
  user?: User | null;
}

const HEADER_SCROLL_THRESHOLD = 50;

// Memoize the search bar to prevent re-renders on every keystroke, which causes focus loss.
const SearchBarForm = React.memo(function SearchBarForm({
  isMobileLayout,
  initialSearchTerm,
}: {
  isMobileLayout?: boolean;
  initialSearchTerm: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get('region') || "All");
  const [selectedTown, setSelectedTown] = useState(searchParams.get('town') || "All");
  const [availableTowns, setAvailableTowns] = useState<string[]>([]);
  
  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  useEffect(() => {
    if (selectedRegion && selectedRegion !== "All") {
      const townsForRegion = GHANA_REGIONS_AND_TOWNS[selectedRegion] || [];
      setAvailableTowns(townsForRegion);
    } else {
      setAvailableTowns([]);
    }
  }, [selectedRegion]);
  
  useEffect(() => {
    if (selectedRegion === "All") {
      setSelectedTown("All");
    }
  }, [selectedRegion]);


  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    
    if (searchTerm.trim()) newParams.set('search', searchTerm.trim());
    if (selectedRegion && selectedRegion !== "All") newParams.set('region', selectedRegion);
    if (selectedTown && selectedTown !== "All" && selectedRegion !== "All") newParams.set('town', selectedTown);
    
    router.push(`/market?${newParams.toString()}`);
  };

  return (
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
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
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
});


export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ isAuthenticated: false });
  const { cartCount } = useCart();

  const [isMobileClient, setIsMobileClient] = useState(false);
  const [showHeaderOnMobile, setShowHeaderOnMobile] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const showSearchBar = pathname !== '/market';
  const initialSearchTerm = searchParams.get('search') || "";
  const _isMobileHookValue = useIsMobile();

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
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAuthStatus({ isAuthenticated: true, user: { id: docSnap.id, ...docSnap.data() } as User });
        } else {
          setAuthStatus({ isAuthenticated: true, user: {
            id: user.uid,
            name: user.displayName || 'New User',
            email: user.email || '',
            role: 'customer',
            isActive: true,
          } });
        }
      } else {
        setAuthStatus({ isAuthenticated: false, user: null });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
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

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md transition-transform duration-300 ease-in-out ${isMobileClient && !showHeaderOnMobile ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="container px-4 sm:px-12 flex h-16 max-w-screen-2xl items-center justify-between gap-2 sm:gap-4">
        <div className="hidden sm:block"> <Logo /> </div>
        <div className="sm:hidden"> <Logo className="text-xl" /></div>

        <nav className="flex items-center gap-2 md:gap-4 flex-grow">
          {showSearchBar && (
            <div className="hidden sm:flex flex-grow justify-center">
               <SearchBarForm initialSearchTerm={initialSearchTerm} />
            </div>
          )}
          
          <div className="flex items-center gap-2 md:gap-3 ml-auto">
             <QrCodeScannerDialog />

            {authStatus.isAuthenticated && authStatus.user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={authStatus.user.avatarUrl || `https://placehold.co/40x40.png?text=${getUserInitials(authStatus.user.name)}`} alt={authStatus.user.name || "User"} data-ai-hint="person face"/>
                        <AvatarFallback>{getUserInitials(authStatus.user.name)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{authStatus.user.name || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {authStatus.user.email || "No email"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile"><UserCircle className="mr-2 h-4 w-4" /> My Profile</Link>
                    </DropdownMenuItem>
                    {authStatus.user.role === 'customer' && (
                      <DropdownMenuItem asChild>
                        <Link href="/my-orders"><ListOrdered className="mr-2 h-4 w-4" /> My Orders</Link>
                      </DropdownMenuItem>
                    )}
                    {authStatus.user.role === 'seller' && (
                       <DropdownMenuItem asChild>
                        <Link href="/seller/dashboard"><Briefcase className="mr-2 h-4 w-4" /> Seller Dashboard</Link>
                       </DropdownMenuItem>
                    )}
                     {authStatus.user.role === 'courier' && (
                       <DropdownMenuItem asChild>
                        <Link href="/courier/dashboard"><Truck className="mr-2 h-4 w-4" /> Courier Dashboard</Link>
                       </DropdownMenuItem>
                    )}
                    {(authStatus.user.role === 'admin' || authStatus.user.role === 'supervisor') && (
                       <DropdownMenuItem asChild>
                        <Link href={authStatus.user.role === 'admin' ? "/admin/dashboard" : "/supervisor/dashboard"}><LayoutDashboardIcon className="mr-2 h-4 w-4" /> Dashboard</Link>
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
          <SearchBarForm isMobileLayout initialSearchTerm={initialSearchTerm} />
        </div>
      )}
    </header>
  );
}
