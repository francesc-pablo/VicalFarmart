"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";

/**
 * This page serves as the landing destination for payment redirects.
 * Its primary purpose is to provide a valid URL for the payment gateway 
 * to redirect to, preventing 404 errors in the in-app browser.
 * The native app's listener detects this URL and handles closing the window.
 */
export default function PaymentCallbackPage() {
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
              Returning to Dashboard...
            </p>
          </div>
          <p className="text-xs text-muted-foreground italic">
            This window will close automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
