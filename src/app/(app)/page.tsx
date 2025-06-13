
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
} from 'lucide-react';

// Define SVG components for categories
const FruitIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.68629 2 6 4.68629 6 8C6 11.3137 8.68629 14 12 14C15.3137 14 18 11.3137 18 8C18 4.68629 15.3137 2 12 2Z" fill="url(#paint0_linear_fruit)" stroke="#A0522D" strokeWidth="1.5"/>
    <path d="M12 14C9.5 14 7.5 15 6.5 16.5C8 19 10.5 22 12 22C13.5 22 16 19 17.5 16.5C16.5 15 14.5 14 12 14Z" fill="url(#paint1_linear_fruit)" stroke="#A0522D" strokeWidth="1.5"/>
    <path d="M14 5C14 4.44772 13.5523 4 13 4C12.4477 4 12 4.44772 12 5C12 5.55228 12.4477 6 13 6C13.5523 6 14 5.55228 14 5Z" fill="#FFF"/>
    <defs>
      <linearGradient id="paint0_linear_fruit" x1="12" y1="2" x2="12" y2="14" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF8C00"/>
        <stop offset="1" stopColor="#FFA500"/>
      </linearGradient>
      <linearGradient id="paint1_linear_fruit" x1="12" y1="14" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFD700"/>
        <stop offset="1" stopColor="#FFFFE0"/>
      </linearGradient>
    </defs>
  </svg>
);

const VegetableIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 14C17 11.2386 14.7614 9 12 9C9.23858 9 7 11.2386 7 14C7 19 12 22 12 22C12 22 17 19 17 14Z" fill="url(#paint0_linear_veg)" stroke="#A0522D" strokeWidth="1.5"/>
    <path d="M12 9V4M12 4L10 6M12 4L14 6" stroke="#228B22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="paint0_linear_veg" x1="12" y1="9" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF6347"/>
        <stop offset="1" stopColor="#FF4500"/>
      </linearGradient>
    </defs>
  </svg>
);

const GrainIcon = ({ className }: { className?: string }) => (
 <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12C5 8.13401 8.13401 5 12 5C15.866 5 19 8.13401 19 12Z" fill="url(#paint0_linear_grain)" stroke="#A0522D" strokeWidth="1.5"/>
    <path d="M12 5V2M12 19V22" stroke="#DAA520" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15.5 6.5L17.5 4.5M8.5 17.5L6.5 19.5" stroke="#DAA520" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M17.5 10.5L19.5 8.5M6.5 15.5L4.5 13.5" stroke="#DAA520" strokeWidth="1.5" strokeLinecap="round"/>
    <defs>
      <linearGradient id="paint0_linear_grain" x1="12" y1="5" x2="12" y2="19" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F5DEB3"/>
        <stop offset="1" stopColor="#DEB887"/>
      </linearGradient>
    </defs>
  </svg>
);

const DairyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 7H16V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7Z" fill="#E6E6FA" stroke="#A0522D" strokeWidth="1.5"/>
    <path d="M7 7H17L16 20C16 21.1046 15.1046 22 14 22H10C8.89543 22 8 21.1046 8 20L7 7Z" fill="#F0F8FF" stroke="#A0522D" strokeWidth="1.5"/>
    <path d="M10 12C10 11.4477 10.4477 11 11 11C11.5523 11 12 11.4477 12 12C12 12.5523 11.5523 13 11 13C10.4477 13 10 12.5523 10 12Z" fill="#ADD8E6"/>
    <path d="M13 15C13 14.4477 13.4477 14 14 14C14.5523 14 15 14.4477 15 15C15 15.5523 14.5523 16 14 16C13.4477 16 13 15.5523 13 15Z" fill="#ADD8E6"/>
  </svg>
);


// Mock data for featured products
const mockFeaturedProducts: Product[] = [
  { id: "1", name: "Organic Fuji Apples", description: "Crisp and sweet organic Fuji apples, perfect for snacking or baking.", price: 3.99, category: "Fruits", imageUrl: "https://placehold.co/400x300.png", stock: 120, sellerId: "seller1", sellerName: "Green Valley Orchards", region: "North" },
  { id: "3", name: "Artisanal Sourdough Bread", description: "Freshly baked artisanal sourdough bread with a chewy crust.", price: 6.00, category: "Grains", imageUrl: "https://placehold.co/400x300.png", stock: 25, sellerId: "seller3", sellerName: "The Local Bakery", region: "West" },
  { id: "5", name: "Organic Spinach Bunch", description: "A healthy bunch of organic spinach, great for cooking.", price: 2.99, category: "Vegetables", imageUrl: "https://placehold.co/400x300.png", stock: 70, sellerId: "seller2", sellerName: "Sunshine Farms", region: "Central" },
  { id: "4", name: "Free-Range Chicken Eggs", description: "Farm-fresh free-range chicken eggs, rich in color and taste.", price: 5.50, category: "Dairy", imageUrl: "https://placehold.co/400x300.png", stock: 50, sellerId: "seller1", sellerName: "Happy Hens Farm", region: "North" },
];

const categoryDisplayData = [
  { name: "Fruits", IconComponent: FruitIcon, imageHint: "fruits assortment", color: "text-orange-400" },
  { name: "Vegetables", IconComponent: VegetableIcon, imageHint: "vegetables basket", color: "text-emerald-400" },
  { name: "Grains", IconComponent: GrainIcon, imageHint: "grains bread", color: "text-amber-400" },
  { name: "Dairy", IconComponent: DairyIcon, imageHint: "dairy products", color: "text-sky-400" },
];

const carouselImages = [
  { src: "https://placehold.co/1000x600.png", alt: "Fresh vegetables at a market stall", dataAiHint: "vegetables market" },
  { src: "https://placehold.co/1000x600.png", alt: "Colorful fruits display", dataAiHint: "fruits display" },
  { src: "https://placehold.co/1000x600.png", alt: "Artisan bread and grains", dataAiHint: "bread grains" },
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
                  <category.IconComponent className={`w-6 h-6 mr-3 shrink-0 ${category.color} transition-colors`} />
                  <span className="text-sm font-medium">{category.name}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Main Hero Content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center md:text-left py-8 md:py-16 px-4 md:items-start md:pl-12 lg:pl-16">
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
              className="w-full max-w-2xl mx-auto md:mx-0 mb-6 rounded-lg overflow-hidden shadow-xl"
            >
              <CarouselContent>
                {carouselImages.map((image, index) => (
                  <CarouselItem key={index} className="relative aspect-[5/3]">
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
            
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 w-full md:w-auto justify-center md:justify-start">
              <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground text-center sm:text-left">
                Discover Freshness at <span className="text-accent">Vical Farmart</span>
              </h1>
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
