import Link from 'next/link';
import { Leaf } from 'lucide-react';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 text-2xl font-bold text-primary ${className}`}>
      <Leaf className="h-8 w-8" />
      <span className="font-headline">AgriShop</span>
    </Link>
  );
}
