'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Html5QrcodeScanner } from 'html5-qrcode';
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
  const router = useRouter();
  const { toast } = useToast();
  
  const scannerRef = React.useRef<Html5QrcodeScanner | null>(null);

  const handleScanSuccess = useCallback((result: string) => {
    const productId = result.split('/').pop();
    if (productId) {
      toast({
        title: "QR Code Scanned",
        description: `Product ID: ${productId}. Redirecting...`
      });
      setIsOpen(false);
      router.push(`/market/${productId}`);
    } else {
      setError("Invalid QR code format.");
    }
  }, [router, toast]);
  
  const stopAllScans = useCallback(async () => {
    if (Capacitor.isNativePlatform() && isScanning) {
      try {
        // Dynamically import to avoid server-side bundling
        const { BarcodeScanner } = await import('@capacitor-community/barcode-scanner');
        document.body.classList.remove('qr-scanner-active');
        await BarcodeScanner.showBackground();
        await BarcodeScanner.stopScan();
      } catch (e) {
        console.error("Error stopping native scanner", e);
      }
    }
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.clear();
      } catch (err) {
        console.error("Failed to clear web scanner", err);
      }
    }
    setIsScanning(false);
  }, [isScanning]);

  const startNativeScan = useCallback(async () => {
    const start = async () => {
      try {
        // Dynamically import to avoid server-side bundling
        const { BarcodeScanner } = await import('@capacitor-community/barcode-scanner');
        await BarcodeScanner.checkPermission({ force: true });
        
        await BarcodeScanner.hideBackground();
        document.body.classList.add('qr-scanner-active');
        setIsScanning(true);

        const result = await BarcodeScanner.startScan();

        if (result.hasContent) {
          handleScanSuccess(result.content);
        }
      } catch (e: any) {
        if (e.message.includes("permission was denied")) {
          setError("Camera permission is required. Please grant permission in your device settings.");
        } else if (!e.message.includes("cancelled")) {
          setError(e.message || "An unknown error occurred during scanning.");
        }
      } finally {
          await stopAllScans();
          setIsOpen(false);
      }
    };
    start();
  }, [handleScanSuccess, stopAllScans]);

  const startWebScan = useCallback(() => {
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
  
  if (isScanning && Capacitor.isNativePlatform()) {
    return (
      <div className="fixed top-0 left-0 w-full h-full z-[100] bg-transparent flex flex-col justify-end items-center p-8">
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
        <Button variant="ghost" size="icon" title="Scan QR Code" onClick={() => {
          setError(null);
          if (Capacitor.isNativePlatform()) {
            startNativeScan();
          } else {
            setIsOpen(true);
            const timer = setTimeout(() => startWebScan(), 100);
            return () => clearTimeout(timer);
          }
        }}>
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