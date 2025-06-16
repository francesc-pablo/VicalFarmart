
import Link from 'next/link';
import { Logo } from './Logo'; // Assuming you might want the logo here too

export function Footer() {
  const accountLinks = [
    { href: "/login", text: "Login" },
    { href: "/register", text: "Register" },
    { href: "/profile", text: "My Profile" },
    { href: "/my-orders", text: "My Orders" },
  ];

  const shopLinks = [
    { href: "/", text: "Home" },
    { href: "/market", text: "Marketplace" },
    { href: "/checkout", text: "Checkout" },
  ];

  const companyLinks = [
    { href: "#", text: "About Vical Farmart" }, // Placeholder
    { href: "#", text: "Contact Us" }, // Placeholder
    { href: "#", text: "Terms of Service" }, // Placeholder
    { href: "#", text: "Privacy Policy" }, // Placeholder
  ];


  return (
    <footer className="border-t border-border/40 bg-background/95 mt-auto text-foreground/80">
      <div className="container mx-auto px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Logo & Brief */}
          <div className="mb-6 md:mb-0">
            <Logo className="text-2xl mb-3" />
            <p className="text-sm">
              Connecting local farmers with buyers for fresh, quality agricultural produce.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h5 className="font-semibold text-foreground mb-3 text-lg">Shop</h5>
            <ul className="space-y-2">
              {shopLinks.map(link => (
                <li key={link.text}>
                  <Link href={link.href} className="hover:text-primary transition-colors text-sm">
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h5 className="font-semibold text-foreground mb-3 text-lg">My Account</h5>
            <ul className="space-y-2">
              {accountLinks.map(link => (
                <li key={link.text}>
                  <Link href={link.href} className="hover:text-primary transition-colors text-sm">
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h5 className="font-semibold text-foreground mb-3 text-lg">Our Company</h5>
            <ul className="space-y-2">
              {companyLinks.map(link => (
                <li key={link.text}>
                  <Link href={link.href} className="hover:text-primary transition-colors text-sm">
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <Separator className="my-8 bg-border/60" />

        <div className="text-center text-sm text-foreground/60">
          <p>&copy; {new Date().getFullYear()} Vical Farmart. All rights reserved.</p>
          <p className="mt-1">Empowering Local Agriculture.</p>
        </div>
      </div>
    </footer>
  );
}

// Ensure Separator is imported if not already globally available or used elsewhere
// If not, you might need to add: import { Separator } from "@/components/ui/separator";
// However, since Footer.tsx is a component, it's better to ensure Separator is available.
// For this example, I'll assume Separator is handled if needed. If it causes an error, we can import it.
// To be safe, let's ensure the Separator component is available by adding an import.

import { Separator } from "@/components/ui/separator";
