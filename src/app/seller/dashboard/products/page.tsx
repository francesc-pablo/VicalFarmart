
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import type { Product } from "@/types";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getProductsBySellerId } from '@/services/productService';
import { getOrdersBySellerId } from '@/services/orderService';
import { Badge } from '@/components/ui/badge';

interface ProductWithStats extends Product {
  ordersCount: number;
  revenue: number;
}

const getCurrencySymbol = (currencyCode?: string) => {
  if (currencyCode === "GHS") return "₵";
  if (currencyCode === "USD") return "$";
  return "$"; // Default symbol
};

export default function SellerProductsPage() {
    const [productsWithStats, setProductsWithStats] = useState<ProductWithStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sellerId, setSellerId] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setSellerId(user.uid);
            } else {
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchData = useCallback(async () => {
        if (!sellerId) return;
        setIsLoading(true);

        try {
            const [products, orders] = await Promise.all([
                getProductsBySellerId(sellerId),
                getOrdersBySellerId(sellerId)
            ]);
            
            const statsMap = new Map<string, { ordersCount: number; revenue: number }>();

            // Only count completed orders for revenue and order count
            const completedOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'Paid');

            completedOrders.forEach(order => {
                const productIdsInOrder = new Set<string>();
                order.items.forEach(item => {
                    const currentStats = statsMap.get(item.productId) || { ordersCount: 0, revenue: 0 };
                    statsMap.set(item.productId, {
                        ...currentStats,
                        // Add revenue from this item
                        revenue: currentStats.revenue + (item.price * item.quantity),
                    });
                    // Track unique products in this order
                    productIdsInOrder.add(item.productId);
                });

                // Increment order count for each unique product in the order
                productIdsInOrder.forEach(productId => {
                    const currentStats = statsMap.get(productId)!;
                    statsMap.set(productId, {
                        ...currentStats,
                        ordersCount: currentStats.ordersCount + 1,
                    });
                });
            });

            const productsWithStatsData = products.map(product => ({
                ...product,
                ordersCount: statsMap.get(product.id)?.ordersCount || 0,
                revenue: statsMap.get(product.id)?.revenue || 0,
            })).sort((a, b) => b.revenue - a.revenue); // Sort by most revenue

            setProductsWithStats(productsWithStatsData);

        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Could not fetch your product data.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [sellerId, toast]);

    useEffect(() => {
        if (sellerId) {
            fetchData();
        }
    }, [sellerId, fetchData]);

    const ProductRowSkeleton = () => (
        <TableRow>
            <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        </TableRow>
    );

  return (
    <div>
      <PageHeader
        title="My Products"
        description="View performance analytics for your product listings."
      />

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] hidden sm:table-cell">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="hidden sm:table-cell">Price</TableHead>
                <TableHead className="hidden md:table-cell">Stock</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <>
                    <ProductRowSkeleton />
                    <ProductRowSkeleton />
                    <ProductRowSkeleton />
                </>
              ) : productsWithStats.length > 0 ? (
                productsWithStats.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        src={product.imageUrl || "https://placehold.co/100x100.png"}
                        alt={product.name}
                        width={50}
                        height={50}
                        className="rounded-md object-cover"
                        data-ai-hint={`${product.category} item`}
                      />
                    </TableCell>
                    <TableCell>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{product.id}</div>
                        <Badge variant="outline" className="font-normal mt-1">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{getCurrencySymbol(product.currency)}{product.price.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                    <TableCell className="font-medium">{product.ordersCount}</TableCell>
                    <TableCell className="font-medium">{getCurrencySymbol(product.currency)}{product.revenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    You have not listed any products yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
