"use client";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import type { Product } from '@/types';
import { ShoppingCart, Star, MessageSquare, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Mock data for products
const mockProducts: Product[] = [
  { id: "1", name: "Organic Fuji Apples", description: "Crisp and sweet organic Fuji apples, perfect for snacking or baking. Grown locally using sustainable farming practices. Each apple is hand-picked to ensure the highest quality. Enjoy the natural goodness!", price: 3.99, category: "Fruits", imageUrl: "https://placehold.co/600x400.png", stock: 120, sellerId: "seller1", sellerName: "Green Valley Orchards" },
  { id: "2", name: "Vine-Ripened Tomatoes", description: "Juicy and flavorful vine-ripened tomatoes, ideal for salads, sauces, and sandwiches. These tomatoes are grown in rich soil and picked at peak ripeness for maximum taste.", price: 2.50, category: "Vegetables", imageUrl: "https://placehold.co/600x400.png", stock: 80, sellerId: "seller2", sellerName: "Sunshine Farms" },
  // Add other products if needed for direct navigation testing
];

export default function ProductDetailPage({ params }: { params: { productId: string } }) {
  const product = mockProducts.find(p => p.id === params.productId);

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

  // Mock related products (could be same category, different seller, etc.)
  const relatedProducts = mockProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);


  return (
    <div className="max-w-6xl mx-auto">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/market"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Market</Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image Gallery */}
        <div>
          <Image
            src={product.imageUrl || "https://placehold.co/600x400.png"}
            alt={product.name}
            width={600}
            height={400}
            className="rounded-lg shadow-xl object-cover w-full aspect-[3/2]"
            data-ai-hint={`${product.category} closeup`}
          />
          {/* Thumbnail images could go here */}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <Badge variant="secondary" className="w-fit mb-2">{product.category}</Badge>
          <h1 className="text-4xl font-bold font-headline mb-3">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">4.5 (20 reviews)</span> {/* Mock reviews */}
            <span className="text-sm text-muted-foreground">|</span>
            <span className="text-sm text-green-600 font-medium">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
          </div>

          <p className="text-3xl font-semibold text-primary mb-6">${product.price.toFixed(2)}</p>
          
          <p className="text-foreground/80 mb-6 leading-relaxed">{product.description}</p>

          {product.sellerName && (
            <p className="text-sm text-muted-foreground mb-1">Sold by: <span className="font-medium text-accent">{product.sellerName}</span></p>
          )}

          {/* Quantity Selector and Add to Cart */}
          <div className="flex items-center gap-4 mt-auto pt-6 border-t">
            {/* Mock quantity selector */}
            <Input type="number" defaultValue="1" min="1" max={product.stock} className="w-20 text-center" disabled={product.stock === 0} />
            <Button size="lg" className="flex-grow shadow-md" disabled={product.stock === 0}>
              <ShoppingCart className="mr-2 h-5 w-5" /> {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
            <Button variant="outline" size="lg" title="Contact Seller">
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-8 border-t">
          <h2 className="text-2xl font-semibold mb-6 font-headline">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map(relProduct => (
              <Card key={relProduct.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                 <Link href={`/market/${relProduct.id}`} className="block">
                    <Image src={relProduct.imageUrl || "https://placehold.co/300x200.png"} alt={relProduct.name} width={300} height={200} className="w-full h-48 object-cover" data-ai-hint={`${relProduct.category} product`} />
                 </Link>
                <CardContent className="p-4">
                   <Link href={`/market/${relProduct.id}`} className="block">
                     <CardTitle className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1">{relProduct.name}</CardTitle>
                   </Link>
                  <p className="text-md font-semibold text-primary mt-1">${relProduct.price.toFixed(2)}</p>
                  <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                     <Link href={`/market/${relProduct.id}`}>View</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
