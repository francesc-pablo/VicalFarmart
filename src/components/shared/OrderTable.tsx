"use client";

import type { Order, OrderStatus } from "@/types";
import Image from "next/image"; // Not used here, but good practice to keep if items had images
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

interface OrderTableProps {
  orders: Order[];
  onViewDetails?: (orderId: string) => void;
  onUpdateStatus?: (orderId: string, newStatus: OrderStatus) => void;
  showSellerColumn?: boolean; // For admin view
}

const getStatusBadgeVariant = (status: OrderStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "Pending":
      return "outline";
    case "Processing":
      return "secondary";
    case "Shipped":
      return "default"; // Using primary color
    case "Delivered":
      return "default"; // Using a success-like variant (shadcn default is fine)
    case "Paid": // Assuming 'Paid' is a distinct success state or part of 'Delivered'
      return "default"; // green
    case "Cancelled":
      return "destructive";
    default:
      return "outline";
  }
};


export function OrderTable({ orders, onViewDetails, onUpdateStatus, showSellerColumn }: OrderTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          {showSellerColumn && <TableHead>Seller</TableHead>}
          <TableHead>Date</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length > 0 ? (
          orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">#{order.id.substring(0, 6)}...</TableCell>
              <TableCell>{order.customerName}</TableCell>
              {showSellerColumn && <TableCell>{order.sellerId || 'N/A'}</TableCell>}
              <TableCell>{format(new Date(order.orderDate), "MMM d, yyyy")}</TableCell>
              <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={order.paymentMethod === 'Mobile Payment' ? 'default' : 'secondary'}>
                  {order.paymentMethod}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {onViewDetails && (
                  <Button variant="ghost" size="icon" onClick={() => onViewDetails(order.id)} title="View Details">
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                {onUpdateStatus && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                   <Button variant="ghost" size="icon" onClick={() => onUpdateStatus(order.id, 'Shipped')} title="Mark as Shipped"> {/* Example action */}
                    <Truck className="h-4 w-4" />
                  </Button>
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
