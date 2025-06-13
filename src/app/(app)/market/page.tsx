
"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from "@/components/shared/PageHeader";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_CATEGORIES, PRODUCT_REGIONS } from '@/lib/constants';

// Mock data for products
const mockProducts: Product[] = [
  { id: "1", name: "Organic Fuji Apples", description: "Crisp and sweet organic Fuji apples, perfect for snacking or baking. Grown locally.", price: 3.99, category: "Fruits", imageUrl: "https://placehold.co/400x300.png", stock: 120, sellerId: "seller1", sellerName: "Green Valley Orchards", region: "North" },
  { id: "2", name: "Vine-Ripened Tomatoes", description: "Juicy and flavorful vine-ripened tomatoes, ideal for salads and sauces.", price: 2.50, category: "Vegetables", imageUrl: "https://placehold.co/400x300.png", stock: 80, sellerId: "seller2", sellerName: "Sunshine Farms", region: "South" },
  { id: "3", name: "Artisanal Sourdough Bread", description: "Freshly baked artisanal sourdough bread with a chewy crust and tangy flavor.", price: 6.00, category: "Grains", imageUrl: "https://placehold.co/400x300.png", stock: 25, sellerId: "seller3", sellerName: "The Local Bakery", region: "West" },
  { id: "4", name: "Free-Range Chicken Eggs", description: "Farm-fresh free-range chicken eggs, rich in color and taste.", price: 5.50, category: "Dairy", imageUrl: "https://placehold.co/400x300.png", stock: 50, sellerId: "seller1", sellerName: "Happy Hens Farm", region: "North" },
  { id: "5", name: "Organic Spinach Bunch", description: "A healthy bunch of organic spinach, great for smoothies or cooking.", price: 2.99, category: "Vegetables", imageUrl: "https://placehold.co/400x300.png", stock: 70, sellerId: "seller2", sellerName: "Sunshine Farms", region: "Central" },
  { id: "6", name: "Raw Honey Jar", description: "Pure, unfiltered raw honey from local beekeepers. Nature's sweetener.", price: 8.75, category: "Other", imageUrl: "https://placehold.co/400x300.png", stock: 40, sellerId: "seller3", sellerName: "Buzzworthy Bees", region: "East" },
  { id: "7", name: "Grass-Fed Beef Steak", description: "Premium quality grass-fed beef steak, tender and flavorful.", price: 12.99, category: "Meat", imageUrl: "https://placehold.co/400x300.png", stock: 30, sellerId: "seller4", sellerName: "Pasture Perfect Meats", region: "West" },
  { id: "8", name: "Pastured Chicken Breast", description: "Juicy and healthy pastured chicken breast.", price: 9.50, category: "Poultry", imageUrl: "https://placehold.co/400x300.png", stock: 45, sellerId: "seller4", sellerName: "Pasture Perfect Meats", region: "Central" },
];


export default function MarketPage() {
  const searchParams = useSearchParams();
  
  const initialSearchTerm = searchParams.get('search') || "";
  const initialCategoryFilter = searchParams.get('category') || "All";
  const initialRegionFilter = searchParams.get('region') || "All";

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategoryFilter);
  const [regionFilter, setRegionFilter] = useState<string>(initialRegionFilter); // Page-level region filter, initialized by URL

  useEffect(() => {
    // Update filters if URL parameters change (e.g., from header search)
    setSearchTerm(searchParams.get('search') || "");
    setCategoryFilter(searchParams.get('category') || "All");
    setRegionFilter(searchParams.get('region') || "All");
  }, [searchParams]);

  const filteredProducts = mockProducts
    .filter(product => categoryFilter === "All" || product.category === categoryFilter)
    .filter(product => regionFilter === "All" || !product.region || product.region === regionFilter) // Handle products without a region
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.region && product.region.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  // Function to update URL and internal state for page-level filters
  // This is for the filters *on this page*, not the header search
  const handlePageSearchTermChange = (value: string) => {
    setSearchTerm(value);
    // Optionally, update URL if you want page-level search to reflect in URL immediately
    // const newParams = new URLSearchParams(searchParams.toString());
    // if (value) newParams.set('search', value); else newParams.delete('search');
    // router.push(`/market?${newParams.toString()}`); // Requires useRouter
  };

  const handlePageCategoryChange = (value: string) => {
    setCategoryFilter(value);
    // Optionally, update URL
    // const newParams = new URLSearchParams(searchParams.toString());
    // if (value && value !== "All") newParams.set('category', value); else newParams.delete('category');
    // router.push(`/market?${newParams.toString()}`); // Requires useRouter
  };
  
  // Note: Region filtering is primarily controlled by the header search.
  // This page just consumes the region from the URL.
  // If you wanted a page-level region filter distinct from the header, you'd add another Select here.

  return (
    <div>
      <PageHeader
        title="Explore the Market"
        description="Discover fresh produce and artisanal goods from local sellers."
      />

      {/* Page-level filters: these can refine or override what was set by header search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 sticky top-16 bg-background py-4 z-10 shadow-sm rounded-lg p-4 border">
        <Input
          placeholder="Refine search on this page..."
          value={searchTerm} // Reflects URL param or page input
          onChange={(e) => handlePageSearchTermChange(e.target.value)}
          className="flex-grow"
          icon={<Search className="h-4 w-4 text-muted-foreground" />}
        />
        <Select value={categoryFilter} onValueChange={handlePageCategoryChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {PRODUCT_CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Display the active region filter from URL (set by header) */}
        <div className="p-2 border rounded-md text-sm bg-muted min-w-[180px] text-center">
          Region: <span className="font-semibold">{regionFilter === "All" ? "All Regions" : regionFilter}</span>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No products found matching your criteria.</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search term, category, or region.</p>
        </div>
      )}
    </div>
  );
}
