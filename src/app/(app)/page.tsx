
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
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
  Citrus, Carrot, Wheat, Milk, Archive, Fish, Search as SearchIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_REGIONS, GHANA_REGIONS_AND_TOWNS } from '@/lib/constants';


// Mock data for featured products
const mockFeaturedProducts: Product[] = [
  { id: "1", name: "Organic Fuji Apples", description: "Crisp and sweet organic Fuji apples, perfect for snacking or baking.", price: 3.99, category: "Fruits", imageUrl: "https://placehold.co/400x300.png", stock: 120, sellerId: "seller1", sellerName: "Green Valley Orchards", region: "Ashanti", town: "Kumasi", currency: "USD" },
  { id: "3", name: "Artisanal Sourdough Bread", description: "Freshly baked artisanal sourdough bread with a chewy crust.", price: 60.00, category: "Grains", imageUrl: "https://placehold.co/400x300.png", stock: 25, sellerId: "seller3", sellerName: "The Local Bakery", region: "Greater Accra", town: "Accra", currency: "GHS" },
  { id: "5", name: "Organic Spinach Bunch", description: "A healthy bunch of organic spinach, great for cooking.", price: 2.99, category: "Vegetables", imageUrl: "https://placehold.co/400x300.png", stock: 70, sellerId: "seller2", sellerName: "Sunshine Farms", region: "Central", town: "Cape Coast", currency: "USD" },
  { id: "4", name: "Free-Range Chicken Eggs", description: "Farm-fresh free-range chicken eggs, rich in color and taste.", price: 55.00, category: "Dairy", imageUrl: "https://placehold.co/400x300.png", stock: 50, sellerId: "seller1", sellerName: "Happy Hens Farm", region: "Volta", town: "Ho", currency: "GHS" },
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
  { src: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxmcmVzaCUyMGZydWl0c3xlbnwwfHx8fDE3NDk4NjAzOTN8MA&ixlib=rb-4.1.0&q=80&w=1080", alt: "Artisan bread and grains", dataAiHint: "fresh fruits" },
  { src: "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxncm9jZXJpZXN8ZW58MHx8fHwxNzQ5ODYxNzAxfDA&ixlib=rb-4.1.0&q=80&w=1080", alt: "Fresh vegetables at a market stall", dataAiHint: "groceries market" },
  { src: "https://images.unsplash.com/photo-1592924802543-809bfeee53fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxmcmVzaCUyMHZlZ2V0YWJsZXN8ZW58MHx8fHwxNzQ5ODYwNjg4fDA&ixlib=rb-4.1.0&q=80&w=1080", alt: "Colorful fruits display", dataAiHint: "fresh vegetables" },
];

const NO_REGION_SELECTED = "All";
const NO_TOWN_SELECTED = "All";

export default function HomePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>(NO_REGION_SELECTED);
  const [selectedTown, setSelectedTown] = useState<string>(NO_TOWN_SELECTED);
  const [availableTowns, setAvailableTowns] = useState<string[]>([]);

  useEffect(() => {
    if (selectedRegion && selectedRegion !== NO_REGION_SELECTED) {
      setAvailableTowns(GHANA_REGIONS_AND_TOWNS[selectedRegion] || []);
      setSelectedTown(NO_TOWN_SELECTED); // Reset town when region changes
    } else {
      setAvailableTowns([]);
      setSelectedTown(NO_TOWN_SELECTED); // Reset town if "All Regions" is selected
    }
  }, [selectedRegion]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchTerm.trim()) {
      queryParams.set('search', searchTerm.trim());
    }
    if (selectedRegion && selectedRegion !== NO_REGION_SELECTED) {
      queryParams.set('region', selectedRegion);
    }
    // Only add town if a specific region is selected and a specific town (not "All Towns") is chosen
    if (selectedTown && selectedTown !== NO_TOWN_SELECTED && selectedRegion !== NO_REGION_SELECTED && availableTowns.includes(selectedTown)) {
      queryParams.set('town', selectedTown);
    }
    router.push(`/market?${queryParams.toString()}`);
  };


  return (
    <div className="flex flex-col">
      <section className="relative w-full pb-8 md:pb-12 overflow-hidden bg-background">
        <div className="container mx-auto px-12 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-64 md:shrink-0 border-r border-border/70 pr-6 pt-2">
            <h2 className="text-lg font-semibold mb-3 text-left">Browse Categories</h2>
            <div className="space-y-1.5">
              {categoryDisplayData.map((category) => (
                <Link key={category.name} href={`/market?category=${encodeURIComponent(category.name)}`} passHref>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-base font-normal text-muted-foreground hover:text-primary hover:bg-primary/10 focus-visible:text-primary border border-primary py-4"
                  >
                    <category.IconComponent className={`w-6 h-6 mr-2.5 shrink-0 ${category.color} transition-colors`} />
                    {category.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="w-full flex-1 flex flex-col items-center justify-center text-center md:text-left md:px-0">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 5000,
                }),
              ]}
              className="w-full mb-8 rounded-lg overflow-hidden shadow-xl"
            >
              <CarouselContent>
                {carouselImages.map((image, index) => (
                  <CarouselItem key={index} className="relative aspect-[13/6]">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      objectFit="cover"
                      className="brightness-90"
                      {...(image.dataAiHint && { 'data-ai-hint': image.dataAiHint })}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none" />
            </Carousel>

            <div className="w-full text-center md:text-left">
              <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
                Discover Freshness at <span className="text-accent">Vical Farmart</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Search for fresh produce, artisanal goods, and more from local sellers.
              </p>

              <form onSubmit={handleSearchSubmit} className="w-full max-w-3xl mx-auto md:mx-0 space-y-4 bg-card p-6 rounded-lg shadow-lg border">
                  <Input
                    type="search"
                    placeholder="Search e.g., organic apples, fresh tomatoes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-12 text-base"
                    aria-label="Search products"
                  />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_REGION_SELECTED}>All Regions</SelectItem>
                      {PRODUCT_REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedTown}
                    onValueChange={setSelectedTown}
                    disabled={selectedRegion === NO_REGION_SELECTED || availableTowns.length === 0}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select Town" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_TOWN_SELECTED}>All Towns</SelectItem>
                      {availableTowns.map((town) => (
                        <SelectItem key={town} value={town}>
                          {town}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" size="lg" className="w-full h-12 text-lg shadow-md">
                  <SearchIcon className="mr-2 h-5 w-5" /> Search Market
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 w-full bg-background">
        <div className="container mx-auto px-12">
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
