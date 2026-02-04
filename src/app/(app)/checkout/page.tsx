
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
import { sendEmail } from '@/services/emailService';
import { handleNativePayment } from '@/services/nativePaymentService';
import { auth } from '@/lib/firebase';
import type { Order, User, OrderItem, PaymentMethod as PaymentMethodType } from '@/types';
import { onAuthStateChanged } from 'firebase/auth';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { v4 as uuidv4 } from 'uuid';
import { Capacitor } from '@capacitor/core';


const getCurrencyForFlutterwave = (currencyCode?: string) => {
    const supportedCurrencies = ["GHS", "USD", "NGN", "XOF", "SLL", "LRD", "GMD", "GNF", "CVE", "EUR", "GBP"];
    if (currencyCode && supportedCurrencies.includes(currencyCode)) {
        return currencyCode;
    }
    return "GHS"; // Default to GHS if not supported or undefined
};

const getCurrencySymbol = (currencyCode?: string) => {
  const code = currencyCode || "GHS";
  if (code === "GHS") return "₵";
  if (code === "USD") return "$";
  return "$"; // Default symbol
};

const checkoutSchemaBase = z.object({
  fullName: z.string().min(2, { message: "Full name is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  address: z.string().min(5, { message: "Delivery address is required." }),
  city: z.string().min(2, { message: "City or town is required." }),
  zipCode: z.string().min(3, { message: "ZIP code is required." }),
  phone: z.string().min(10, { message: "A valid phone number is required." }),
  idCardNumber: z.string().optional(),
  paymentMethod: z.enum(["online", "cod"]),
});

const checkoutSchema = checkoutSchemaBase.refine(
  (data) => {
    if (data.paymentMethod === 'cod') {
      return data.idCardNumber && data.idCardNumber.length >= 5;
    }
    return true;
  },
  {
    message: "ID card number is required for Pay on Delivery.",
    path: ["idCardNumber"],
  }
);


type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// Helper function to generate HTML for the Pay on Delivery invoice
const generatePayOnDeliveryInvoiceHtml = (
    order: {
        id: string,
        customerName: string,
        items: OrderItem[],
        totalAmount: number,
        currency: string,
        shippingAddress: { address: string, city: string, zipCode: string }
    }
): string => {
    const currencySymbol = getCurrencySymbol(order.currency);
    const itemsHtml = order.items.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0;">${item.productName} (x${item.quantity})</td>
            <td style="padding: 10px 0; text-align: right;">${currencySymbol}${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h1 style="color: #8FBC8F;">Vical Farmart Order Invoice</h1>
            <p>Hi ${order.customerName},</p>
            <p>Thank you for placing your order with Vical Farmart! This is an invoice for your 'Pay on Delivery' order. Please have the total amount ready in cash upon delivery.</p>
            
            <h2 style="border-bottom: 2px solid #8FBC8F; padding-bottom: 5px;">Order #${order.id.substring(0, 6)}</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr>
                        <th style="text-align: left; padding: 10px 0; border-bottom: 2px solid #ddd;">Item</th>
                        <th style="text-align: right; padding: 10px 0; border-bottom: 2px solid #ddd;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td style="padding: 10px 0; font-weight: bold;">Total to Pay:</td>
                        <td style="padding: 10px 0; text-align: right; font-weight: bold; font-size: 1.2em;">${currencySymbol}${order.totalAmount.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>

            <h3 style="color: #A0522D;">Shipping Address</h3>
            <p>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.zipCode}
            </p>

            <p>You will receive another notification once your order has been shipped. If you have any questions, please contact our support.</p>
            <p>Thanks,<br>The Vical Farmart Team</p>
        </div>
    `;
};


export default function CheckoutPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const { cartItems, updateCartItemQuantity, removeFromCart, clearCart } = useCart();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

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
      paymentMethod: "online",
    },
  });

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
            city: userProfile.town || "",
            zipCode: "",
            idCardNumber: "",
            paymentMethod: "online",
          });
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, [form]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = 0; // Shipping cost disabled
  const total = subtotal + shippingFee;
  const mainCurrency = useMemo(() => getCurrencyForFlutterwave(cartItems[0]?.currency), [cartItems]);
  const mainCurrencySymbol = getCurrencySymbol(mainCurrency);


  const watchedPaymentMethod = form.watch("paymentMethod");

  useEffect(() => {
    setPaymentMethod(watchedPaymentMethod);
    if(watchedPaymentMethod === 'online') {
        form.clearErrors('idCardNumber');
    }
  }, [watchedPaymentMethod, form]);


  const handleCreateOrderInDB = async (
    data: CheckoutFormValues, 
    status: Order['status'], 
    paymentMethodType: PaymentMethodType,
    paymentDetails?: Order['paymentDetails']
  ) => {
    if (!currentUser || cartItems.length === 0) return null;

    setIsProcessing(true);
    const orderItems: OrderItem[] = cartItems.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.imageUrl || "",
        sellerName: item.sellerName || "N/A",
        sellerId: item.sellerId,
    }));
    
    // Determine if it's a single seller order
    const sellerIds = new Set(orderItems.map(item => item.sellerId));
    const isSingleSeller = sellerIds.size === 1;
    const singleSellerId = isSingleSeller ? sellerIds.values().next().value : undefined;
    const seller = singleSellerId ? await getUserById(singleSellerId) : null;

    const orderData: Omit<Order, 'id' | 'orderDate'> = {
        customerId: currentUser.id,
        customerName: data.fullName,
        customerEmail: data.email,
        customerPhone: data.phone,
        items: orderItems,
        totalAmount: total,
        currency: mainCurrency,
        status: status,
        paymentMethod: paymentMethodType,
        shippingAddress: {
            address: data.address,
            city: data.city,
            zipCode: data.zipCode,
            idCardNumber: data.idCardNumber,
        },
        // Only set sellerId if it's a single seller order
        ...(isSingleSeller && { sellerId: singleSellerId }),
        sellerName: seller?.name || (isSingleSeller ? cartItems[0]?.sellerName : "Multiple Sellers"),
        ...(paymentDetails && { paymentDetails }),
    };

    const newOrderId = await createOrder(orderData);
    
    if (newOrderId) {
        toast({
            title: "Order Placed Successfully!",
            description: `Your order #${newOrderId.substring(0, 6)} will be processed.`,
        });

        try {
            // Send receipt to customer if paid online
            if (paymentMethodType === 'Online Payment') {
              await sendOrderConfirmationEmail({
                customerEmail: data.email,
                customerName: data.fullName,
                orderId: newOrderId,
                totalAmount: total,
                paymentMethod: 'Online Payment',
                transactionId: String(paymentDetails?.transactionId || 'N/A'),
                items: orderItems,
                shippingAddress: {
                  address: data.address,
                  city: data.city,
                  zipCode: data.zipCode,
                },
              });
            } else if (paymentMethodType === 'Pay on Delivery') {
                 // Generate and send invoice email directly using Nodemailer service
                const invoiceHtml = generatePayOnDeliveryInvoiceHtml({
                    id: newOrderId,
                    customerName: data.fullName,
                    items: orderItems,
                    totalAmount: total,
                    currency: mainCurrency,
                    shippingAddress: {
                        address: data.address,
                        city: data.city,
                        zipCode: data.zipCode,
                    },
                });

                await sendEmail({
                    to: data.email,
                    subject: `Your Vical Farmart Order Invoice (#${newOrderId.substring(0, 6)})`,
                    htmlBody: invoiceHtml,
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

            // Send notification to each unique seller
            for (const sellerId of sellerIds) {
                 const currentSeller = await getUserById(sellerId);
                 if (currentSeller?.email) {
                    await sendNewOrderEmail({
                        recipientEmail: currentSeller.email,
                        recipientName: currentSeller.name,
                        recipientRole: 'seller',
                        orderId: newOrderId,
                        customerName: data.fullName,
                        totalAmount: total,
                        items: orderItems.filter(item => item.sellerId === sellerId),
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
        email: form.getValues('email'),
        phone_number: form.getValues('phone'),
        name: form.getValues('fullName'),
      },
      customizations: {
        title: 'Vical Farmart',
        description: 'Payment for items in cart',
        logo: 'https://res.cloudinary.com/ddvlexmvj/image/upload/v1751434079/VF_logo-removebg-preview_kgzusq.png',
      },
  };
  
  const handleFlutterwavePayment = useFlutterwave(flutterwaveConfig);

  async function handleFormSubmit(data: CheckoutFormValues) {
    if (!currentUser) {
        toast({ title: "Please log in", description: "You must be logged in to place an order.", variant: "destructive" });
        router.push('/login');
        return;
    }
    if (cartItems.length === 0) {
        toast({ title: "Empty Cart", description: "Cannot place an order with an empty cart.", variant: "destructive" });
        return;
    }
    
    if (data.paymentMethod === 'cod') {
        setIsProcessing(true);
        await handleCreateOrderInDB(data, 'Pending', 'Pay on Delivery');
    } else {
        setIsProcessing(true); // Set processing early for online payment
        
        if (isNative) {
            const paymentDetails = {
                amount: total,
                currency: mainCurrency,
                tx_ref: `vicalfarmart-${uuidv4()}`,
                customer: {
                    email: data.email,
                    phone_number: data.phone,
                    name: data.fullName,
                },
                customizations: {
                    title: 'Vical Farmart',
                    description: 'Payment for items in cart',
                    logo: 'https://res.cloudinary.com/ddvlexmvj/image/upload/v1751434079/VF_logo-removebg-preview_kgzusq.png',
                },
            };

            try {
              const response = await handleNativePayment(paymentDetails);

              if (response.status === 'successful') {
                  await handleCreateOrderInDB(data, 'Paid', 'Online Payment', {
                      transactionId: response.transaction_id,
                      status: 'successful',
                      gateway: 'Flutterwave (Native)',
                  });
              } else {
                  toast({
                      title: response.status === 'cancelled' ? "Payment Canceled" : "Payment Not Completed",
                      description: response.status === 'cancelled' ? "You closed the payment window." : "Your payment was not completed. Please try again.",
                      variant: response.status === 'cancelled' ? 'default' : 'destructive',
                  });
                  setIsProcessing(false);
              }
            } catch (error: any) {
                toast({
                    title: "Payment Error",
                    description: error.message || "Could not connect to the payment provider.",
                    variant: "destructive",
                });
                setIsProcessing(false);
            }
        } else {
            handleFlutterwavePayment({
                callback: async (response) => {
                    closePaymentModal(); // Close the modal immediately
                    if (response.status === 'successful') {
                        await handleCreateOrderInDB(data, 'Paid', 'Online Payment', {
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
                },
                onClose: () => {
                    if (form.formState.isSubmitting) return;

                    toast({
                        title: "Payment Canceled",
                        description: "You closed the payment window.",
                    });
                    setIsProcessing(false);
                },
            });
        }
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} id="shipping-form" className="space-y-8">
                <Card className="shadow-lg">
                    <CardHeader>
                    <CardTitle className="text-xl">Shipping Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                                <FormLabel>Delivery Address</FormLabel>
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
                                <FormLabel>City or Town</FormLabel>
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
                                    <Input 
                                        placeholder="GHA-123456789-0 / P01234567" 
                                        {...field}
                                        value={field.value ?? ''}
                                        disabled={paymentMethod !== 'cod'}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                    </CardContent>
                </Card>

                <Card className="shadow-lg">
                    <CardHeader>
                    <CardTitle className="text-xl">Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                        <FormItem>
                            <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="space-y-3"
                            >
                                <FormItem>
                                <FormControl>
                                    <Label
                                    htmlFor="onlinePayment"
                                    className="flex items-center space-x-3 rounded-md border p-4 hover:bg-accent/50 [&:has([data-state=checked])]:border-primary"
                                    >
                                    <RadioGroupItem value="online" id="onlinePayment" />
                                    <CreditCard className="h-6 w-6 text-primary" />
                                    <div>
                                        <span className="block text-sm font-medium">Online Payment</span>
                                        <span className="block text-xs text-muted-foreground">Pay securely with Card, Mobile Money, etc. via Flutterwave.</span>
                                    </div>
                                    </Label>
                                </FormControl>
                                </FormItem>

                                <FormItem>
                                <FormControl>
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
                                </FormControl>
                                </FormItem>
                            </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </CardContent>
                </Card>
              </form>
            </Form>
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
                    <Image src={item.imageUrl ? item.imageUrl : "https://placehold.co/60x60.png"} alt={item.name} width={60} height={60} className="rounded-md object-cover" data-ai-hint={`${item.category} item`} />
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
              <p className="text-xs text-center text-muted-foreground mt-2">
                Free delivery for orders not less than ₵500.00
              </p>
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
