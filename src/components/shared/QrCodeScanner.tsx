
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Html5Qrcode } from 'html5-qrcode';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';

// This component is only for the web-based scanner.
const WebScanner = ({ onScanSuccess }: { onScanSuccess: (result: string) => void }) => {
  const scannerRegionId = "web-qr-reader";
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Ensure the scanner only initializes once
    if (!scannerRef.current) {
        const scanner = new Html5Qrcode(scannerRegionId, false);
        scannerRef.current = scanner;
        
        scanner.start(
            { facingMode: "environment" },
            { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
            },
            (decodedText) => {
                // Pause scanner on success to prevent multiple calls
                if(scannerRef.current?.isScanning) {
                    scannerRef.current.pause(true);
                }
                onScanSuccess(decodedText);
            },
            (errorMessage) => {
                // handle scan error, usually ignore
            }
        ).catch(err => {
            console.error("Web Scanner Start Error:", err);
        });
    }

    // Cleanup function to stop the scanner
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => {
          console.error("Web Scanner Stop Error:", err);
        });
      }
    };
  }, [onScanSuccess]);

  return <div id={scannerRegionId} className="w-full rounded-md" />;
};


export function QrCodeScannerDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNativeScanning, setIsNativeScanning] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const isNative = Capacitor.isNativePlatform();

  const handleScanResult = useCallback((result: string) => {
    const urlPattern = /^(https?:\/\/[^\s$.?#].[^\s]*\/market\/|vicalfarmart:\/\/product\/)([a-zA-Z0-9_-]+)$/;
    const match = result.match(urlPattern);
    const productId = match ? match[2] : result.split('/').pop();

    if (productId && productId.length > 3) {
      toast({
        title: "QR Code Scanned",
        description: `Product found. Redirecting...`
      });
      router.push(`/market/${productId}`);
    } else {
      toast({
        title: "Invalid QR Code",
        description: "This QR code does not appear to be a valid Vical Farmart product link.",
        variant: "destructive"
      });
    }
  }, [router, toast]);
  
  const stopNativeScan = useCallback(async () => {
    if (!isNativeScanning) return;
    document.body.classList.remove('scanner-active');
    await BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    setIsNativeScanning(false);
  }, [isNativeScanning]);
  
  const startNativeScan = async () => {
      try {
          const status = await BarcodeScanner.checkPermission({ force: true });
          if (!status.granted) {
              toast({ title: "Permission Denied", description: "Camera access is required.", variant: "destructive" });
              return;
          }

          document.body.classList.add('scanner-active');
          await BarcodeScanner.hideBackground();
          setIsNativeScanning(true);

          const result = await BarcodeScanner.startScan({ targetedFormats: [SupportedFormat.QR_CODE] });

          if (result.hasContent) {
              await stopNativeScan();
              handleScanResult(result.content);
          }
      } catch (e: any) {
          console.error(e);
          await stopNativeScan();
          if (e.message !== 'Scan cancelled') {
            toast({ title: "Scan Error", description: "Could not start the scanner.", variant: "destructive"});
          }
      }
  };
  
  const handleScanClick = () => {
    if (isNative) {
      startNativeScan();
    } else {
      setIsDialogOpen(true);
    }
  };

  const onWebScanSuccess = (result: string) => {
    setIsDialogOpen(false);
    handleScanResult(result);
  };
  
  useEffect(() => {
    const handler = () => stopNativeScan();
    if (isNative) {
        document.addEventListener('ionBackButton', handler);
    }
    return () => {
        if (isNative) {
            document.removeEventListener('ionBackButton', handler);
        }
    };
  }, [isNative, stopNativeScan]);


  return (
    <>
      <Button variant="ghost" size="icon" title="Scan QR Code" onClick={handleScanClick}>
        <QrCode className="h-5 w-5" />
        <span className="sr-only">Scan Product QR Code</span>
      </Button>

      {isNativeScanning && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-transparent p-4">
          <div className="w-full max-w-sm text-center p-4 bg-black/60 rounded-md text-white shadow-lg">
            Point your camera at a QR code
          </div>
          <Button onClick={stopNativeScan} variant="destructive" className="shadow-lg">Cancel</Button>
        </div>
      )}

      {!isNative && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Scan Product QR Code</DialogTitle>
              <DialogDescription>Position the QR code inside the box.</DialogDescription>
            </DialogHeader>
            <div className="p-4 flex flex-col items-center justify-center min-h-[300px]">
              {isDialogOpen && <WebScanner onScanSuccess={onWebScanSuccess} />}
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
