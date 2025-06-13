
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
  Citrus,
  Carrot,
  Wheat,
  Milk
} from 'lucide-react';

// Mock data for featured products
const mockFeaturedProducts: Product[] = [
  { id: "1", name: "Organic Fuji Apples", description: "Crisp and sweet organic Fuji apples, perfect for snacking or baking.", price: 3.99, category: "Fruits", imageUrl: "https://placehold.co/400x300.png", stock: 120, sellerId: "seller1", sellerName: "Green Valley Orchards", region: "North" },
  { id: "3", name: "Artisanal Sourdough Bread", description: "Freshly baked artisanal sourdough bread with a chewy crust.", price: 6.00, category: "Grains", imageUrl: "https://placehold.co/400x300.png", stock: 25, sellerId: "seller3", sellerName: "The Local Bakery", region: "West" },
  { id: "5", name: "Organic Spinach Bunch", description: "A healthy bunch of organic spinach, great for cooking.", price: 2.99, category: "Vegetables", imageUrl: "https://placehold.co/400x300.png", stock: 70, sellerId: "seller2", sellerName: "Sunshine Farms", region: "Central" },
  { id: "4", name: "Free-Range Chicken Eggs", description: "Farm-fresh free-range chicken eggs, rich in color and taste.", price: 5.50, category: "Dairy", imageUrl: "https://placehold.co/400x300.png", stock: 50, sellerId: "seller1", sellerName: "Happy Hens Farm", region: "North" },
];

const categoryDisplayData = [
  { name: "Fruits", icon: Citrus, imageHint: "fruits assortment", color: "text-orange-400" },
  { name: "Vegetables", icon: Carrot, imageHint: "vegetables basket", color: "text-emerald-400" },
  { name: "Grains", icon: Wheat, imageHint: "grains bread", color: "text-amber-400" },
  { name: "Dairy", icon: Milk, imageHint: "dairy products", color: "text-sky-400" },
];

const carouselImages = [
  { src: "https://placehold.co/1200x600.png", alt: "Fresh farm produce at a market stall", dataAiHint: "farm produce market" },
  { src: "https://placehold.co/1200x600.png", alt: "Close up of various fresh vegetables", dataAiHint: "vegetables closeup" },
  { src: "https://placehold.co/1200x600.png", alt: "Artisanal breads and baked goods", dataAiHint: "bakery goods" },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-background">
        <div className="container mx-auto px-0 md:px-4 flex flex-col md:flex-row gap-0 md:gap-8 items-stretch">
          {/* Left Vertical Category List */}
          <div className="w-full md:w-auto md:max-w-[240px] md:shrink-0 space-y-3 py-8 md:py-16 px-4 md:px-0 md:border-r md:border-border/70 md:pr-8 bg-background md:bg-transparent z-10">
            <h2 className="text-xl font-semibold mb-3 text-left text-foreground">Categories</h2>
            {categoryDisplayData.map((category) => (
              <Link key={category.name} href={`/market?category=${encodeURIComponent(category.name)}`} passHref>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4 shadow-sm
                             bg-background/80 hover:bg-accent/10 border-border
                             text-foreground group"
                >
                  <category.icon className={`w-6 h-6 mr-3 shrink-0 ${category.color} transition-colors`} />
                  <span className="text-sm font-medium">{category.name}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Main Hero Content with Carousel Background */}
          <div className="flex-1 relative min-h-[400px] md:min-h-0">
            <Carousel
              opts={{ loop: true }}
              plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
              className="absolute inset-0 w-full h-full"
            >
              <CarouselContent className="h-full">
                {carouselImages.map((image, index) => (
                  <CarouselItem key={index} className="h-full">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      layout="fill"
                      objectFit="cover"
                      className="brightness-75"
                      data-ai-hint={image.dataAiHint}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {/* Optional: Add Previous/Next buttons if desired, styled for overlay */}
              {/* <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50 border-none" /> */}
              {/* <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50 border-none" /> */}
            </Carousel>

            <div className="relative z-[5] flex flex-col items-center justify-center text-center md:text-left h-full py-16 md:py-20 px-4 md:items-start md:pl-12 lg:pl-16">
              <ShoppingBasket className="w-20 h-20 text-primary-foreground mx-auto md:mx-0 mb-4 drop-shadow-lg" />
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-primary-foreground drop-shadow-md">
                Discover Freshness at <span className="text-primary-foreground/80 drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)]">Vical Farmart</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto md:mx-0 mb-8 drop-shadow-sm">
                Shop the best local produce, artisanal goods, and more. Quality ingredients delivered to your door.
              </p>
              <Button
                size="lg"
                asChild
                className="shadow-lg px-10 py-3 text-lg h-auto bg-primary hover:bg-primary/90 text-primary-foreground ring-2 ring-primary-foreground/50 hover:ring-primary-foreground"
              >
                <Link href="/market">
                  <ShoppingBasket className="mr-2 h-6 w-6" />
                   Start Shopping
                </Link>
              </Button>
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
