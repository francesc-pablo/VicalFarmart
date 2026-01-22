
"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import type { Product } from '@/types';
import { ShoppingCart, Star, MessageSquare, ArrowLeft, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { getProductById, getRelatedProducts, getProducts } from '@/services/productService'; // Import services
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';

export async function generateStaticParams() {
  const products = await getProducts();
 
  return products.map((product) => ({
    productId: product.id,
  }));
}

const getCurrencySymbol = (currencyCode?: string) => {
  if (currencyCode === "GHS") return "₵";
  if (currencyCode === "USD") return "$";
  return "$"; // Default symbol
};

export default function ProductDetailPage() {
  const params = useParams<{ productId: string }>();
  const productId = params.productId;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!productId) return;
    const fetchProductData = async () => {
      setIsLoading(true);
      const fetchedProduct = await getProductById(productId as string);
      setProduct(fetchedProduct);
      if (fetchedProduct) {
        const fetchedRelated = await getRelatedProducts(fetchedProduct.category, fetchedProduct.id);
        setRelatedProducts(fetchedRelated);
      }
      setIsLoading(false);
    };
    fetchProductData();
  }, [productId]);


  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
         <Button variant="outline" asChild className="mb-6">
            <Link href="/market"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Market</Link>
         </Button>
         <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div>
                <Skeleton className="rounded-lg shadow-xl w-full aspect-[3/2]" />
            </div>
            <div className="flex flex-col space-y-4">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-20 w-full" />
                <div className="flex items-center gap-4 mt-auto pt-6 border-t">
                    <Skeleton className="h-12 w-20" />
                    <Skeleton className="h-12 flex-grow" />
                    <Skeleton className="h-12 w-12" />
                </div>
            </div>
         </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-10">
        <PageHeader title="Product Not Found" />
        <p className="text-muted-foreground">Sorry, the product you are looking for does not exist.</p>
        <Button asChild className="mt-4">
          <Link href="/market"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Market</Link>
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
  };

  const mainImageHint = product.category.split(/[&\s]+/g)[0] + " closeup";
  const currencySymbol = getCurrencySymbol(product.currency);

  return (
    <div className="max-w-6xl mx-auto">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/market"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Market</Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <Image
            src={product.imageUrl || "https://placehold.co/600x400.png"}
            alt={product.name}
            width={600}
            height={400}
            className="rounded-lg shadow-xl object-cover w-full aspect-[3/2]"
            data-ai-hint={mainImageHint}
          />
        </div>

        <div className="flex flex-col">
          <div className="flex justify-between items-start">
            <Badge variant="secondary" className="w-fit mb-2">{product.category}</Badge>
            {(product.region || product.town) && (
              <Badge variant="outline" className="w-fit mb-2 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {product.region}
                {product.town && product.region ? ` - ${product.town}` : product.town}
              </Badge>
            )}
          </div>
          <h1 className="text-4xl font-bold font-headline mb-3">{product.name}</h1>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">4.5 (20 reviews)</span>
            <span className="text-sm text-muted-foreground">|</span>
            <span className="text-sm text-green-600 font-medium">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
          </div>

          <p className="text-3xl font-semibold text-primary mb-6">{currencySymbol}{product.price.toFixed(2)} <span className="text-lg font-normal text-muted-foreground">{product.currency}</span></p>

          <p className="text-foreground/80 mb-6 leading-relaxed">{product.description}</p>

          {product.sellerName && (
            <p className="text-sm text-muted-foreground mb-1">Sold by: <span className="font-medium text-accent">{product.sellerName}</span></p>
          )}

          <div className="flex items-center gap-4 mt-auto pt-6 border-t">
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              min="1"
              max={product.stock > 0 ? product.stock : 1}
              className="w-20 text-center"
              disabled={product.stock === 0}
              aria-label="Quantity"
            />
            <Button size="lg" className="flex-grow shadow-md" disabled={product.stock === 0} onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" /> {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
            <Button variant="outline" size="lg" title="Contact Seller">
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-8 border-t">
          <h2 className="text-2xl font-semibold mb-6 font-headline">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map(relProduct => {
              const relatedImageHint = relProduct.category.split(/[&\s]+/g).slice(0, 2).join(" ");
              const relCurrencySymbol = getCurrencySymbol(relProduct.currency);
              return (
                <Card key={relProduct.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <Link href={`/market/${relProduct.id}`} className="block">
                      <Image src={relProduct.imageUrl || "https://placehold.co/300x200.png"} alt={relProduct.name} width={300} height={200} className="w-full h-48 object-cover" data-ai-hint={relatedImageHint} />
                  </Link>
                  <CardContent className="p-4">
                    <Link href={`/market/${relProduct.id}`} className="block">
                      <CardTitle className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1">{relProduct.name}</CardTitle>
                    </Link>
                    <p className="text-md font-semibold text-primary mt-1">{relCurrencySymbol}{relProduct.price.toFixed(2)} <span className="text-xs text-muted-foreground">{relProduct.currency}</span></p>
                     {(relProduct.region || relProduct.town) && (
                        <Badge variant="outline" size="sm" className="mt-2 flex items-center gap-1 w-fit">
                            <MapPin className="h-3 w-3" />
                            {relProduct.region}
                            {relProduct.town && relProduct.region ? ` - ${relProduct.town}` : relProduct.town}
                        </Badge>
                     )}
                    <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                      <Link href={`/market/${relProduct.id}`}>View</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
