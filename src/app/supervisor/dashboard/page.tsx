
"use client";

import React from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, Package } from 'lucide-react';

export default function SupervisorDashboardPage() {
  return (
    <div>
      <PageHeader title="Supervisor Dashboard" description="Oversee sellers, couriers, and orders." />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Manage Users</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Add, view, and manage sellers and couriers on the platform.</p>
            <Button asChild>
                <Link href="/supervisor/dashboard/users">Go to Users</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Manage Orders</CardTitle>
            <Package className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">View all platform orders and assign courier services for delivery.</p>
             <Button asChild>
                <Link href="/supervisor/dashboard/orders">Go to Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
