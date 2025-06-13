
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react'; // Removed useState
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input'; // Removed Input
// import { Card, CardContent } from '@/components/ui/card'; // Card removed for category display
import { ProductCard } from '@/components/products/ProductCard';
import type { Product } from '@/types';
import {
  Apple,
  Carrot,
  Wheat,
  Milk,
  MoveRight,
  ShoppingBasket, 
} from 'lucide-react';

// Mock data for featured products
const mockFeaturedProducts: Product[] = [
  { id: "1", name: "Organic Fuji Apples", description: "Crisp and sweet organic Fuji apples, perfect for snacking or baking.", price: 3.99, category: "Fruits", imageUrl: "https://placehold.co/400x300.png", stock: 120, sellerId: "seller1", sellerName: "Green Valley Orchards", region: "North" },
  { id: "3", name: "Artisanal Sourdough Bread", description: "Freshly baked artisanal sourdough bread with a chewy crust.", price: 6.00, category: "Grains", imageUrl: "https://placehold.co/400x300.png", stock: 25, sellerId: "seller3", sellerName: "The Local Bakery", region: "West" },
  { id: "5", name: "Organic Spinach Bunch", description: "A healthy bunch of organic spinach, great for cooking.", price: 2.99, category: "Vegetables", imageUrl: "https://placehold.co/400x300.png", stock: 70, sellerId: "seller2", sellerName: "Sunshine Farms", region: "Central" },
  { id: "4", name: "Free-Range Chicken Eggs", description: "Farm-fresh free-range chicken eggs, rich in color and taste.", price: 5.50, category: "Dairy", imageUrl: "https://placehold.co/400x300.png", stock: 50, sellerId: "seller1", sellerName: "Happy Hens Farm", region: "North" },
];

const categoryDisplayData = [
  { name: "Fruits", icon: Apple, imageHint: "fruits assortment" },
  { name: "Vegetables", icon: Carrot, imageHint: "vegetables basket" },
  { name: "Grains", icon: Wheat, imageHint: "grains bread" },
  { name: "Dairy", icon: Milk, imageHint: "dairy products" },
];


export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      {/* Hero Section with Vertical Categories on Left */}
      <section className="w-full bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
          {/* Left Vertical Category List */}
          <div className="w-full md:w-1/4 lg:w-1/5 space-y-3">
            <h2 className="text-xl font-semibold mb-3 text-left">Categories</h2>
            {categoryDisplayData.map((category) => (
              <Link key={category.name} href={`/market?category=${encodeURIComponent(category.name)}`} passHref>
                <Button variant="outline" className="w-full justify-start h-auto py-3 px-4 shadow-sm hover:bg-primary/10 hover:border-primary group">
                  <category.icon className="w-5 h-5 mr-3 text-primary transition-colors" />
                  <span className="text-sm font-medium text-foreground transition-colors">{category.name}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Main Hero Content */}
          <div className="flex-1 text-center md:text-left">
            <ShoppingBasket className="w-20 h-20 text-primary mx-auto md:mx-0 mb-4" />
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Discover Freshness at <span className="text-primary">Vical Farmart</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto md:mx-0 mb-8">
              Shop the best local produce, artisanal goods, and more. Quality ingredients delivered to your door.
            </p>
            <Button size="lg" asChild className="shadow-lg px-10 py-3 text-lg h-auto">
              <Link href="/market">
                <ShoppingBasket className="mr-2 h-6 w-6" />
                 Start Shopping
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 md:py-16 w-full">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-headline text-center mb-10">Featured Products</h2>
          {mockFeaturedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockFeaturedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
             <p className="text-center text-muted-foreground">No featured products at the moment. Check back soon!</p>
          )}
           <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild className="h-auto py-3 px-6 text-base">
              <Link href="/market">
                View All Products <MoveRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
