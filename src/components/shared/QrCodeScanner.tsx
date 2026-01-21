
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
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

// This ID is used for the web-based scanner's container
const SCANNER_REGION_ID = "qr-code-reader";

export function QrCodeScannerDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null); // For the web scanner instance
  const router = useRouter();
  const { toast } = useToast();
  const isNative = Capacitor.isNativePlatform();

  // --- Core Logic Functions ---

  const handleScanSuccess = useCallback((result: string) => {
    // Regular expression to find a product ID in a URL or as a standalone string
    const urlPattern = /^(https?:\/\/[^\s$.?#].[^\s]*\/market\/|vicalfarmart:\/\/product\/)([a-zA-Z0-9_-]+)$/;
    const match = result.match(urlPattern);
    // If it matches a URL, grab the last part. Otherwise, assume the whole string is the ID.
    const productId = match ? match[2] : result.split('/').pop();

    if (productId && productId.length > 3) { // Basic validation
      toast({
        title: "QR Code Scanned",
        description: `Product found. Redirecting...`
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


  // --- Native Scanner Logic (Capacitor) ---

  const stopNativeScan = useCallback(async () => {
    // This function must be called to restore the UI
    const { BarcodeScanner } = await import('@capacitor-community/barcode-scanner');
    document.body.classList.remove('qr-scanner-active');
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    setIsScanning(false);
  }, []);

  const startNativeScan = useCallback(async () => {
    const { BarcodeScanner } = await import('@capacitor-community/barcode-scanner');
    try {
      // Check permission and force a request if needed
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (!status.granted) {
        toast({ title: "Permission Denied", description: "Camera access is required for scanning.", variant: "destructive" });
        return;
      }
      
      // Make the webview transparent and show the camera
      BarcodeScanner.hideBackground();
      document.body.classList.add('qr-scanner-active');
      setIsScanning(true);

      // Start scanning and wait for a result
      const result = await BarcodeScanner.startScan();
      
      // Stop the scanner immediately after getting a result
      await stopNativeScan();

      // Process the result after the UI is restored
      if (result.hasContent) {
        handleScanSuccess(result.content);
      }
    } catch (e: any) {
      // If the user cancels, the error message will contain "cancelled"
      if (e.message && !e.message.toLowerCase().includes("cancelled")) {
        console.error("Native Scan Error:", e);
        toast({ title: "Scan Error", description: "An unexpected error occurred during the scan.", variant: "destructive" });
      }
      // Always ensure the scanner is stopped on any error
      await stopNativeScan();
    }
  }, [handleScanSuccess, stopNativeScan, toast]);
  

  // --- Web Scanner Logic (html5-qrcode) ---

  const startWebScan = useCallback(async () => {
    setError(null);
    try {
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      // Ensure the container element exists
      if (!document.getElementById(SCANNER_REGION_ID)) return;
      
      const onScanSuccess = (decodedText: string) => {
        // We don't need to manually stop, just handle success and close dialog
        handleScanSuccess(decodedText);
        setIsDialogOpen(false); // This will trigger the onOpenChange and cleanup
      };

      const onScanFailure = (errorMessage: string) => {
        // Ignore common "QR code not found" errors to avoid spamming the user
      };
      
      // Create a new scanner instance
      const html5Scanner = new Html5QrcodeScanner(
        SCANNER_REGION_ID,
        {
          qrbox: { width: 250, height: 250 },
          fps: 10,
          rememberLastUsedCamera: true,
          supportedScanTypes: [0, 1] // 0 for Camera, 1 for File
        },
        false // Verbose logging
      );

      scannerRef.current = html5Scanner;
      html5Scanner.render(onScanSuccess, onScanFailure);

    } catch (e) {
      console.error("Web scanner initialization failed:", e);
      setError("Failed to initialize scanner. Please ensure camera permissions are enabled for this site.");
    }
  }, [handleScanSuccess]);
  
  const stopWebScan = useCallback(() => {
    if (scannerRef.current) {
      // Use clear() which stops the scan and removes the UI
      scannerRef.current.clear().catch((error: any) => {
        console.error("Failed to clear html5-qrcode scanner.", error);
      });
      scannerRef.current = null;
    }
  }, []);

  // --- Event Handlers ---

  const handleTriggerClick = () => {
    if (isNative) {
      startNativeScan();
    } else {
      setIsDialogOpen(true);
    }
  };

  useEffect(() => {
    // This effect starts the web scan only when the dialog opens
    if (isDialogOpen && !isNative) {
      startWebScan();
    }
    // Cleanup function for when the component unmounts or dialog closes
    return () => {
      if (!isNative) {
        stopWebScan();
      }
    };
  }, [isDialogOpen, isNative, startWebScan, stopWebScan]);


  // --- Render Logic ---

  // For native, render a cancel button overlay while scanning
  if (isScanning && isNative) {
    return (
      <div data-qr-scanner-ui className="fixed top-0 left-0 w-full h-full z-[100] bg-transparent flex flex-col justify-end items-center p-8">
        <Button onClick={stopNativeScan} variant="destructive" size="lg">
          <X className="mr-2 h-4 w-4" /> Cancel Scan
        </Button>
      </div>
    );
  }

  // Render the trigger button. The rest is handled by the Dialog or native overlay.
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Scan QR Code" onClick={handleTriggerClick}>
          <QrCode className="h-5 w-5" />
          <span className="sr-only">Scan Product QR Code</span>
        </Button>
      </DialogTrigger>
      {!isNative && (
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
             <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
