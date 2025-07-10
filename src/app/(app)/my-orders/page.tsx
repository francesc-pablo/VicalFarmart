
"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { OrderTable } from "@/components/shared/OrderTable";
import type { Order, OrderStatus, User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Package, History, ShoppingCart, Mail, User as UserIcon, MapPin, CreditCard, Box, Hash, CalendarIcon, Phone } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getOrdersByCustomerId } from '@/services/orderService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';


export default function MyOrdersPage() {
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
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
            const ordersForCustomer = await getOrdersByCustomerId(user.uid);
            setCustomerOrders(ordersForCustomer);
          }
        } else {
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
  
  const getCurrencySymbol = (currencyCode?: string) => {
    if (currencyCode === "GHS") return "₵";
    return "$"; // Default
  };

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
    <>
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
                  <OrderTable orders={ongoingOrders} onViewDetails={(id) => setSelectedOrder(customerOrders.find(o => o.id === id) || null)} showSellerColumn={false} />
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
                  <OrderTable orders={pastOrders} onViewDetails={(id) => setSelectedOrder(customerOrders.find(o => o.id === id) || null)} showSellerColumn={false} />
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
      
      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
                <DialogDescription>
                  Detailed information for your order #{selectedOrder.id.substring(0, 6)}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2"><Hash className="h-4 w-4 text-primary"/> <span><strong>Order ID:</strong> #{selectedOrder.id.substring(0, 6)}</span></div>
                  <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-primary"/> <span><strong>Date:</strong> {format(new Date(selectedOrder.orderDate), 'PPP')}</span></div>
                  <div className="flex items-center gap-2"><Box className="h-4 w-4 text-primary"/> <span><strong>Status:</strong> {selectedOrder.status}</span></div>
                  <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary"/> <span><strong>Payment:</strong> {selectedOrder.paymentMethod}</span></div>
                </div>
                
                <Separator />

                <div>
                    <h4 className="font-semibold mb-2">Items Ordered</h4>
                    <div className="space-y-2">
                        {selectedOrder.items.map(item => (
                            <div key={item.productId} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded-md">
                                <div>
                                    <p className="font-medium">{item.productName}</p>
                                    <p className="text-muted-foreground">{item.quantity} x {getCurrencySymbol(selectedOrder.items[0]?.price.toString())}{item.price.toFixed(2)}</p>
                                </div>
                                <p className="font-semibold">{getCurrencySymbol(selectedOrder.items[0]?.price.toString())}{(item.quantity * item.price).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total Amount:</span>
                    <span>{getCurrencySymbol(selectedOrder.items[0]?.price.toString())}{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
                
                <Separator />

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><UserIcon className="h-4 w-4 text-primary"/> Shipping Details</h4>
                  <div className="text-sm p-3 bg-muted/50 rounded-md space-y-2">
                    <p><strong>{selectedOrder.customerName}</strong></p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{selectedOrder.customerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{selectedOrder.customerPhone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-muted-foreground pt-1">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="break-all">{selectedOrder.shippingAddress}</span>
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
