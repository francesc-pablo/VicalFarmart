
"use client";
import React, { useCallback, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PageHeader } from "@/components/shared/PageHeader";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_CATEGORIES, PRODUCT_REGIONS, GHANA_REGIONS_AND_TOWNS } from '@/lib/constants';
import { getProducts } from '@/services/productService'; // Import the service
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export default function MarketPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const searchTerm = searchParams.get('search') || "";
  const categoryFilter = searchParams.get('category') || "All";
  const regionFilter = searchParams.get('region') || "All";
  const townFilter = searchParams.get('town') || "All";
  
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [availableTowns, setAvailableTowns] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const productsFromDb = await getProducts();
      setAllProducts(productsFromDb);
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (regionFilter && regionFilter !== 'All') {
      const townsForRegion = GHANA_REGIONS_AND_TOWNS[regionFilter] || [];
      setAvailableTowns(townsForRegion);
    } else {
      setAvailableTowns([]);
    }
  }, [regionFilter]);
  
  const createQueryString = useCallback((updates: { [key: string]: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value.toLowerCase() !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    return params.toString();
  }, [searchParams]);
  
  const handleFilterChange = (key: 'category' | 'region' | 'town', value: string) => {
    let updates = { [key]: value };
    if (key === 'region') {
      updates['town'] = 'All'; // Reset town when region changes
    }
    const queryString = createQueryString(updates);
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryString = createQueryString({ search: localSearchTerm });
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };
  
  const filteredProducts = allProducts
    .filter(product => categoryFilter === "All" || product.category === categoryFilter)
    .filter(product => regionFilter === "All" || !product.region || product.region === regionFilter)
    .filter(product => townFilter === "All" || !product.town || product.town === townFilter)
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sellerName && product.sellerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.region && product.region.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.town && product.town.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const ProductSkeleton = () => (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[224px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Explore the Market"
        description="Discover fresh produce and artisanal goods from local sellers."
      />

      <form onSubmit={handleSearchSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-8 sticky top-[70px] bg-background/95 py-4 z-10 shadow-sm rounded-lg p-4 border backdrop-blur-sm">
            <div className="relative lg:col-span-2">
                <Input
                    type="search"
                    placeholder="Search by product, seller..."
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                    className="pr-10 h-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            
            <Select value={categoryFilter} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {PRODUCT_CATEGORIES.map(category => (<SelectItem key={category} value={category}>{category}</SelectItem>))}
                </SelectContent>
            </Select>

            <Select value={regionFilter} onValueChange={(value) => handleFilterChange('region', value)}>
                <SelectTrigger className="h-10"><MapPin className="h-4 w-4 mr-2" /><SelectValue placeholder="All Regions" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Regions</SelectItem>
                    {PRODUCT_REGIONS.map(region => (<SelectItem key={region} value={region}>{region}</SelectItem>))}
                </SelectContent>
            </Select>

            <Select value={townFilter} onValueChange={(value) => handleFilterChange('town', value)} disabled={regionFilter === 'All' || availableTowns.length === 0}>
                <SelectTrigger className="h-10"><SelectValue placeholder="All Towns" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Towns</SelectItem>
                    {availableTowns.map(town => (<SelectItem key={town} value={town}>{town}</SelectItem>))}
                </SelectContent>
            </Select>
            
            <Button type="submit" className="w-full h-10 md:hidden lg:inline-flex">Search</Button>
        </div>
      </form>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No products found matching your criteria.</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search term or filters.</p>
        </div>
      )}
    </div>
  );
}
