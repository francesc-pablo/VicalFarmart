
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CheckCircle, Truck, Clock } from "lucide-react";
import type { Order } from '@/types';
import { getOrdersByCourierId } from '@/services/orderService';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function CourierDashboardPage() {
  const router = useRouter();
  const [courierId, setCourierId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchData = useCallback(async () => {
    if (!courierId) return;
    setIsLoading(true);
    const courierOrders = await getOrdersByCourierId(courierId);
    setOrders(courierOrders);
    setIsLoading(false);
  }, [courierId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const assignedOrders = orders.length;
  const inProgressOrders = orders.filter(o => o.status === 'Processing' || o.status === 'Shipped').length;
  const completedOrders = orders.filter(o => o.status === 'Delivered').length;
  
  const recentOrders = orders.slice(0, 5);

  const statCards = [
    { title: "Total Assigned", value: assignedOrders, icon: Package, color: "text-blue-500" },
    { title: "In Progress", value: inProgressOrders, icon: Truck, color: "text-orange-500" },
    { title: "Completed Deliveries", value: completedOrders, icon: CheckCircle, color: "text-green-500" },
  ];
  
  return (
    <div>
      <PageHeader title="Courier Overview" description="Welcome back! Here's a summary of your assigned deliveries." />
      
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
            <span>Recently Assigned Orders</span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/courier/dashboard/orders">View all</Link>
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
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.substring(0, 6)}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell className="hidden sm:table-cell">{format(new Date(order.orderDate), "MMM d, yyyy")}</TableCell>
                    <TableCell><Badge variant={order.status === 'Delivered' ? 'default' : 'outline'}>{order.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center p-8">You have no orders assigned yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
