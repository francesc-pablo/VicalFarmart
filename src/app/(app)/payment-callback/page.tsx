"use client";

import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";

/**
 * Landing destination for payment redirects.
 * Extremely lightweight to ensure the native App listener intercepts it quickly.
 */
export default function PaymentCallbackPage() {
  
  useEffect(() => {
    // If the native listener fails to close the browser (e.g. desktop testing),
    // provide a manual escape or a redirect after a timeout.
    const timer = setTimeout(() => {
      window.location.href = '/my-orders';
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-sm shadow-xl border-primary/20">
        <CardContent className="pt-12 pb-12 flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-primary opacity-20" />
            </div>
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-headline">Payment Received</h1>
            <p className="text-muted-foreground">
              Finalizing your order record...
            </p>
            <p className="text-xs font-semibold text-primary animate-pulse uppercase tracking-wider">
              Returning to App
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
