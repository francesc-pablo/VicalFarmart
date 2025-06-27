
"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { OrderTable } from "@/components/shared/OrderTable";
import type { Order, OrderStatus, UserRole, User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Package, History, ShoppingCart } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';


// Mock orders - in a real app, these would be fetched based on the logged-in user
const allMockOrders: Order[] = [
  { id: "ORD701", customerId: "customer_user_id", customerName: "Customer User", items: [{ productId: "1", productName: "Organic Fuji Apples", quantity: 2, price: 3.99 }], totalAmount: 7.98, status: "Pending", paymentMethod: "Mobile Payment", shippingAddress: "123 Customer Lane", orderDate: new Date(Date.now() - 86400000 * 1).toISOString(), sellerId: "seller1" },
  { id: "ORD702", customerId: "customer_user_id", customerName: "Customer User", items: [{ productId: "2", productName: "Vine-Ripened Tomatoes", quantity: 3, price: 2.50 }, { productId: "5", productName: "Organic Spinach Bunch", quantity: 1, price: 2.99 }], totalAmount: 10.49, status: "Processing", paymentMethod: "Pay on Delivery", shippingAddress: "123 Customer Lane", orderDate: new Date(Date.now() - 86400000 * 2).toISOString(), sellerId: "seller2" },
  { id: "ORD703", customerId: "customer_user_id", customerName: "Customer User", items: [{ productId: "3", productName: "Artisanal Sourdough Bread", quantity: 1, price: 6.00 }], totalAmount: 6.00, status: "Shipped", paymentMethod: "Mobile Payment", shippingAddress: "123 Customer Lane", orderDate: new Date(Date.now() - 86400000 * 3).toISOString(), sellerId: "seller3" },
  { id: "ORD704", customerId: "customer_user_id", customerName: "Customer User", items: [{ productId: "4", productName: "Free-Range Chicken Eggs", quantity: 1, price: 5.50 }], totalAmount: 5.50, status: "Delivered", paymentMethod: "Mobile Payment", shippingAddress: "123 Customer Lane", orderDate: new Date(Date.now() - 86400000 * 7).toISOString(), sellerId: "seller1" },
  { id: "ORD705", customerId: "customer_user_id", customerName: "Customer User", items: [{ productId: "6", productName: "Raw Honey Jar", quantity: 1, price: 8.75 }], totalAmount: 8.75, status: "Cancelled", paymentMethod: "Pay on Delivery", shippingAddress: "123 Customer Lane", orderDate: new Date(Date.now() - 86400000 * 10).toISOString(), sellerId: "seller3" },
  // Orders for other customers to ensure filtering works
  { id: "ORD801", customerId: "other_cust_id", customerName: "Another Shopper", items: [{ productId: "1", productName: "Organic Fuji Apples", quantity: 1, price: 3.99 }], totalAmount: 3.99, status: "Delivered", paymentMethod: "Mobile Payment", shippingAddress: "456 Other St", orderDate: new Date(Date.now() - 86400000 * 5).toISOString(), sellerId: "seller1" },
];

export default function MyOrdersPage() {
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = { id: docSnap.id, ...docSnap.data() } as User;
          setCurrentUser(userData);
          if (userData.role === 'customer') {
            // In a real app, you'd fetch orders where customerId === user.uid
            // For now, we continue to mock and filter by name.
             const ordersForCustomer = allMockOrders.filter(order => order.customerName === userData.name);
             setCustomerOrders(ordersForCustomer);
          }
        } else {
           // No user doc, treat as not logged in for this page's purpose
           setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
        router.push('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const ongoingStatuses: OrderStatus[] = ["Pending", "Processing", "Shipped"];
  const pastStatuses: OrderStatus[] = ["Delivered", "Cancelled"];

  const ongoingOrders = customerOrders.filter(order => ongoingStatuses.includes(order.status));
  const pastOrders = customerOrders.filter(order => pastStatuses.includes(order.status));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'customer') {
     return (
      <div className="flex justify-center items-center h-64">
        <p>You must be logged in as a customer to view this page.</p>
        <Button onClick={() => router.push('/login')} className="ml-4">Login</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="My Orders"
        description={`Manage and track your orders, ${currentUser.name}.`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/market"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Market</Link>
          </Button>
        }
      />

      <Tabs defaultValue="ongoing" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 shadow-sm">
          <TabsTrigger value="ongoing" className="py-3 text-base">
            <Package className="mr-2 h-5 w-5" /> Ongoing Orders ({ongoingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="py-3 text-base">
            <History className="mr-2 h-5 w-5" /> Order History ({pastOrders.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ongoing">
          <Card className="shadow-lg">
            <CardContent className="p-0">
              {ongoingOrders.length > 0 ? (
                <OrderTable orders={ongoingOrders} onViewDetails={(id) => alert(`Viewing order ${id}`)} showSellerColumn={false} />
              ) : (
                <div className="p-10 text-center text-muted-foreground">
                  <ShoppingCart className="mx-auto h-12 w-12 mb-4" />
                  <p className="text-lg">You have no ongoing orders.</p>
                  <p>Ready to shop? <Link href="/market" className="text-primary hover:underline">Go to Market</Link></p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="past">
          <Card className="shadow-lg">
            <CardContent className="p-0">
               {pastOrders.length > 0 ? (
                <OrderTable orders={pastOrders} onViewDetails={(id) => alert(`Viewing order ${id}`)} showSellerColumn={false} />
              ) : (
                 <div className="p-10 text-center text-muted-foreground">
                  <History className="mx-auto h-12 w-12 mb-4" />
                  <p className="text-lg">No past orders found in your history.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
