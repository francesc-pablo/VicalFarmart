
"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBasket, Package, DollarSign } from "lucide-react";
import type { User } from '@/types';
import { getUsers } from '@/services/userService';
import { getAllOrders } from '@/services/orderService';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSellers: 0,
    totalOrders: 0,
    platformRevenue: 0,
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const [users, orders] = await Promise.all([
        getUsers(),
        getAllOrders(),
      ]);

      const totalUsers = users.length;
      const activeSellers = users.filter(u => u.role === 'seller' && u.isActive).length;
      const totalOrders = orders.length;
      const platformRevenue = orders
        .filter(o => o.status === 'Delivered' || o.status === 'Paid')
        .reduce((sum, order) => sum + order.totalAmount, 0);

      setStats({
        totalUsers,
        activeSellers,
        totalOrders,
        platformRevenue,
      });

      setRecentUsers(users.slice(0, 5));

      setIsLoading(false);
    }

    fetchData();
  }, []);

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase();

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500" },
    { title: "Active Sellers", value: stats.activeSellers, icon: ShoppingBasket, color: "text-primary" },
    { title: "Total Orders", value: stats.totalOrders, icon: Package, color: "text-orange-500" },
    { title: "Platform Revenue", value: `$${stats.platformRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-500" },
  ];

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Oversee platform activities and manage users." />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Recent User Registrations</span>
               <Button variant="outline" size="sm" asChild>
                <Link href="/admin/dashboard/users">View all</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-4">
                     <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl || "https://placehold.co/40x40.png"} alt={user.name} data-ai-hint="person face" />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p className="capitalize">{user.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent registrations to display yet.</p>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Order Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-4">Order trends data will be shown here.</p>
            {/* Placeholder for order trends chart or list */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
