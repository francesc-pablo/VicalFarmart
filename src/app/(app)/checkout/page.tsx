
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
import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useForm } from "react-hook-form";
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

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 0 ? 5.00 : 0; // No shipping fee for empty cart
  const total = subtotal + shippingFee;

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

  function handlePlaceOrder(data: CheckoutFormValues) {
    console.log("Order placed with data:", data);
    // Simulate order placement
    toast({
      title: "Order Placed Successfully!",
      description: `Your order will be processed. Payment method: ${paymentMethod === 'mobile' ? 'Mobile Payment' : 'Pay on Delivery'}.`,
    });
    clearCart(); // Clear the cart
    router.push("/"); // Redirect to homepage or order confirmation page
  };
  
  if (cartItems.length === 0) {
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
                <form onSubmit={form.handleSubmit(handlePlaceOrder)} className="space-y-4" id="shipping-form">
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
                    <span className="block text-xs text-muted-foreground">Pay securely with your mobile wallet.</span>
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
                      <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
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
                    <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive mt-auto" onClick={() => removeFromCart(item.id)} title="Remove item">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm">
                <p className="text-muted-foreground">Subtotal</p>
                <p className="font-medium">${subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-muted-foreground">Shipping</p>
                <p className="font-medium">${shippingFee.toFixed(2)}</p>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <p>Total</p>
                <p>${total.toFixed(2)}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="lg" className="w-full shadow-md" type="submit" form="shipping-form">
                <Package className="mr-2 h-5 w-5" /> Place Order
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
