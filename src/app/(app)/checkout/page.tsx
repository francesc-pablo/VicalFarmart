
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, Minus, Package, Plus, ShoppingCart, Trash2, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createOrder } from '@/services/orderService';
import { getUsers, getUserById } from '@/services/userService';
import { sendNewOrderEmail, sendOrderConfirmationEmail } from '@/ai/flows/emailFlows';
import { auth } from '@/lib/firebase';
import type { Order, User, OrderItem } from '@/types';
import { onAuthStateChanged } from 'firebase/auth';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { v4 as uuidv4 } from 'uuid';


const getCurrencyForFlutterwave = (currencyCode?: string) => {
    const supportedCurrencies = ["GHS", "USD", "NGN", "XOF", "SLL", "LRD", "GMD", "GNF", "CVE", "EUR", "GBP"];
    if (currencyCode && supportedCurrencies.includes(currencyCode)) {
        return currencyCode;
    }
    return "GHS"; // Default to GHS if not supported
};

const getCurrencySymbol = (currencyCode?: string) => {
  if (currencyCode === "GHS") return "₵";
  if (currencyCode === "USD") return "$";
  return "$"; // Default symbol
};

const checkoutSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  address: z.string().min(5, { message: "Address is required." }),
  city: z.string().min(2, { message: "City is required." }),
  zipCode: z.string().min(3, { message: "ZIP code is required." }),
  phone: z.string().min(10, { message: "A valid phone number is required." }),
  idCardNumber: z.string().min(5, { message: "ID card number is required." }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"mobile" | "cod">("mobile");
  const { cartItems, updateCartItemQuantity, removeFromCart, clearCart } = useCart();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userProfile = await getUserById(user.uid);
        setCurrentUser(userProfile);
        if (userProfile) {
          form.reset({
            fullName: userProfile.name || "",
            email: userProfile.email || "",
            phone: userProfile.phone || "",
            address: userProfile.address || "",
            city: "",
            zipCode: "",
            idCardNumber: "",
          });
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 0 ? 5.00 : 0; // No shipping fee for empty cart
  const total = subtotal + shippingFee;
  const mainCurrency = useMemo(() => getCurrencyForFlutterwave(cartItems[0]?.currency), [cartItems]);
  const mainCurrencySymbol = getCurrencySymbol(mainCurrency);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      city: "",
      zipCode: "",
      phone: "",
      idCardNumber: "",
    },
  });

  const formValues = useWatch({ control: form.control });

  const handleCreateOrderInDB = async (
    data: CheckoutFormValues, 
    status: Order['status'], 
    paymentDetails?: Order['paymentDetails']
  ) => {
    if (!currentUser || cartItems.length === 0) return null;

    setIsProcessing(true);
    const orderItems: OrderItem[] = cartItems.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
    }));
    const sellerId = cartItems[0]?.sellerId;

    const orderData: Omit<Order, 'id' | 'orderDate'> = {
        customerId: currentUser.id,
        customerName: data.fullName,
        customerEmail: data.email,
        customerPhone: data.phone,
        items: orderItems,
        totalAmount: total,
        status: status,
        paymentMethod: paymentMethod === 'mobile' ? 'Mobile Payment' : 'Pay on Delivery',
        shippingAddress: {
            address: data.address,
            city: data.city,
            zipCode: data.zipCode,
            idCardNumber: data.idCardNumber,
        },
        sellerId: sellerId,
        ...(paymentDetails && { paymentDetails }),
    };

    const newOrderId = await createOrder(orderData);
    
    if (newOrderId) {
        toast({
            title: "Order Placed Successfully!",
            description: `Your order #${newOrderId.substring(0, 6)} will be processed.`,
        });

        try {
            // Send receipt to customer if paid
            if (status === 'Paid') {
              await sendOrderConfirmationEmail({
                customerEmail: data.email,
                customerName: data.fullName,
                orderId: newOrderId,
                totalAmount: total,
                paymentMethod: 'Mobile Payment',
                transactionId: String(paymentDetails?.transactionId || 'N/A'),
                items: orderItems,
                shippingAddress: {
                  address: data.address,
                  city: data.city,
                  zipCode: data.zipCode,
                },
              });
            }

            // Send notification to admin
            const allUsers = await getUsers();
            const adminUser = allUsers.find(u => u.role === 'admin');
            if (adminUser?.email) {
                await sendNewOrderEmail({
                    recipientEmail: adminUser.email,
                    recipientName: adminUser.name,
                    recipientRole: 'admin',
                    orderId: newOrderId,
                    customerName: data.fullName,
                    totalAmount: total,
                    items: orderItems,
                });
            }

            // Send notification to seller
            if (sellerId) {
                const seller = await getUserById(sellerId);
                if (seller?.email) {
                    await sendNewOrderEmail({
                        recipientEmail: seller.email,
                        recipientName: seller.name,
                        recipientRole: 'seller',
                        orderId: newOrderId,
                        customerName: data.fullName,
                        totalAmount: total,
                        items: orderItems,
                    });
                }
            }
        } catch (emailError) {
            console.error("Failed to send notification emails:", emailError);
            toast({
                title: "Email Error",
                description: "Your order was placed, but we couldn't send the notification emails.",
                variant: "destructive"
            });
        }

        clearCart();
        router.push("/my-orders");
    } else {
        toast({
            title: "Order Failed",
            description: "There was a problem saving your order. Please try again.",
            variant: "destructive",
        });
    }
    setIsProcessing(false);
    return newOrderId;
  };
  
  const flutterwaveConfig = {
      public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || '',
      tx_ref: `vicalfarmart-${uuidv4()}`,
      amount: total,
      currency: mainCurrency,
      payment_options: 'card,mobilemoney,ussd',
      customer: {
        email: formValues.email,
        phone_number: formValues.phone,
        name: formValues.fullName,
      },
      customizations: {
        title: 'Vical Farmart',
        description: 'Payment for items in cart',
        logo: 'https://res.cloudinary.com/ddvlexmvj/image/upload/v1751434079/VF_logo-removebg-preview_kgzusq.png',
      },
  };
  
  const handleFlutterwavePayment = useFlutterwave(flutterwaveConfig);

  async function handleFormSubmit(data: CheckoutFormValues) {
    setIsProcessing(true);
    if (!currentUser) {
        toast({ title: "Please log in", description: "You must be logged in to place an order.", variant: "destructive" });
        router.push('/login');
        setIsProcessing(false);
        return;
    }
    if (cartItems.length === 0) {
        toast({ title: "Empty Cart", description: "Cannot place an order with an empty cart.", variant: "destructive" });
        setIsProcessing(false);
        return;
    }

    if (paymentMethod === 'cod') {
        await handleCreateOrderInDB(data, 'Pending');
    } else {
        handleFlutterwavePayment({
            callback: async (response) => {
                console.log("Flutterwave Response:", response);
                if (response.status === 'successful') {
                    await handleCreateOrderInDB(data, 'Paid', {
                        transactionId: response.transaction_id,
                        status: response.status,
                        gateway: 'Flutterwave',
                    });
                } else {
                    toast({
                        title: "Payment Not Completed",
                        description: "Your payment was not completed successfully. Please try again.",
                        variant: "destructive"
                    });
                     setIsProcessing(false);
                }
                closePaymentModal();
            },
            onClose: () => {
                toast({
                    title: "Payment Canceled",
                    description: "You closed the payment window.",
                    variant: "destructive"
                });
                setIsProcessing(false);
            },
        });
    }
  };
  
  if (cartItems.length === 0 && !isProcessing) {
    return (
        <div className="max-w-4xl mx-auto text-center py-10">
            <PageHeader
                title="Your Cart is Empty"
                description="Looks like you haven't added anything to your cart yet."
            />
            <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
            <Button asChild>
                <Link href="/market">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Start Shopping
                </Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Checkout"
        description="Review your order and complete your purchase."
        actions={
          <Button variant="outline" asChild>
            <Link href="/market"><ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping</Link>
          </Button>
        }
      />

      <div className="grid md:grid-cols-3 gap-8">
        {/* Order Summary & Payment */}
        <div className="md:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4" id="shipping-form">
                   <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                             <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                       <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Anytown" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input placeholder="12345" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                          control={form.control}
                          name="idCardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ID Card Number (GH Card/Passport)</FormLabel>
                              <FormControl>
                                <Input placeholder="GHA-123456789-0 / P01234567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup defaultValue="mobile" value={paymentMethod} onValueChange={(value: "mobile" | "cod") => setPaymentMethod(value)}>
                <Label
                  htmlFor="mobilePayment"
                  className="flex items-center space-x-3 rounded-md border p-4 hover:bg-accent/50 [&:has([data-state=checked])]:border-primary"
                >
                  <RadioGroupItem value="mobile" id="mobilePayment" />
                  <CreditCard className="h-6 w-6 text-primary" />
                  <div>
                    <span className="block text-sm font-medium">Mobile Payment</span>
                    <span className="block text-xs text-muted-foreground">Pay securely with Flutterwave.</span>
                  </div>
                </Label>
                <Label
                  htmlFor="codPayment"
                  className="flex items-center space-x-3 rounded-md border p-4 hover:bg-accent/50 [&:has([data-state=checked])]:border-primary"
                >
                  <RadioGroupItem value="cod" id="codPayment" />
                  <Truck className="h-6 w-6 text-primary" />
                  <div>
                    <span className="block text-sm font-medium">Pay on Delivery</span>
                    <span className="block text-xs text-muted-foreground">Pay with cash when your order arrives.</span>
                  </div>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Cart Summary */}
        <div className="md:col-span-1">
          <Card className="shadow-lg sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" /> Your Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Image src={item.imageUrl} alt={item.name} width={60} height={60} className="rounded-md object-cover" data-ai-hint={`${item.category} item`} />
                    <div>
                      <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{getCurrencySymbol(item.currency)}{item.price.toFixed(2)} each</p>
                      <div className="flex items-center gap-2 mt-2">
                         <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                         </Button>
                         <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                         <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                         </Button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end h-full">
                    <p className="text-sm font-semibold">{getCurrencySymbol(item.currency)}{(item.price * item.quantity).toFixed(2)}</p>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive mt-auto" onClick={() => removeFromCart(item.id)} title="Remove item">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm">
                <p className="text-muted-foreground">Subtotal</p>
                <p className="font-medium">{mainCurrencySymbol}{subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-muted-foreground">Shipping</p>
                <p className="font-medium">{mainCurrencySymbol}{shippingFee.toFixed(2)}</p>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <p>Total</p>
                <p>{mainCurrencySymbol}{total.toFixed(2)}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="lg" className="w-full shadow-md" type="submit" form="shipping-form" disabled={isProcessing || form.formState.isSubmitting}>
                <Package className="mr-2 h-5 w-5" /> {isProcessing ? 'Processing...' : 'Place Order'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
