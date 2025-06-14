
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import type { Product } from '@/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import {
  MoveRight,
  ShoppingBasket,
  Citrus, Carrot, Wheat, Milk, Archive, Fish
} from 'lucide-react';

// Mock data for featured products
const mockFeaturedProducts: Product[] = [
  { id: "1", name: "Organic Fuji Apples", description: "Crisp and sweet organic Fuji apples, perfect for snacking or baking.", price: 3.99, category: "Fruits", imageUrl: "https://placehold.co/400x300.png", stock: 120, sellerId: "seller1", sellerName: "Green Valley Orchards", region: "North" },
  { id: "3", name: "Artisanal Sourdough Bread", description: "Freshly baked artisanal sourdough bread with a chewy crust.", price: 6.00, category: "Grains", imageUrl: "https://placehold.co/400x300.png", stock: 25, sellerId: "seller3", sellerName: "The Local Bakery", region: "West" },
  { id: "5", name: "Organic Spinach Bunch", description: "A healthy bunch of organic spinach, great for cooking.", price: 2.99, category: "Vegetables", imageUrl: "https://placehold.co/400x300.png", stock: 70, sellerId: "seller2", sellerName: "Sunshine Farms", region: "Central" },
  { id: "4", name: "Free-Range Chicken Eggs", description: "Farm-fresh free-range chicken eggs, rich in color and taste.", price: 5.50, category: "Dairy", imageUrl: "https://placehold.co/400x300.png", stock: 50, sellerId: "seller1", sellerName: "Happy Hens Farm", region: "North" },
];

const categoryDisplayData = [
  { name: "Fruits", IconComponent: Citrus, imageHint: "fruits assortment", color: "text-orange-500" },
  { name: "Vegetables", IconComponent: Carrot, imageHint: "vegetables basket", color: "text-emerald-500" },
  { name: "Grains", IconComponent: Wheat, imageHint: "grains bread", color: "text-amber-500" },
  { name: "Dairy", IconComponent: Milk, imageHint: "dairy products", color: "text-sky-500" },
  { name: "Meat & Fish", IconComponent: Fish, imageHint: "meat fish", color: "text-red-500" },
  { name: "Groceries & Provisions", IconComponent: Archive, imageHint: "groceries provisions", color: "text-purple-500" },
];

const carouselImages = [
  { src: "https://placehold.co/1300x600.png", alt: "Fresh vegetables at a market stall", dataAiHint: "vegetables market" },
  { src: "https://placehold.co/1300x600.png", alt: "Colorful fruits display", dataAiHint: "fruits display" },
  { src: "https://placehold.co/1300x600.png", alt: "Artisan bread and grains", dataAiHint: "bread grains" },
];


export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-background">
        <div className="container mx-auto px-0 md:px-4 flex flex-col md:flex-row gap-0 md:gap-8 items-stretch">
          {/* Left Vertical Category List */}
          <div className="w-full md:w-auto md:max-w-[240px] md:shrink-0 space-y-3 py-4 md:py-2 px-4 md:px-0 md:border-r md:border-border/70 md:pr-8 bg-background md:bg-transparent z-10">
            <h2 className="text-xl font-semibold mb-3 text-left text-foreground">Categories</h2>
            {categoryDisplayData.map((category) => (
              <Link key={category.name} href={`/market?category=${encodeURIComponent(category.name)}`} passHref>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4 shadow-sm
                             bg-background/80 hover:bg-accent/10 border-border
                             text-foreground group"
                >
                  <category.IconComponent className={`w-6 h-6 mr-3 shrink-0 ${category.color} transition-colors`} />
                  <span className="text-sm font-medium">{category.name}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Main Hero Content */}
          <div className="w-full flex-1 flex flex-col items-center justify-center text-center md:text-left py-4 md:py-2 px-4 md:pl-6 lg:pl-8">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 4000,
                }),
              ]}
              className="w-full mb-6 rounded-lg overflow-hidden shadow-xl"
            >
              <CarouselContent>
                {carouselImages.map((image, index) => (
                  <CarouselItem key={index} className="relative aspect-[13/6]">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      layout="fill"
                      objectFit="cover"
                      className="brightness-90"
                      data-ai-hint={image.dataAiHint}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none" />
            </Carousel>
            
            <div className="w-full flex flex-col sm:flex-row items-center gap-4 md:gap-6 justify-center md:justify-start">
              <Button
                size="lg"
                asChild
                className="shadow-md px-8 py-3 text-base h-auto shrink-0" 
              >
                <Link href="/market">
                  <ShoppingBasket className="mr-2 h-5 w-5" />
                  Start Shopping
                </Link>
              </Button>
              <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground text-center sm:text-left">
                Discover Freshness at <span className="text-accent">Vical Farmart</span>
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 md:py-16 w-full bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-headline text-center mb-10 text-foreground">Featured Products</h2>
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
