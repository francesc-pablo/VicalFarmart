"use client";
import React from 'react';

export default function DeprecatedSellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 bg-background text-foreground">
      <div className="max-w-xl text-center p-8 border rounded-lg shadow-xl bg-card">
        <h1 className="text-3xl font-bold font-headline text-destructive mb-4">Seller Dashboard Removed</h1>
        <p className="text-muted-foreground mb-2">
          The seller-specific dashboard has been removed. Sellers are now managed by Administrators.
        </p>
        <p className="text-sm text-muted-foreground">
          If you are an administrator, please use the Admin Dashboard to manage users, including sellers.
        </p>
        {/* 
          The children are rendered here in case any sub-route was accidentally hit,
          though ideally all routes under /seller/dashboard/* should also be removed.
        */}
        <div className="mt-6 p-4 border-t border-dashed">
            {children}
        </div>
      </div>
    </div>
  );
}
