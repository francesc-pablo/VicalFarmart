
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
import { Eye, PlayCircle } from "lucide-react";
import { format } from "date-fns";

interface CourierOrderTableProps {
  orders: Order[];
  onViewDetails?: (orderId: string) => void;
  onUpdateStatus?: (orderId: string, newStatus: OrderStatus) => void;
}

const getStatusBadgeVariant = (status: OrderStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "Pending": return "outline";
    case "Processing": return "secondary";
    case "Shipped": return "default";
    case "Delivered": return "default";
    case "Paid": return "default";
    case "Cancelled": return "destructive";
    default: return "outline";
  }
};

const getCurrencySymbol = (currencyCode?: string) => {
    if (currencyCode === "GHS") return "₵";
    if (currencyCode === "USD") return "$";
    return "$"; // Default
};

export function CourierOrderTable({ orders, onViewDetails, onUpdateStatus }: CourierOrderTableProps) {
  
  const handleStartProcessing = (order: Order) => {
    if (onUpdateStatus && order.status === 'Pending' || order.status === 'Paid') {
      onUpdateStatus(order.id, 'Processing');
    }
  };

  return (
    <div className="w-full overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[100px]">Order ID</TableHead>
          <TableHead className="min-w-[150px]">Customer</TableHead>
          <TableHead className="hidden sm:table-cell min-w-[120px]">Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead className="min-w-[120px]">Status</TableHead>
          <TableHead className="hidden md:table-cell min-w-[120px]">Payment</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length > 0 ? (
          orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">#{order.id.substring(0, 6)}</TableCell>
              <TableCell className="truncate">{order.customerName}</TableCell>
              <TableCell className="hidden sm:table-cell">{format(new Date(order.orderDate), "MMM d, yyyy")}</TableCell>
              <TableCell>{getCurrencySymbol(order.currency)}{order.totalAmount.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">
                    {order.status}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant={order.paymentMethod === 'Online Payment' ? 'default' : 'secondary'} className="text-xs">
                  {order.paymentMethod}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-1">
                {(order.status === 'Pending' || order.status === 'Paid') && onUpdateStatus && (
                  <Button variant="outline" size="sm" onClick={() => handleStartProcessing(order)} title="Start Processing">
                    <PlayCircle className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                )}
                {onViewDetails && (
                  <Button variant="ghost" size="icon" onClick={() => onViewDetails(order.id)} title="View Details">
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center h-24">
              No orders found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
    </div>
  );
}
