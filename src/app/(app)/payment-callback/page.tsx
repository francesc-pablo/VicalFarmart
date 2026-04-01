"use client";

import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";

/**
 * This page serves as the landing destination for payment redirects.
 * Its primary purpose is to provide a valid URL for the payment gateway 
 * to redirect to, which is then intercepted by the native app listener.
 */
export default function PaymentCallbackPage() {
  
  // Script fallback: If for some reason the native listener fails to close the window,
  // we provide a manual escape or a redirect after a long timeout.
  useEffect(() => {
    const timer = setTimeout(() => {
      // In a web environment, we'd redirect home. 
      // In native, the browser should already be closed by the service listener.
      window.location.href = '/my-orders';
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/20">
        <CardContent className="pt-10 pb-10 flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-primary opacity-20" />
            </div>
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-headline">Payment Received</h1>
            <p className="text-muted-foreground">
              We are finalizing your order and returning you to the app. 
            </p>
            <p className="text-sm font-medium text-primary animate-pulse">
              Syncing with dashboard...
            </p>
          </div>
          <p className="text-xs text-muted-foreground italic">
            This window should close automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
