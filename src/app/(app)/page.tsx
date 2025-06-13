
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/products/ProductCard';
import type { Product } from '@/types';
import {
  Leaf,
  ShoppingBasket,
  Search,
  Apple,
  Carrot,
  Wheat,
  Milk,
  MoveRight,
} from 'lucide-react';

// Mock data for featured products
const mockFeaturedProducts: Product[] = [
  { id: "1", name: "Organic Fuji Apples", description: "Crisp and sweet organic Fuji apples, perfect for snacking or baking.", price: 3.99, category: "Fruits", imageUrl: "https://placehold.co/400x300.png", stock: 120, sellerId: "seller1", sellerName: "Green Valley Orchards" },
  { id: "3", name: "Artisanal Sourdough Bread", description: "Freshly baked artisanal sourdough bread with a chewy crust.", price: 6.00, category: "Grains", imageUrl: "https://placehold.co/400x300.png", stock: 25, sellerId: "seller3", sellerName: "The Local Bakery" },
  { id: "5", name: "Organic Spinach Bunch", description: "A healthy bunch of organic spinach, great for cooking.", price: 2.99, category: "Vegetables", imageUrl: "https://placehold.co/400x300.png", stock: 70, sellerId: "seller2", sellerName: "Sunshine Farms" },
  { id: "4", name: "Free-Range Chicken Eggs", description: "Farm-fresh free-range chicken eggs, rich in color and taste.", price: 5.50, category: "Dairy", imageUrl: "https://placehold.co/400x300.png", stock: 50, sellerId: "seller1", sellerName: "Happy Hens Farm" },
];

const categoryDisplayData = [
  { name: "Fruits", icon: Apple, imageHint: "fruits assortment" },
  { name: "Vegetables", icon: Carrot, imageHint: "vegetables basket" },
  { name: "Grains", icon: Wheat, imageHint: "grains bread" },
  { name: "Dairy", icon: Milk, imageHint: "dairy products" },
];


export default function HomePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/market?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/market');
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-20 text-center">
        <div className="container mx-auto px-4">
          <Leaf className="w-20 h-20 text-primary mx-auto mb-4" />
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Discover Freshness at <span className="text-primary">AgriShop</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-8">
            Shop the best local produce, artisanal goods, and more. Quality ingredients delivered to your door.
          </p>
          <Button size="lg" asChild className="shadow-lg px-10 py-3 text-lg h-auto">
            <Link href="/market">
              <ShoppingBasket className="mr-2 h-6 w-6" /> Start Shopping
            </Link>
          </Button>
        </div>
      </section>

      {/* Search Bar Section */}
      <section className="py-6 md:py-8 w-full bg-background sticky top-16 z-20 shadow-sm border-b">
        <div className="container mx-auto px-4 max-w-2xl">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <Input
              type="search"
              placeholder="Search for apples, bread, tomatoes..."
              className="flex-grow text-base py-3 px-4 h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search products"
            />
            <Button type="submit" size="lg" className="h-12 px-6">
              <Search className="mr-0 h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Search</span>
            </Button>
          </form>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16 w-full bg-secondary/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-headline text-center mb-10">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categoryDisplayData.map((category) => (
              <Link key={category.name} href={`/market?category=${encodeURIComponent(category.name)}`} className="block group">
                <Card className="overflow-hidden shadow-md hover:shadow-xl hover:bg-primary/90 hover:border-primary !border-border transition-all duration-300 transform hover:-translate-y-1 h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center justify-center h-full aspect-square">
                    <category.icon className="w-12 h-12 md:w-16 md:h-16 mb-3 text-primary group-hover:text-primary-foreground transition-colors" />
                    <h3 className="text-lg md:text-xl font-semibold text-card-foreground group-hover:text-primary-foreground transition-colors">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
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
