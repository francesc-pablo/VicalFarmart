"use client";

import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";

/**
 * Landing destination for payment redirects.
 * Triggers a deep link to return to the native app with transaction results.
 */
export default function PaymentCallbackPage() {
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status') || params.get('resp');
    const transaction_id = params.get('transaction_id') || params.get('transactionId');
    const tx_ref = params.get('tx_ref');

    // Trigger deep link back to the app
    // The native app listener handles Browser.close() and final verification
    const deepLinkUrl = `vicalfarmart://payment-result?status=${status}&transaction_id=${transaction_id}&tx_ref=${tx_ref}`;
    
    // Fallback redirect if deep link isn't intercepted immediately
    const timer = setTimeout(() => {
      window.location.href = deepLinkUrl;
    }, 500);

    // Final fallback for desktop testing
    const desktopTimer = setTimeout(() => {
      window.location.href = '/my-orders';
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(desktopTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <Card className="w-full max-w-sm shadow-xl border-primary/20 bg-card">
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
              Returning you to the app...
            </p>
            <p className="text-xs font-semibold text-primary animate-pulse uppercase tracking-wider">
              Finishing Order
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}