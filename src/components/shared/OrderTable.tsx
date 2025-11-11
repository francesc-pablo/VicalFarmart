

"use client";

import type { Order, OrderStatus, Courier } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Truck } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderTableProps {
  orders: Order[];
  couriers?: Courier[];
  onViewDetails?: (orderId: string) => void;
  onUpdateStatus?: (orderId: string, newStatus: OrderStatus) => void;
  onAssignCourier?: (orderId: string, courierId: string, courierName: string) => void;
  showSellerColumn?: boolean; 
}

const getStatusBadgeVariant = (status: OrderStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "Pending":
      return "outline"; // Yellowish or neutral
    case "Processing":
      return "secondary"; // Blueish or informative
    case "Shipped":
      return "default"; // Primary color (greenish in this theme)
    case "Delivered":
      return "default"; // Using a success-like variant (e.g., green-bg if customized)
    case "Paid": // This status might be combined or handled differently
      return "default";
    case "Cancelled":
      return "destructive"; // Red
    default:
      return "outline";
  }
};

const getCurrencySymbol = (currencyCode?: string) => {
    if (currencyCode === "GHS") return "₵";
    if (currencyCode === "USD") return "$";
    return "$"; // Default
};

const availableOrderStatuses: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const NO_COURIER_VALUE = "__NONE__";

export function OrderTable({ orders, couriers = [], onViewDetails, onUpdateStatus, onAssignCourier, showSellerColumn }: OrderTableProps) {
  
  const getUniqueSellers = (order: Order): string[] => {
    if (!order.items || order.items.length === 0) {
      return order.sellerName ? [order.sellerName] : ['N/A'];
    }
    const sellerNames = new Set(order.items.map(item => item.sellerName).filter(Boolean) as string[]);
    if (sellerNames.size === 0) {
       return order.sellerName ? [order.sellerName] : ['N/A'];
    }
    return Array.from(sellerNames);
  };
  
  return (
    <div className="w-full overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[100px]">Order ID</TableHead>
          <TableHead className="min-w-[150px]">Customer</TableHead>
          {showSellerColumn && <TableHead className="min-w-[150px]">Seller(s)</TableHead>}
          {onAssignCourier && <TableHead className="min-w-[180px]">Courier</TableHead>}
          <TableHead className="hidden sm:table-cell min-w-[120px]">Date</TableHead>
          <TableHead>Total</TableHead>
          <TableHead className="min-w-[120px]">Status</TableHead>
          <TableHead className="hidden md:table-cell min-w-[120px]">Payment</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length > 0 ? (
          orders.map((order) => {
            const sellers = getUniqueSellers(order);
            return (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id.substring(0, 6)}</TableCell>
                <TableCell className="truncate">{order.customerName}</TableCell>
                {showSellerColumn && (
                  <TableCell className="text-sm text-muted-foreground">
                    {sellers.map((seller, index) => (
                      <div key={index} className="truncate">{seller}</div>
                    ))}
                  </TableCell>
                )}
                {onAssignCourier && (
                  <TableCell>
                    <Select
                      value={order.courierId || NO_COURIER_VALUE}
                      onValueChange={(courierId) => {
                        if (courierId === NO_COURIER_VALUE) return;
                        const selectedCourier = couriers.find(c => c.id === courierId);
                        if (selectedCourier) {
                            onAssignCourier(order.id, selectedCourier.id, selectedCourier.businessName);
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <Truck className="mr-2 h-3 w-3" />
                        <SelectValue placeholder="Assign Courier..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_COURIER_VALUE} disabled>Assign a courier</SelectItem>
                        {couriers.map(courier => (
                          <SelectItem key={courier.id} value={courier.id} className="text-xs">
                            {courier.businessName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                )}
                <TableCell className="hidden sm:table-cell">{format(new Date(order.orderDate), "MMM d, yyyy")}</TableCell>
                <TableCell>{getCurrencySymbol(order.currency)}{order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  {onUpdateStatus ? (
                    <Select
                      value={order.status}
                      onValueChange={(newStatus: string) => onUpdateStatus(order.id, newStatus as OrderStatus)}
                      disabled={['Delivered', 'Cancelled'].includes(order.status)}
                    >
                      <SelectTrigger className={`h-8 w-auto text-xs inline-flex focus:ring-primary border-none focus:ring-0 shadow-none bg-transparent ${['Delivered', 'Cancelled'].includes(order.status) ? "pointer-events-none" : ""}`}>
                         <SelectValue asChild>
                           <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">
                             {order.status}
                           </Badge>
                         </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {availableOrderStatuses.map(s => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">
                      {order.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={order.paymentMethod === 'Online Payment' ? 'default' : 'secondary'} className="text-xs">
                    {order.paymentMethod}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  {onViewDetails && (
                    <Button variant="ghost" size="icon" onClick={() => onViewDetails(order.id)} title="View Details">
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={showSellerColumn ? 9 : 8} className="text-center h-24">
              No orders found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
    </div>
  );
}
