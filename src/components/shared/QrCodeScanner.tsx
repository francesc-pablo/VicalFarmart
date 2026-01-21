'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
  
  const scannerRef = React.useRef<any | null>(null);

  useEffect(() => {
    // This check is deferred until after the component mounts, preventing hydration errors.
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
      setIsOpen(false);
      router.push(`/market/${productId}`);
    } else {
      toast({
        title: "Invalid QR Code",
        description: "This QR code does not seem to be a valid Vical Farmart product link.",
        variant: "destructive"
      });
      setError("Invalid QR code format.");
    }
  }, [router, toast]);
  
  const stopAllScans = useCallback(async () => {
    if (isNative && isScanning) {
      try {
        const { BarcodeScanner } = await import('@capacitor-community/barcode-scanner');
        document.body.classList.remove('qr-scanner-active');
        await BarcodeScanner.showBackground();
        await BarcodeScanner.stopScan();
      } catch (e) {
        console.warn("Could not stop native scanner (it may have already been stopped).", e);
      }
    }
    
    if (!isNative && scannerRef.current && scannerRef.current.getState() === 2) { // 2 is SCANNING state for Html5QrcodeScanner
      try {
        await scannerRef.current.clear();
      } catch (err) {
        console.error("Failed to clear web scanner", err);
      }
    }

    setIsScanning(false);
  }, [isScanning, isNative]);


 const startNativeScan = useCallback(async () => {
    try {
      const { BarcodeScanner } = await import('@capacitor-community/barcode-scanner');
      
      const initialStatus = await BarcodeScanner.checkPermission({ force: false });

      if (initialStatus.denied || initialStatus.restricted) {
          const didOpenSettings = await BarcodeScanner.openAppSettings();
          if(!didOpenSettings){
             toast({
                title: "Permission Required",
                description: "Please grant camera access in your device settings to use the QR scanner.",
                variant: "destructive",
            });
          }
          return;
      }
      
      const finalStatus = await BarcodeScanner.checkPermission({ force: true });
      if (!finalStatus.granted) {
          toast({
              title: "Permission Denied",
              description: "Camera access was not granted. The scanner cannot start.",
              variant: "destructive"
          });
          return;
      }

      await BarcodeScanner.hideBackground();
      document.body.classList.add('qr-scanner-active');
      setIsScanning(true);

      const result = await BarcodeScanner.startScan();

      if (result.hasContent) {
        handleScanSuccess(result.content);
      }
    } catch (e: any) {
      if (e.message && !e.message.toLowerCase().includes("cancelled")) {
        toast({
            title: "Scan Error",
            description: "An unexpected error occurred with the camera. Please try again.",
            variant: "destructive"
        });
        console.error("Native Scan Error:", e);
      }
    } finally {
        await stopAllScans();
        setIsOpen(false);
    }
  }, [handleScanSuccess, stopAllScans, toast]);

  const startWebScan = useCallback(async () => {
      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        if (!document.getElementById(SCANNER_REGION_ID)) return;

        const scanner = new Html5QrcodeScanner(
            SCANNER_REGION_ID,
            {
                qrbox: { width: 250, height: 250 },
                fps: 10,
            },
            false // verbose
        );
        scannerRef.current = scanner;

        const onScanSuccess = (decodedText: string) => {
            handleScanSuccess(decodedText);
        };

        const onScanError = (errorMessage: string) => { /* ignore minor scan errors */ };
        
        scanner.render(onScanSuccess, onScanError);
        setIsScanning(true);

    } catch (e: any) {
        console.error("Web scanner init failed", e);
        setError("Could not initialize QR scanner.");
    }
  }, [handleScanSuccess]);
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };
  
  useEffect(() => {
    if (!isOpen) {
      stopAllScans();
    }
  }, [isOpen, stopAllScans]);

  const handleTriggerClick = () => {
    setError(null);
    if (isNative) {
      startNativeScan();
    } else {
      setIsOpen(true);
      // Give the dialog time to mount before starting the web scanner
      const timer = setTimeout(() => startWebScan(), 100);
      return () => clearTimeout(timer);
    }
  };
  
  if (isScanning && isNative) {
    return (
      <div data-qr-scanner-ui className="fixed top-0 left-0 w-full h-full z-[100] bg-transparent flex flex-col justify-end items-center p-8">
        <Button onClick={() => {
          stopAllScans();
          setIsOpen(false);
        }} variant="destructive" size="lg">
          <X className="mr-2 h-4 w-4" /> Cancel Scan
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
            Position the QR code inside the box to scan it.
          </DialogDescription>
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
