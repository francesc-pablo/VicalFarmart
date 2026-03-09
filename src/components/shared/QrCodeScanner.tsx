'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { QrCode, Upload, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Html5Qrcode, Html5QrcodeError, Html5QrcodeResult } from 'html5-qrcode';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';

// --- Native Scanner UI Component ---
const NativeScanner = ({ onScanSuccess, onCancel }: { onScanSuccess: (result: string) => void; onCancel: () => void }) => {
  const [error, setError] = useState<{ message: string; showSettings: boolean } | null>(null);

  const startScan = useCallback(async () => {
    try {
      setError(null);
      
      // Verification check for the plugin implementation
      if (typeof BarcodeScanner.checkPermission !== 'function') {
          throw new Error('BarcodeScanner plugin bridge is not available. Try running "npx cap sync".');
      }

      // Request permissions explicitly
      const status = await BarcodeScanner.checkPermission({ force: true });
      
      if (status.granted) {
        // Native UI preparation
        document.body.classList.add('scanner-active');
        await BarcodeScanner.hideBackground();
        
        const result = await BarcodeScanner.startScan({ 
          targetedFormats: [SupportedFormat.QR_CODE] 
        });

        if (result.hasContent) {
          onScanSuccess(result.content);
        }
      } else if (status.denied) {
        setError({ message: 'Camera permission was denied. Please enable it in your app settings.', showSettings: true });
      } else {
        setError({ message: 'Camera access is required to scan QR codes.', showSettings: false });
      }
    } catch (e: any) {
      console.error("Native Scanner Error:", e);
      const message = (e.message || 'unknown error').toLowerCase();
      if (message.includes('cancelled')) {
          onCancel();
      } else {
          setError({ message: `Scanning failed: ${e.message}`, showSettings: false });
      }
    }
  }, [onScanSuccess, onCancel]);

  useEffect(() => {
    startScan();

    return () => {
      document.body.classList.remove('scanner-active');
      try {
          BarcodeScanner.showBackground();
          BarcodeScanner.stopScan();
      } catch (e) {}
    };
  }, [startScan]);

  if (error) {
    return (
       <div id="native-scanner-ui" className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-8 text-center text-white">
          <h3 className="text-xl font-bold text-destructive mb-2">Scanner Issue</h3>
          <p className="mb-6">{error.message}</p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {error.showSettings && (
              <Button onClick={() => BarcodeScanner.openAppSettings()} variant="default">
                <Settings className="mr-2 h-4 w-4" /> Open App Settings
              </Button>
            )}
            <Button onClick={startScan} variant="outline">Retry</Button>
            <Button onClick={onCancel} variant="secondary">Cancel</Button>
          </div>
       </div>
    );
  }

  return (
    <div id="native-scanner-ui" className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 text-white p-8">
      <p className="text-lg font-medium text-center mb-4">Focus the QR code within the frame</p>
      <div className="relative w-64 h-64 rounded-lg overflow-hidden border-2 border-white/20 shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/80 animate-scan-line rounded-full shadow-[0_0_15px_rgba(var(--primary),0.8)]"></div>
        <div className="absolute top-0 left-0 h-12 w-12 rounded-tl-lg border-t-4 border-l-4 border-white/90"></div>
        <div className="absolute top-0 right-0 h-12 w-12 rounded-tr-lg border-t-4 border-r-4 border-white/90"></div>
        <div className="absolute bottom-0 left-0 h-12 w-12 rounded-bl-lg border-b-4 border-l-4 border-white/90"></div>
        <div className="absolute bottom-0 right-0 h-12 w-12 rounded-br-lg border-b-4 border-r-4 border-white/90"></div>
      </div>
      <div className="absolute bottom-8 w-full px-8 text-center">
        <Button onClick={onCancel} variant="secondary" size="lg" className="w-full">Stop Scanning</Button>
        <p className="text-xs text-white/50 mt-4">Scanner Active</p>
      </div>
    </div>
  );
};


// --- Web Scanner Component ---
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
          (errorMessage: string, error: Html5QrcodeError) => { }
        );
      } catch (err: any) {
        console.error("Web Scanner Error:", err);
        onError("Could not access camera. Please check browser permissions.");
      }
    };
    startScanner();

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        try {
          html5QrCodeRef.current.stop();
        } catch (err: any) {}
      }
    };
  }, [onScanSuccess, onError]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && html5QrCodeRef.current) {
      try {
        const result = await html5QrCodeRef.current.scanFile(e.target.files[0], false);
        onScanSuccess(result);
      } catch (err) {
        onError("Could not read QR code from file.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-900 shadow-inner">
        <div id={scannerRegionId} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4">
          <div className="relative w-2/3 max-w-[250px] aspect-square">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/50 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/50 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/50 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/50 rounded-br-lg"></div>
          </div>
        </div>
      </div>
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      <div className="relative flex items-center w-full my-1">
        <div className="flex-grow border-t border-muted"></div>
        <span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase">Or</span>
        <div className="flex-grow border-t border-muted"></div>
      </div>
      <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
        <Upload className="mr-2 h-4 w-4" /> Upload from Gallery
      </Button>
    </div>
  );
};


export function QrCodeScannerDialog() {
  const [mode, setMode] = useState<'closed' | 'web' | 'native'>('closed');
  const router = useRouter();
  const { toast } = useToast();

  const handleOpenScanner = () => {
    // Check for native platform at runtime
    if (Capacitor.isNativePlatform()) {
        setMode('native');
    } else {
        setMode('web');
    }
  };

  const handleClose = useCallback(() => {
    setMode('closed');
  }, []);

  const handleScanResult = useCallback((result: string) => {
    setMode('closed');
    setTimeout(() => {
      // Logic to parse the QR code
      const urlPattern = /^(https?:\/\/[^\s$.?#].[^\s]*\/market\/|vicalfarmart:\/\/product\/)([a-zA-Z0-9_-]+)$/;
      const match = result.match(urlPattern);
      const productId = match ? match[2] : result.split('/').pop();

      if (productId && productId.length > 3) {
        toast({ title: "Product Found", description: `Loading details...` });
        router.push(`/market/${productId}`);
      } else {
        toast({ title: "Invalid QR Code", description: "The scanned code is not a valid product link.", variant: "destructive" });
      }
    }, 150);
  }, [router, toast]);
  
  const onWebScanError = useCallback((message: string) => {
      toast({ title: "Scanner Error", description: message, variant: "destructive" });
  }, [toast]);

  return (
    <>
      <Button variant="ghost" size="icon" title="Scan QR Code" onClick={handleOpenScanner}>
        <QrCode className="h-5 w-5" />
        <span className="sr-only">Scan</span>
      </Button>

      {mode === 'native' && createPortal(
        <NativeScanner
          onScanSuccess={handleScanResult}
          onCancel={handleClose}
        />,
        document.body
      )}

      <Dialog open={mode === 'web'} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Product QR Code</DialogTitle>
            <DialogDescription>Use your camera to scan or upload an image.</DialogDescription>
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