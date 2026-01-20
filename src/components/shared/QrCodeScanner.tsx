
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { QrCode, RefreshCw, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const SCANNER_REGION_ID = "qr-code-reader";

export function QrCodeScannerDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNativeScanning, setIsNativeScanning] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const stopNativeScan = useCallback(() => {
    document.body.classList.remove('qr-scanner-active');
    document.querySelector('main')?.classList.remove('hidden');
    BarcodeScanner.stopScan();
    setIsNativeScanning(false);
  }, []);

  const handleScanResult = useCallback((result: string) => {
    setScannedResult(result);
    // Assuming the QR code is a URL to the product page
    // or just the product ID.
    const productId = result.split('/').pop();
    if (productId) {
      toast({
        title: "QR Code Scanned",
        description: `Product ID: ${productId}. Redirecting...`
      });
      router.push(`/market/${productId}`);
      setIsOpen(false);
    } else {
      setError("Invalid QR code format.");
    }
  }, [router, toast]);


  const startNativeScanner = useCallback(async () => {
    try {
        const status = await BarcodeScanner.checkPermission({ force: true });
        if (!status.granted) {
            setError("Camera permission is required to scan QR codes.");
            return;
        }

        setIsNativeScanning(true);
        document.body.classList.add('qr-scanner-active');
        document.querySelector('main')?.classList.add('hidden'); // Hide main content

        const result = await BarcodeScanner.startScan();

        stopNativeScan();

        if (result.hasContent) {
            handleScanResult(result.content);
        }
    } catch (e: any) {
        setError(e.message || "An unknown error occurred during scanning.");
        stopNativeScan();
    }
  }, [handleScanResult, stopNativeScan]);


  const startWebScanner = useCallback(() => {
    try {
        if (!document.getElementById(SCANNER_REGION_ID)) return;

        const scanner = new Html5QrcodeScanner(
            SCANNER_REGION_ID,
            {
                qrbox: { width: 250, height: 250 },
                fps: 10,
            },
            false // verbose
        );

        const onScanSuccess = (decodedText: string) => {
            scanner.clear().catch(error => console.error("Failed to clear web scanner.", error));
            handleScanResult(decodedText);
        };

        const onScanError = (errorMessage: string) => { /* ignore */ };

        scanner.render(onScanSuccess, onScanError);
        
        return () => {
          if (scanner.getState() !== 2 /* NOT_SCANNING */) {
            scanner.clear().catch(err => console.log("Cleanup failed", err));
          }
        }
    } catch (e) {
        console.error("Web scanner init failed", e);
        setError("Could not initialize QR scanner.");
    }
  }, [handleScanResult]);

  useEffect(() => {
    if (!isOpen) {
      if (isNativeScanning) stopNativeScan();
      return;
    }
    
    // Reset state when opening
    setScannedResult(null);
    setError(null);
    
    if (Capacitor.isNativePlatform()) {
      startNativeScanner();
    } else {
      // For web, the scanner is rendered inside the dialog, so we wait for the dialog to be fully open
      const timeoutId = setTimeout(() => startWebScanner(), 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, startNativeScanner, startWebScanner, isNativeScanning, stopNativeScan]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };
  
  if (isNativeScanning) {
     return (
       <div className="fixed top-0 left-0 w-full h-full z-[100] bg-transparent flex flex-col justify-end items-center p-8">
         <Button onClick={stopNativeScan} variant="destructive" size="lg">
           <X className="mr-2 h-4 w-4" /> Cancel Scan
         </Button>
       </div>
     );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Scan QR Code">
          <QrCode className="h-5 w-5" />
          <span className="sr-only">Scan Product QR Code</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Product QR Code</DialogTitle>
        </DialogHeader>
        <div className="p-4 flex flex-col items-center justify-center min-h-[300px]">
          {error ? (
              <div className="text-center text-destructive">
                <p className="font-semibold">Scan Error</p>
                <p className="text-sm">{error}</p>
              </div>
          ) : (
            <div id={SCANNER_REGION_ID} className="w-full rounded-md" />
          )}
        </div>
        <DialogFooter>
           <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
