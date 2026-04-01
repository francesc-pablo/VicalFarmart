
"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

/**
 * This page serves as the landing destination for payment redirects.
 * Its primary purpose is to provide a valid URL for the payment gateway 
 * to redirect to, preventing 404 errors in the in-app browser.
 * The native app's listener detects this URL and handles the logic.
 */
export default function PaymentCallbackPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/20">
        <CardContent className="pt-10 pb-10 flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2 w-2 bg-primary rounded-full" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-headline">Finalizing Payment</h1>
            <p className="text-muted-foreground">
              We are confirming your transaction. This window will close automatically in a moment.
            </p>
          </div>
          <p className="text-xs text-muted-foreground italic">
            Please do not close this window manually.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
