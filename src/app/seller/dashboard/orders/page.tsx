
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { OrderTable } from "@/components/shared/OrderTable";
import type { Order, OrderStatus, User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { getOrdersBySellerId } from '@/services/orderService';
import { Skeleton } from '@/components/ui/skeleton';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function SellerOrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setSellerId(user.uid);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchOrders = useCallback(async () => {
    if (!sellerId) return;
    setIsLoading(true);
    try {
      const sellerOrders = await getOrdersBySellerId(sellerId);
      setOrders(sellerOrders);
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch your orders.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [sellerId, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders
    .filter(order => statusFilter === "All" || order.status === statusFilter)
    .filter(order => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const orderStatuses: (OrderStatus | "All")[] = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
  
  const OrderTableSkeleton = () => (
     <div className="space-y-2 p-4">
       {[...Array(8)].map((_, i) => (
         <div key={i} className="flex items-center space-x-4 h-12">
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
         </div>
       ))}
     </div>
   );

  return (
    <div>
      <PageHeader title="My Sales" description="View all customer orders for your products." />
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow max-w-md">
            <Input
            placeholder="Search Order ID or Customer Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10" 
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
         <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value as OrderStatus | "All")}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {orderStatuses.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          {isLoading ? <OrderTableSkeleton /> : (
            <OrderTable 
              orders={filteredOrders} 
              onViewDetails={(id) => alert(`Seller view details for order: ${id}`)} // Replace with actual detail view logic
              showSellerColumn={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
