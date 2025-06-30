
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ClipboardList, DollarSign, Clock } from "lucide-react";
import type { Order } from '@/types';
import { getOrdersBySellerId } from '@/services/orderService';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function SellerDashboardPage() {
  const router = useRouter();
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchData = useCallback(async () => {
    if (!sellerId) return;
    setIsLoading(true);
    const sellerOrders = await getOrdersBySellerId(sellerId);
    setOrders(sellerOrders);
    setIsLoading(false);
  }, [sellerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalRevenue = orders
    .filter(o => o.status === 'Delivered' || o.status === 'Paid')
    .reduce((sum, order) => sum + order.totalAmount, 0);
  
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
  
  const recentOrders = orders.slice(0, 5);

  const statCards = [
    { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-500" },
    { title: "Total Orders", value: totalOrders, icon: Package, color: "text-primary" },
    { title: "Pending Orders", value: pendingOrders, icon: Clock, color: "text-orange-500" },
  ];
  
  return (
    <div>
      <PageHeader title="Seller Overview" description="Welcome back! Here's a summary of your store's activity." />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3" />
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat) => (
            <Card key={stat.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Recent Orders</span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/seller/dashboard/orders">View all</Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : recentOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.substring(0, 6)}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell className="hidden sm:table-cell">{format(new Date(order.orderDate), "MMM d, yyyy")}</TableCell>
                    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell><Badge variant={order.status === 'Delivered' ? 'default' : 'outline'}>{order.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center p-8">You have no orders yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
