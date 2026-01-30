
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
import { QrCode, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Html5Qrcode, Html5QrcodeError, Html5QrcodeResult } from 'html5-qrcode';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';

// This component is for the web-based scanner, including camera and file upload.
const WebScanner = ({ onScanSuccess, onError }: { onScanSuccess: (result: string) => void; onError: (message: string) => void }) => {
  const scannerRegionId = "web-qr-reader";
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect for camera scanning
  useEffect(() => {
    // Initialize scanner only once
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(scannerRegionId, false);
    }
    const html5QrCode = scannerRef.current;
    
    if (html5QrCode && !html5QrCode.isScanning) {
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        (decodedText: string, result: Html5QrcodeResult) => {
          onScanSuccess(decodedText);
        },
        (errorMessage: string, error: Html5QrcodeError) => {
          // ignore scan errors
        }
      ).catch(err => {
        console.error("Web Scanner Start Error:", err);
        onError("Could not start camera. Please check permissions.");
      });
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        // The library can throw an error if it's already stopping.
        // We'll wrap this in a try-catch to suppress the crash.
        try {
            html5QrCode.stop().catch(err => {
                // This catches promise rejections, which might also happen
                console.warn("Web Scanner Stop Promise Rejection:", err);
            });
        } catch (err) {
            // This catches synchronous errors, like the string being thrown
            console.warn("Web Scanner Stop Sync Error:", err);
        }
      }
    };
  }, [onScanSuccess, onError]);

  // Handler for file scanning
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!scannerRef.current) return;
      try {
        const result = await scannerRef.current.scanFile(file, false);
        onScanSuccess(result);
      } catch (err) {
        console.error("File scan error:", err);
        onError("Could not scan the QR code from the selected file. It might not be a valid QR code image.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Container for the camera feed */}
      <div id={scannerRegionId} className="w-full rounded-md bg-muted min-h-[250px]" />
      
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="relative flex items-center w-full my-1">
        <div className="flex-grow border-t border-muted"></div>
        <span className="flex-shrink mx-4 text-xs text-muted-foreground">OR</span>
        <div className="flex-grow border-t border-muted"></div>
      </div>
      
      {/* Button to trigger file input */}
      <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
        <Upload className="mr-2 h-4 w-4" />
        Scan from File
      </Button>
    </div>
  );
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
  
  const onWebScanError = (message: string) => {
      toast({
          title: "Scan Failed",
          description: message,
          variant: "destructive"
      });
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
              <DialogDescription>Position the QR code inside the box or upload an image file.</DialogDescription>
            </DialogHeader>
            <div className="p-0 sm:p-4 flex flex-col items-center justify-center min-h-[300px]">
              {isDialogOpen && <WebScanner onScanSuccess={onWebScanSuccess} onError={onWebScanError} />}
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
