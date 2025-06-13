"use client";
import React, { useState } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import type { Order } from "@/types"; // Reusing Order type for payment context
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

// Mock data, derived from orders or a separate payments list
const mockPayments: (Order & { paymentDate?: string; transactionId?: string })[] = [
  { id: "PAY001", orderDate: new Date(Date.now() - 259200000).toISOString(), customerId:"cust101", customerName: "Diana Prince", totalAmount: 14.95, status: "Paid", paymentMethod: "Pay on Delivery", items: [], shippingAddress: "", paymentDate: new Date(Date.now() - 250000000).toISOString(), transactionId: "POD_DP001" },
  { id: "PAY002", orderDate: new Date(Date.now() - 172800000).toISOString(), customerId:"cust789", customerName: "Charlie Brown", totalAmount: 5.00, status: "Paid", paymentMethod: "Mobile Payment", items: [], shippingAddress: "", paymentDate: new Date(Date.now() - 170000000).toISOString(), transactionId: "MP_CB002" },
  { id: "PAY003", orderDate: new Date().toISOString(), customerId:"cust123", customerName: "Alice Wonderland", totalAmount: 5.98, status: "Pending", paymentMethod: "Mobile Payment", items: [], shippingAddress: "" }, // Pending payment
];

export default function SellerPaymentsPage() {
  const [payments] = useState(mockPayments);

  const totalPaid = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.totalAmount, 0);
  const pendingPaymentsCount = payments.filter(p => p.status === 'Pending' || (p.paymentMethod === 'Pay on Delivery' && p.status !== 'Paid')).length;

  return (
    <div>
      <PageHeader title="Payment Overview" description="Track your earnings and payment statuses." />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earned (All Time)</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalPaid.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingPaymentsCount}</div>
          </CardContent>
        </Card>
         <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Payout (Mock)</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Oct 15, {new Date().getFullYear()}</div>
            <p className="text-xs text-muted-foreground">Estimated payout amount: $550.00</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Details of all received and pending payments.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">#{payment.id.replace("PAY", "ORD")}</TableCell>
                    <TableCell>{payment.paymentDate ? format(new Date(payment.paymentDate), "MMM d, yyyy") : 'N/A'}</TableCell>
                    <TableCell>${payment.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={payment.paymentMethod === 'Mobile Payment' ? 'default' : 'secondary'}>
                        {payment.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'Paid' ? 'default' : 'outline'} className={payment.status === 'Paid' ? 'bg-green-100 text-green-700 border-green-300' : ''}>
                        {payment.status === 'Paid' ? 'Paid' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.transactionId || 'N/A'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No payment history found.
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
