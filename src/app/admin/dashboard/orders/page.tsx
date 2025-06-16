
"use client";
import React, { useState } from 'react';
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

// Mock data for all platform orders - replace with actual data fetching
const mockPlatformOrders: Order[] = [
  { id: "ORD001", customerId: "cust123", customerName: "Alice Wonderland", items: [{ productId: "1", productName: "Organic Apples", quantity: 2, price: 2.99 }], totalAmount: 5.98, status: "Pending", paymentMethod: "Mobile Payment", shippingAddress: "123 Rabbit Hole", orderDate: new Date().toISOString(), sellerId: "sellerBob" },
  { id: "ORD002", customerId: "cust456", customerName: "Bob The Builder", items: [{ productId: "2", productName: "Heirloom Tomatoes", quantity: 1, price: 4.50 }], totalAmount: 4.50, status: "Processing", paymentMethod: "Pay on Delivery", shippingAddress: "456 Fixit Lane", orderDate: new Date(Date.now() - 86400000).toISOString(), sellerId: "sellerJane"},
  { id: "ORD003", customerId: "cust789", customerName: "Charlie Brown", items: [{ productId: "3", productName: "Whole Wheat Bread", quantity: 1, price: 5.00 }], totalAmount: 5.00, status: "Shipped", paymentMethod: "Mobile Payment", shippingAddress: "789 Comic Strip", orderDate: new Date(Date.now() - 172800000).toISOString(), sellerId: "sellerBob"},
  { id: "ORD004", customerId: "cust101", customerName: "Diana Prince", items: [{ productId: "1", productName: "Organic Apples", quantity: 5, price: 2.99 }], totalAmount: 14.95, status: "Delivered", paymentMethod: "Pay on Delivery", shippingAddress: "1 Paradise Island", orderDate: new Date(Date.now() - 259200000).toISOString(), sellerId: "sellerEve"},
  { id: "ORD005", customerId: "cust202", customerName: "Edward Elric", items: [{ productId: "XYZ", productName: "Alchemy Kit", quantity: 1, price: 99.99 }], totalAmount: 99.99, status: "Cancelled", paymentMethod: "Mobile Payment", shippingAddress: "Central City", orderDate: new Date(Date.now() - 345600000).toISOString(), sellerId: "sellerBigStore"},
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockPlatformOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");
  const { toast } = useToast();

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
    toast({ title: "Order Status Updated", description: `Order ${orderId.substring(0,6)}... marked as ${newStatus} by admin.` });
  };

  const filteredOrders = orders
    .filter(order => statusFilter === "All" || order.status === statusFilter)
    .filter(order => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.sellerId && order.sellerId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  
  const orderStatuses: (OrderStatus | "All")[] = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

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
          <OrderTable 
            orders={filteredOrders} 
            onUpdateStatus={handleUpdateStatus}
            onViewDetails={(id) => alert(`Admin view details for order: ${id}`)} // Replace with actual detail view logic
            showSellerColumn={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
