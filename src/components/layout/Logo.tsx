import Link from 'next/link';
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 text-2xl font-bold text-primary ${className}`}>
      <Image 
        src="https://res.cloudinary.com/ddvlexmvj/image/upload/v1751434079/VF_logo-removebg-preview_kgzusq.png" 
        alt="Vical Farmart Logo"
        width={32}
        height={32}
        className="h-8 w-8"
      />
      <span className="font-headline">Vical Farmart</span>
    </Link>
  );
}
