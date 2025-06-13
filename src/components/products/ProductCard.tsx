import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <Link href={`/market/${product.id}`} className="block">
        <CardHeader className="p-0">
          <Image
            src={product.imageUrl || "https://placehold.co/400x300.png"}
            alt={product.name}
            width={400}
            height={300}
            className="w-full h-56 object-cover"
            data-ai-hint={`${product.category} product`}
          />
        </CardHeader>
      </Link>
      <CardContent className="p-4 flex-grow">
        <Badge variant="secondary" className="mb-2">{product.category}</Badge>
        <Link href={`/market/${product.id}`} className="block">
          <CardTitle className="text-xl font-semibold hover:text-primary transition-colors line-clamp-2">{product.name}</CardTitle>
        </Link>
        <CardDescription className="mt-1 text-sm line-clamp-3 h-[3.75rem]">{product.description}</CardDescription>
        
        <div className="mt-3 flex items-center justify-between">
          <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-muted-foreground">4.5 (20)</span> {/* Mock rating */}
          </div>
        </div>
        {product.sellerName && <p className="text-xs text-muted-foreground mt-1">Sold by: {product.sellerName}</p>}
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button asChild className="w-full shadow-md">
          <Link href={`/market/${product.id}`}>
            <ShoppingCart className="mr-2 h-4 w-4" /> View Product
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
