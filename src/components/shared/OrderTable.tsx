
"use client";

import type { Order, OrderStatus } from "@/types";
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
import { Eye } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Added Select components

interface OrderTableProps {
  orders: Order[];
  onViewDetails?: (orderId: string) => void;
  onUpdateStatus?: (orderId: string, newStatus: OrderStatus) => void;
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

const availableOrderStatuses: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export function OrderTable({ orders, onViewDetails, onUpdateStatus, showSellerColumn }: OrderTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          {showSellerColumn && <TableHead>Seller</TableHead>}
          <TableHead className="hidden sm:table-cell">Date</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden md:table-cell">Payment</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length > 0 ? (
          orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">#{order.id.substring(0, 6)}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              {showSellerColumn && <TableCell className="text-sm text-muted-foreground">{order.sellerId || 'N/A'}</TableCell>}
              <TableCell className="hidden sm:table-cell">{format(new Date(order.orderDate), "MMM d, yyyy")}</TableCell>
              <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant={order.paymentMethod === 'Mobile Payment' ? 'default' : 'secondary'} className="text-xs">
                  {order.paymentMethod}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-1">
                {onViewDetails && (
                  <Button variant="ghost" size="icon" onClick={() => onViewDetails(order.id)} title="View Details">
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                {onUpdateStatus && !['Delivered', 'Cancelled'].includes(order.status) && (
                  <Select
                    defaultValue={order.status}
                    onValueChange={(newStatus: string) => onUpdateStatus(order.id, newStatus as OrderStatus)}
                  >
                    <SelectTrigger className="h-8 w-[120px] text-xs inline-flex focus:ring-primary">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableOrderStatuses.map(s => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                 {/* Show status if final and no update possible */}
                {onUpdateStatus && ['Delivered', 'Cancelled'].includes(order.status) && (
                   <span className="text-xs text-muted-foreground italic pr-2">
                     {order.status}
                   </span>
                )}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={showSellerColumn ? 8 : 7} className="text-center h-24">
              No orders found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
