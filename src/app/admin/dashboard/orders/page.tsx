
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { OrderTable } from "@/components/shared/OrderTable";
import type { Order, OrderStatus } from "@/types";
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
import { getAllOrders, updateOrderStatus, getOrderById } from '@/services/orderService';
import { getUserById } from '@/services/userService';
import { sendOrderStatusUpdateEmail } from '@/ai/flows/emailFlows';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminOrdersPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    const ordersFromDb = await getAllOrders();
    setAllOrders(ordersFromDb);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
        await updateOrderStatus(orderId, newStatus);
        toast({ title: "Order Status Updated", description: `Order #${orderId.substring(0,6)} marked as ${newStatus}.` });
        fetchOrders(); // Re-fetch to get the latest state

        // Send notification emails
        const order = await getOrderById(orderId);
        if (order) {
            // 1. Notify Customer
            const customer = await getUserById(order.customerId);
            if (customer?.email) {
                await sendOrderStatusUpdateEmail({
                    recipientEmail: customer.email,
                    recipientRole: 'customer',
                    customerName: order.customerName,
                    orderId: order.id,
                    newStatus: newStatus,
                    items: order.items.map(i => ({ productName: i.productName, quantity: i.quantity })),
                });
            }

            // 2. Notify Seller
            if (order.sellerId) {
                const seller = await getUserById(order.sellerId);
                if (seller?.email) {
                     await sendOrderStatusUpdateEmail({
                        recipientEmail: seller.email,
                        recipientRole: 'seller',
                        customerName: order.customerName,
                        orderId: order.id,
                        newStatus: newStatus,
                        items: order.items.map(i => ({ productName: i.productName, quantity: i.quantity })),
                    });
                }
            }
        }
    } catch (error) {
        toast({ title: "Update Failed", description: "Could not update the order status.", variant: "destructive" });
    }
  };

  const filteredOrders = allOrders
    .filter(order => statusFilter === "All" || order.status === statusFilter)
    .filter(order => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.sellerId && order.sellerId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  
  const orderStatuses: (OrderStatus | "All")[] = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Paid"];
  
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
      <PageHeader title="Platform Orders" description="Monitor and manage all orders placed on Vical Farmart." />
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow max-w-md">
            <Input
            placeholder="Search Order ID, Customer, or Seller..."
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
              onUpdateStatus={handleUpdateStatus}
              onViewDetails={(id) => alert(`Admin view details for order: ${id}`)} // Replace with actual detail view logic
              showSellerColumn={true}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
