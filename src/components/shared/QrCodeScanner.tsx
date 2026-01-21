
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { QrCode, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const SCANNER_REGION_ID = "qr-code-reader";

export function QrCodeScannerDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  const scannerRef = useRef<any | null>(null);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  const handleScanSuccess = useCallback((result: string) => {
    const urlPattern = /^(https?:\/\/[^\s$.?#].[^\s]*\/market\/|vicalfarmart:\/\/product\/)([a-zA-Z0-9_-]+)$/;
    const match = result.match(urlPattern);
    const productId = match ? match[2] : result.split('/').pop();

    if (productId) {
      toast({
        title: "QR Code Scanned",
        description: `Product ID: ${productId}. Redirecting...`
      });
      router.push(`/market/${productId}`);
    } else {
      toast({
        title: "Invalid QR Code",
        description: "This QR code does not seem to be a valid Vical Farmart product link.",
        variant: "destructive"
      });
    }
  }, [router, toast]);
  
  const stopScan = useCallback(async () => {
    if (isNative) {
      document.body.classList.remove('qr-scanner-active');
      const { BarcodeScanner } = await import('@capacitor-community/barcode-scanner');
      try {
        // This method handles stopping the scan and making the webview opaque.
        await BarcodeScanner.stopScan();
      } catch(e) {
        // This can happen if the scan is already stopped, so we can safely ignore it.
      }
    } else {
      if (scannerRef.current && scannerRef.current.getState() === 2) { // 2 = SCANNING
        await scannerRef.current.stop().catch(() => {});
      }
    }
    setIsScanning(false);
    setIsOpen(false);
  }, [isNative]);

  const startNativeScan = useCallback(async () => {
    const { BarcodeScanner } = await import('@capacitor-community/barcode-scanner');
    try {
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (!status.granted) {
        toast({ title: "Permission Denied", description: "Camera access is required for scanning.", variant: "destructive" });
        return;
      }

      await BarcodeScanner.hideBackground();
      document.body.classList.add('qr-scanner-active');
      setIsScanning(true);

      const result = await BarcodeScanner.startScan();

      // IMPORTANT: stopScan MUST be called to restore the UI
      await stopScan();

      if (result.hasContent) {
        handleScanSuccess(result.content);
      }
    } catch (e: any) {
      // This block will be entered if the user cancels the scan.
      await stopScan();
      if (e.message && !e.message.toLowerCase().includes("cancelled")) {
        console.error("Native Scan Error:", e);
        toast({ title: "Scan Error", description: "An unexpected error occurred.", variant: "destructive" });
      }
    }
  }, [handleScanSuccess, stopScan, toast]);

  const startWebScan = useCallback(async () => {
      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        if (!document.getElementById(SCANNER_REGION_ID)) return;

        const onScanSuccess = (decodedText: string) => {
            stopScan();
            handleScanSuccess(decodedText);
        };
        const onScanError = (errorMessage: string) => { /* ignore minor errors */ };
        
        const scanner = new Html5QrcodeScanner(
            SCANNER_REGION_ID,
            {
                qrbox: { width: 250, height: 250 },
                fps: 10,
                rememberLastUsedCamera: true,
                supportedScanTypes: [0, 1] // 0 for Camera, 1 for File
            },
            false
        );
        scannerRef.current = scanner;
        scanner.render(onScanSuccess, onScanError);
        setIsScanning(true);
    } catch (e: any) {
        console.error("Web scanner init failed", e);
        setError("Could not initialize QR scanner. Please ensure camera permissions are granted.");
    }
  }, [handleScanSuccess, stopScan]);
  
  const handleTriggerClick = () => {
    setError(null);
    if (isNative) {
      startNativeScan();
    } else {
      setIsOpen(true);
      const timer = setTimeout(() => startWebScan(), 100); // Small delay for dialog animation
      return () => clearTimeout(timer);
    }
  };
  
  // This is the native UI overlay, rendered conditionally.
  if (isScanning && isNative) {
    return (
      <div data-qr-scanner-ui className="fixed top-0 left-0 w-full h-full z-[100] bg-transparent flex flex-col justify-end items-center p-8">
        <Button onClick={stopScan} variant="destructive" size="lg">
          <X className="mr-2 h-4 w-4" /> Cancel Scan
        </Button>
      </div>
    );
  }

  // This is the web/dialog UI
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        stopScan();
      }
      setIsOpen(open);
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Scan QR Code" onClick={handleTriggerClick}>
          <QrCode className="h-5 w-5" />
          <span className="sr-only">Scan Product QR Code</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Product QR Code</DialogTitle>
          <DialogDescription>
            Position the QR code inside the box, or select an image file.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 flex flex-col items-center justify-center min-h-[300px]">
          {error ? (
              <div className="text-center text-destructive">
                <p className="font-semibold">Scanner Error</p>
                <p className="text-sm">{error}</p>
              </div>
          ) : (
            <div id={SCANNER_REGION_ID} className="w-full rounded-md" />
          )}
        </div>
        <DialogFooter>
           <Button variant="secondary" onClick={stopScan}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
