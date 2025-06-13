
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react'; 
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import type { Product } from '@/types';
import {
  MoveRight,
  ShoppingBasket, 
} from 'lucide-react';

// Colorful SVG Icon Components
const FruitIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3 shrink-0">
    <path d="M16.5966 6.55163C17.5604 7.64448 18.1095 9.20892 18.0069 10.963C17.8435 13.7335 15.8642 16.0371 13.3853 16.436C10.9063 16.8349 8.57501 15.2289 7.61122 12.9254C6.64743 10.6218 7.33703 7.98976 9.17042 6.40243C10.6629 5.12061 12.875 4.88856 14.536 5.56845C15.2894 5.88972 15.9085 6.01256 16.5966 6.55163Z" fill="#F87171"/> {/* Apple Body - Red */}
    <path d="M14.2492 6.1368C14.2492 6.1368 15.2863 4.29369 16.6669 4.96035C18.0475 5.62702 16.7909 7.47013 16.7909 7.47013L14.2492 6.1368Z" fill="#4ADE80"/> {/* Leaf - Green */}
    <path d="M12.5 2C12.5 2 12 2.5 12 3V5C12 5.5 12.5 6 13 6C13.5 6 14 5.5 14 5V3C14 2.5 13.5 2 13 2L12.5 2Z" fill="#A16207"/> {/* Stem - Brown */}
  </svg>
);

const VegetableIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3 shrink-0">
    <path d="M17.25 14.75C17.25 18.0637 14.8137 20.5 11.5 20.5C8.18629 20.5 5.75 18.0637 5.75 14.75C5.75 11.4363 8.18629 9 11.5 9C14.8137 9 17.25 11.4363 17.25 14.75Z" fill="#FB923C"/> {/* Carrot Body - Orange */}
    <path d="M11.5 9L12.5 3H10.5L11.5 9Z" fill="#22C55E"/> {/* Carrot Top Stem - Darker Green */}
    <path d="M10 5L8 3.5H9.5L10 5Z" fill="#4ADE80"/> {/* Left Leaf - Lighter Green */}
    <path d="M13 5L15 3.5H13.5L13 5Z" fill="#4ADE80"/> {/* Right Leaf - Lighter Green */}
  </svg>
);

const GrainIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3 shrink-0">
    <path d="M10 2L9 6.5C9 6.5 6 7.5 6 10.5C6 13.5 9.5 14 9.5 17L9 22" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> {/* Main Wheat Stalk - Yellow */}
    <path d="M14 2L15 6.5C15 6.5 18 7.5 18 10.5C18 13.5 14.5 14 14.5 17L15 22" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> {/* Second Wheat Stalk */}
    <path d="M6.5 8.5L9 7L10.5 8" stroke="#EAB308" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> {/* Wheat Grains - Darker Yellow/Gold */}
    <path d="M6.5 12.5L9 11L10.5 12" stroke="#EAB308" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.5 8.5L15 7L13.5 8" stroke="#EAB308" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.5 12.5L15 11L13.5 12" stroke="#EAB308" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DairyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3 shrink-0">
    <rect x="6" y="9" width="12" height="11" rx="1" fill="#EFF6FF"/> {/* Milk Carton Body - Very Light Blue/White */}
    <rect x="6" y="5" width="12" height="4" rx="1" fill="#60A5FA"/> {/* Carton Top - Blue */}
    <path d="M9 12H15V14H9V12Z" fill="#93C5FD"/> {/* Label Area - Lighter Blue */}
    <path d="M8 6L8 4L16 4L16 6" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> {/* Carton Spout Accent - Darker Blue */}
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
  { name: "Fruits", icon: FruitIcon, imageHint: "fruits assortment" },
  { name: "Vegetables", icon: VegetableIcon, imageHint: "vegetables basket" },
  { name: "Grains", icon: GrainIcon, imageHint: "grains bread" },
  { name: "Dairy", icon: DairyIcon, imageHint: "dairy products" },
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
                  <category.icon />
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{category.name}</span>
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
