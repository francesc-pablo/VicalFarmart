
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { OrderTable } from "@/components/shared/OrderTable";
import type { Order, OrderStatus } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Box, CalendarIcon, CreditCard, Hash, User as UserIcon } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';


export default function SellerOrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
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
  
  const getCurrencySymbol = (currencyCode?: string) => {
    if (currencyCode === "GHS") return "₵";
    return "$"; // Default
  };

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
    <>
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
              onViewDetails={(id) => setSelectedOrder(orders.find(o => o.id === id) || null)}
              showSellerColumn={false}
            />
          )}
        </CardContent>
      </Card>
    </div>

    {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
                <DialogDescription>
                  Detailed information for order #{selectedOrder.id.substring(0, 6)}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2"><Hash className="h-4 w-4 text-primary"/> <span><strong>Order ID:</strong> #{selectedOrder.id.substring(0, 6)}</span></div>
                  <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-primary"/> <span><strong>Date:</strong> {format(new Date(selectedOrder.orderDate), 'PPP')}</span></div>
                  <div className="flex items-center gap-2"><Box className="h-4 w-4 text-primary"/> <span><strong>Status:</strong> {selectedOrder.status}</span></div>
                  <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary"/> <span><strong>Payment:</strong> {selectedOrder.paymentMethod}</span></div>
                </div>
                
                <Separator />

                <div>
                    <h4 className="font-semibold mb-2">Items Ordered</h4>
                    <div className="space-y-2">
                        {selectedOrder.items.map(item => (
                            <div key={item.productId} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded-md">
                                <div>
                                    <p className="font-medium">{item.productName}</p>
                                    <p className="text-muted-foreground">{item.quantity} x {getCurrencySymbol(selectedOrder.items[0]?.price.toString())}{item.price.toFixed(2)}</p>
                                </div>
                                <p className="font-semibold">{getCurrencySymbol(selectedOrder.items[0]?.price.toString())}{(item.quantity * item.price).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total Amount:</span>
                    <span>{getCurrencySymbol(selectedOrder.items[0]?.price.toString())}{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
                
                <Separator />

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><UserIcon className="h-4 w-4 text-primary"/> Customer Details</h4>
                   <div className="text-sm p-3 bg-muted/50 rounded-md space-y-2">
                    <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                    <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                  </div>
                </div>

              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
