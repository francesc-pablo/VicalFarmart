
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
import { QrCode, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Html5Qrcode, Html5QrcodeError, Html5QrcodeResult } from 'html5-qrcode';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';

// --- Native Scanner Component (Fullscreen Modal-like Overlay) ---
const NativeScanner = ({ onScanSuccess, onCancel }: { onScanSuccess: (result: string) => void; onCancel: () => void }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let didCancel = false;

    const startScan = async () => {
      try {
        // 1. Check permission, force grant dialog if not yet determined
        await BarcodeScanner.checkPermission({ force: true });
        
        // 2. Make WebView transparent
        await BarcodeScanner.hideBackground();
        document.body.classList.add('scanner-active');

        // 3. Start scanning for QR codes
        const result = await BarcodeScanner.startScan({ targetedFormats: [SupportedFormat.QR_CODE] });

        // 4. Handle result if we haven't cancelled
        if (result.hasContent && !didCancel) {
          onScanSuccess(result.content);
        }
      } catch (e: any) {
        console.error('Native Scanner Error:', e);
        if (!didCancel) {
          if (e.message.toLowerCase().includes('cancelled')) {
             // This can happen if the user presses the hardware back button
             onCancel();
          } else if (e.message.toLowerCase().includes('permission was denied')) {
             setError('Camera permission is required to scan QR codes. Please grant permission in your app settings.');
          } else {
             setError(e.message || 'An unknown error occurred during scanning.');
          }
        }
      }
    };

    startScan();

    // Cleanup function to be called on component unmount
    return () => {
      didCancel = true;
      document.body.classList.remove('scanner-active');
      BarcodeScanner.showBackground();
      BarcodeScanner.stopScan();
    };
    // onScanSuccess and onCancel are wrapped in useCallback, so they are stable.
  }, [onScanSuccess, onCancel]);

  // Display an error message if something went wrong (e.g., permissions)
  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-white p-8 text-center">
        <h3 className="text-xl font-bold mb-2 text-destructive">Scanning Error</h3>
        <p className="mb-4">{error}</p>
        <Button onClick={onCancel} variant="secondary">Close</Button>
      </div>
    );
  }

  // The actual UI for the native scanner overlay
  return (
    <div className="fixed inset-0 z-50 bg-transparent">
      {/* Cancel Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-white hover:text-white hover:bg-white/20 rounded-full h-10 w-10">
          <X className="h-6 w-6" />
          <span className="sr-only">Cancel Scan</span>
        </Button>
      </div>
      {/* Scanning Reticle and Guide Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4">
        <div className="relative w-2/3 max-w-[250px] aspect-square">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg shadow-lg"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg shadow-lg"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg shadow-lg"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg shadow-lg"></div>
        </div>
        <p className="mt-4 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-md shadow-lg">
          Scan Product QR Code
        </p>
      </div>
    </div>
  );
};

// --- Web Scanner Component (for Dialog) ---
const WebScanner = ({ onScanSuccess, onError }: { onScanSuccess: (result: string) => void; onError: (message: string) => void }) => {
  const scannerRegionId = "web-qr-reader";
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode(scannerRegionId, false);
    }
    const html5QrCode = html5QrCodeRef.current;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string, result: Html5QrcodeResult) => onScanSuccess(decodedText),
          (errorMessage: string, error: Html5QrcodeError) => { /* ignore verbose scan errors */ }
        );
      } catch (err: any) {
        const errorMessage = typeof err === 'string' ? err : err.message;
        if (errorMessage && !errorMessage.includes('already under transition')) {
          console.error("Web Scanner Start Error:", err);
          onError("Could not start camera. Please check permissions.");
        }
      }
    };
    startScanner();

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        try {
          html5QrCodeRef.current.stop();
        } catch (err: any) {
          const errorMessage = typeof err === 'string' ? err : err.message;
          if (errorMessage && !errorMessage.includes("Cannot transition to a new state, already under transition")) {
            console.error("Error stopping web scanner:", err);
          }
        }
      }
    };
  }, [onScanSuccess, onError]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && html5QrCodeRef.current) {
      try {
        const result = await html5QrCodeRef.current.scanFile(e.target.files[0], false);
        onScanSuccess(result);
      } catch (err) {
        onError("Could not scan the QR code from the selected file.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-900 shadow-inner">
        <div id={scannerRegionId} />
      </div>
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      <div className="relative flex items-center w-full my-1">
        <div className="flex-grow border-t border-muted"></div>
        <span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase">Or</span>
        <div className="flex-grow border-t border-muted"></div>
      </div>
      <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
        <Upload className="mr-2 h-4 w-4" /> Upload from File
      </Button>
    </div>
  );
};


// --- Main Exported Component ---
export function QrCodeScannerDialog() {
  const [mode, setMode] = useState<'closed' | 'web' | 'native'>('closed');
  const [isNativePlatform, setIsNativePlatform] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsNativePlatform(Capacitor.isNativePlatform());
  }, []);

  const handleOpenScanner = () => {
    setMode(isNativePlatform ? 'native' : 'web');
  };

  const handleClose = () => {
    setMode('closed');
  };

  const handleScanResult = useCallback((result: string) => {
    setMode('closed');
    setTimeout(() => {
      const urlPattern = /^(https?:\/\/[^\s$.?#].[^\s]*\/market\/|vicalfarmart:\/\/product\/)([a-zA-Z0-9_-]+)$/;
      const match = result.match(urlPattern);
      const productId = match ? match[2] : result.split('/').pop();

      if (productId && productId.length > 3) {
        toast({ title: "QR Code Scanned", description: `Product found. Redirecting...` });
        router.push(`/market/${productId}`);
      } else {
        toast({ title: "Invalid QR Code", description: "This QR code does not appear to be a valid Vical Farmart product link.", variant: "destructive" });
      }
    }, 150); // Small delay to allow UI to close smoothly
  }, [router, toast]);
  
  const onWebScanError = useCallback((message: string) => {
      toast({ title: "Scan Failed", description: message, variant: "destructive" });
  }, [toast]);

  return (
    <>
      <Button variant="ghost" size="icon" title="Scan QR Code" onClick={handleOpenScanner}>
        <QrCode className="h-5 w-5" />
        <span className="sr-only">Scan Product QR Code</span>
      </Button>

      {/* Render Native UI when native scanning is active */}
      {mode === 'native' && (
        <NativeScanner
          onScanSuccess={handleScanResult}
          onCancel={handleClose}
        />
      )}

      {/* Render Web Dialog UI when web dialog is open */}
      <Dialog open={mode === 'web'} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Product QR Code</DialogTitle>
            <DialogDescription>Position the QR code in view or upload an image.</DialogDescription>
          </DialogHeader>
          <div className="p-0 sm:p-4">
            <WebScanner onScanSuccess={handleScanResult} onError={onWebScanError} />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
