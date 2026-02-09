"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

const getCurrencySymbol = (currencyCode?: string) => {
  if (currencyCode === "GHS") return "₵";
  if (currencyCode === "USD") return "$";
  return "$"; // Default symbol
};

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const imageHint = product.category.split(/[&\s]+/g).slice(0, 2).join(" ");
  const currencySymbol = getCurrencySymbol(product.currency);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent parent Link from navigating
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <Link href={`/market/${product.id}`} className="block">
        <CardHeader className="p-0">
          <Image
            src={product.imageUrl || "https://placehold.co/400x300.png"}
            alt={product.name}
            width={400}
            height={300}
            className="w-full h-40 object-cover"
            data-ai-hint={imageHint}
          />
        </CardHeader>
      </Link>
      <CardContent className="p-3 flex-grow flex flex-col space-y-1">
        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-auto w-fit">{product.category}</Badge>
        <Link href={`/market/${product.id}`} className="block flex-grow">
          <CardTitle className="text-base font-semibold hover:text-primary transition-colors line-clamp-2">{product.name}</CardTitle>
        </Link>
        <div className="pt-1 flex items-center justify-between">
          <p className="text-lg font-bold text-primary">{currencySymbol}{product.price.toFixed(2)}</p>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-muted-foreground">4.5</span>
          </div>
        </div>
        {product.sellerName && <p className="text-[10px] text-muted-foreground truncate">Sold by: {product.sellerName}</p>}
      </CardContent>
      <CardFooter className="p-2 border-t flex items-center gap-2">
        <Button asChild className="w-full shadow-md" size="sm">
          <Link href={`/market/${product.id}`}>
            View
          </Link>
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="px-2"
          onClick={handleAddToCart} 
          disabled={product.stock === 0}
          aria-label="Add to cart"
          title="Add to cart"
        >
            <ShoppingCart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
