import Link from 'next/link';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { ShoppingCart, UserCircle } from 'lucide-react';

export function Header() {
  // Mock authentication state
  const isAuthenticated = false; 
  const userRole = 'customer'; // or 'seller', 'admin'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-4">
          <Link href="/market" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
            Market
          </Link>
          {isAuthenticated && userRole === 'seller' && (
            <Link href="/seller/dashboard" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Seller Dashboard
            </Link>
          )}
          {isAuthenticated && userRole === 'admin' && (
            <Link href="/admin/dashboard" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Admin Dashboard
            </Link>
          )}
          {!isAuthenticated ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Register</Link>
              </Button>
            </>
          ) : (
             <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6" />
                <span className="sr-only">Profile</span>
              </Button>
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
