
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, DollarSign, Package, ShoppingCart, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

// Mock cart items
const mockCartItems = [
  { id: "1", name: "Organic Fuji Apples", price: 3.99, quantity: 2, imageUrl: "https://placehold.co/100x100.png", category: "Fruits" },
  { id: "2", name: "Vine-Ripened Tomatoes", price: 2.50, quantity: 3, imageUrl: "https://placehold.co/100x100.png", category: "Vegetables" },
];

export default function CheckoutPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"mobile" | "cod">("mobile");

  const subtotal = mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = 5.00; // Mock shipping
  const total = subtotal + shippingFee;

  const handlePlaceOrder = () => {
    // Simulate order placement
    toast({
      title: "Order Placed Successfully!",
      description: `Your order will be processed. Payment method: ${paymentMethod === 'mobile' ? 'Mobile Payment' : 'Pay on Delivery'}.`,
    });
    router.push("/"); // Redirect to homepage or order confirmation page
  };

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
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" placeholder="John Doe" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="123 Main St" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Anytown" />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input id="zipCode" placeholder="12345" />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="(555) 123-4567" />
              </div>
              <div>
                <Label htmlFor="idCardNumber">ID Card Number (GH Card/Passport)</Label>
                <Input id="idCardNumber" placeholder="GHA-123456789-0 / P01234567" />
              </div>
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
                <ShoppingCart className="h-6 w-6" /> Your Cart
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockCartItems.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image src={item.imageUrl} alt={item.name} width={50} height={50} className="rounded-md object-cover" data-ai-hint={`${item.category} item`} />
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
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
              <Button size="lg" className="w-full shadow-md" onClick={handlePlaceOrder}>
                <Package className="mr-2 h-5 w-5" /> Place Order
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
