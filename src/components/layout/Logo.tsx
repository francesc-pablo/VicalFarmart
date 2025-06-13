import Link from 'next/link';

const VicalFarmartLogoSVG = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    {/* Basket */}
    <path
      d="M10 50 C4 40, 4 28, 12 26 L18 42 L46 42 L52 26 C60 28, 60 40, 54 50 Z"
      fill="#4CAF50" // Basket green
      stroke="#388E3C" // Darker green for border
      strokeWidth="1.5"
    />
    {/* Basket top rim */}
     <path
      d="M12 26 C12 22, 52 22, 52 26"
      stroke="#388E3C"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Basket slits - simplified */}
    <line x1="16" y1="30" x2="48" y2="30" stroke="#FFFFFF" strokeWidth="2" />
    <line x1="17" y1="35" x2="47" y2="35" stroke="#FFFFFF" strokeWidth="2" />
    <line x1="18" y1="40" x2="46" y2="40" stroke="#FFFFFF" strokeWidth="2" />
    
    {/* Contents - Simplified and stylized */}
    {/* Pineapple top */}
    <path
      d="M40 10 L42 16 L38 16 Z M40 10 L45 15 L43 17 Z M40 10 L35 15 L37 17 Z M39 12 L41 12 L40 8 Z"
      fill="#2E7D32" // Dark green for pineapple leaves
      stroke="#1B5E20"
      strokeWidth="0.5"
    />
     {/* Large green fruit (stylized pineapple/soursop body) */}
    <ellipse cx="40" cy="22" rx="7" ry="6" fill="#8BC34A" stroke="#558B2F" strokeWidth="1"/>

    {/* Apple */}
    <circle cx="20" cy="22" r="5" fill="#F44336" stroke="#C62828" strokeWidth="1" />
    <path d="M20 18 Q20 16 21 17" stroke="#8D6E63" strokeWidth="1" /> {/* Stem */}

    {/* Orange */}
    <circle cx="28" cy="25" r="5" fill="#FF9800" stroke="#F57C00" strokeWidth="1"/>
    
    {/* Bananas */}
    <path d="M48 24 Q50 20 52 24" stroke="#FFEB3B" strokeWidth="3" fill="none" />
    <path d="M47 26 Q49 22 51 26" stroke="#FFEB3B" strokeWidth="3" fill="none" />

    {/* Carrot / Long orange item */}
    <ellipse cx="15" cy="28" rx="3" ry="6" transform="rotate(-30 15 28)" fill="#FF5722" stroke="#E64A19" strokeWidth="1"/>
  </svg>
);

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 text-2xl font-bold text-primary ${className}`}>
      <VicalFarmartLogoSVG className="h-8 w-8" />
      <span className="font-headline">Vical Farmart</span>
    </Link>
  );
}
