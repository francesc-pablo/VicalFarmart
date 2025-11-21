
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import type { Order, OrderStatus } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Box, CalendarIcon, CreditCard, Hash, MapPin, User as UserIcon, Mail, Phone, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { getOrdersByCourierId, updateOrderStatus } from '@/services/orderService';
import { Skeleton } from '@/components/ui/skeleton';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { CourierOrderTable } from '@/components/courier/CourierOrderTable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import Image from "next/image";


export default function CourierOrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [courierId, setCourierId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCourierId(user.uid);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchOrders = useCallback(async () => {
    if (!courierId) return;
    setIsLoading(true);
    try {
      const courierOrders = await getOrdersByCourierId(courierId);
      setOrders(courierOrders);
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch your assigned orders.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [courierId, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast({ title: "Order Status Updated", description: `Order #${orderId.substring(0, 6)} is now ${newStatus}.` });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      toast({ title: "Update Failed", description: "Could not update the order status.", variant: "destructive" });
    }
  };


  const filteredOrders = orders
    .filter(order => statusFilter === "All" || order.status === statusFilter)
    .filter(order => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const orderStatuses: (OrderStatus | "All")[] = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Paid"];
  
  const getCurrencySymbol = (currencyCode?: string) => {
    if (currencyCode === "GHS") return "₵";
    if (currencyCode === "USD") return "$";
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
         </div>
       ))}
     </div>
   );

  return (
    <>
    <div>
      <PageHeader title="My Assigned Orders" description="Manage and update the status of your assigned deliveries." />
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow max-w-md">
            <Input
            placeholder="Search Order ID or Customer..."
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
            <CourierOrderTable 
              orders={filteredOrders} 
              onViewDetails={(id) => setSelectedOrder(orders.find(o => o.id === id) || null)}
              onUpdateStatus={handleUpdateStatus}
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
                <DialogTitle>Delivery Details</DialogTitle>
                <DialogDescription>
                  Delivery information for order #{selectedOrder.id.substring(0, 6)}.
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

                <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total Amount:</span>
                    <span>{getCurrencySymbol(selectedOrder.currency)}{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><UserIcon className="h-4 w-4 text-primary"/> Customer Details</h4>
                  <div className="text-sm p-3 bg-muted/50 rounded-md space-y-2">
                    <p><strong>{selectedOrder.customerName}</strong></p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{selectedOrder.customerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{selectedOrder.customerPhone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-muted-foreground pt-1">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                         <span>
                            {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.zipCode}
                        </span>
                    </div>
                     <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span><strong>ID Card:</strong> {selectedOrder.shippingAddress.idCardNumber || "N/A"}</span>
                    </div>
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
