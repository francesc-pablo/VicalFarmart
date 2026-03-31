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

  const stopScanner = useCallback(async () => {
    try {
      document.documentElement.classList.remove('scanner-active');
      document.body.classList.remove('scanner-active');
      await BarcodeScanner.showBackground();
      await BarcodeScanner.stopScan();
    } catch (e) {
      console.warn("Cleanup error:", e);
    }
  }, []);

  const startScan = useCallback(async () => {
    try {
      setError(null);
      
      // Check/Request permissions explicitly
      const status = await BarcodeScanner.checkPermission({ force: true });
      
      if (status.granted) {
        // Native UI preparation: make body transparent to see camera through webview
        document.documentElement.classList.add('scanner-active');
        document.body.classList.add('scanner-active');
        await BarcodeScanner.hideBackground();
        
        const result = await BarcodeScanner.startScan({ 
          targetedFormats: [SupportedFormat.QR_CODE] 
        });

        // Scan ended, restore UI
        await stopScanner();

        if (result.hasContent) {
          onScanSuccess(result.content);
        } else {
          // Result with no content usually means cancelled by user or stopScan called
          onCancel();
        }
      } else if (status.denied) {
        setError({ message: 'Camera permission was denied. Please enable it in your app settings.', showSettings: true });
      } else {
        setError({ message: 'Camera access is required to scan QR codes.', showSettings: false });
      }
    } catch (e: any) {
      console.error("Native Scanner Error:", e);
      // "plugin not implemented" handling
      if (e.message?.includes('not implemented')) {
          setError({ message: 'The scanner plugin is not currently ready on your device. Please ensure you have synced the native project.', showSettings: false });
      } else {
          setError({ message: `Scanning failed: ${e.message || 'Unknown error'}`, showSettings: false });
      }
    }
  }, [onScanSuccess, onCancel, stopScanner]);

  useEffect(() => {
    startScan();
    return () => {
      stopScanner();
    };
  }, [startScan, stopScanner]);

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
    <div id="native-scanner-ui" className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-white">
      {/* Dimmed overlays around the clear scan area */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-[calc(50%-128px)] bg-black/40"></div>
          <div className="absolute bottom-0 left-0 right-0 h-[calc(50%-128px)] bg-black/40"></div>
          <div className="absolute top-[calc(50%-128px)] bottom-[calc(50%-128px)] left-0 w-[calc(50%-128px)] bg-black/40"></div>
          <div className="absolute top-[calc(50%-128px)] bottom-[calc(50%-128px)] right-0 w-[calc(50%-128px)] bg-black/40"></div>
      </div>

      <div className="z-10 flex flex-col items-center">
        <p className="text-lg font-medium text-center mb-8 drop-shadow-md">Focus the QR code within the frame</p>
        
        <div className="relative w-64 h-64 rounded-lg border-2 border-white/40 shadow-[0_0_0_100vmax_rgba(0,0,0,0.2)]">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/80 animate-scan-line rounded-full"></div>
            <div className="absolute -top-1 -left-1 h-12 w-12 rounded-tl-lg border-t-4 border-l-4 border-white"></div>
            <div className="absolute -top-1 -right-1 h-12 w-12 rounded-tr-lg border-t-4 border-r-4 border-white"></div>
            <div className="absolute -bottom-1 -left-1 h-12 w-12 rounded-bl-lg border-b-4 border-l-4 border-white"></div>
            <div className="absolute -bottom-1 -right-1 h-12 w-12 rounded-br-lg border-b-4 border-r-4 border-white"></div>
        </div>

        <div className="mt-12 w-64">
            <Button onClick={onCancel} variant="secondary" size="lg" className="w-full opacity-90">Stop Scanning</Button>
        </div>
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
    // Short timeout to let the dialog close or UI clean up
    setTimeout(() => {
      const urlPattern = /^(https?:\/\/[^\s$.?#].[^\s]*\/market\/|vicalfarmart:\/\/product\/)([a-zA-Z0-9_-]+)$/;
      const match = result.match(urlPattern);
      const productId = match ? match[2] : result.split('/').pop();

      if (productId && productId.length > 3) {
        toast({ title: "Product Found", description: `Loading details...` });
        router.push(`/market/${productId}`);
      } else {
        toast({ title: "Invalid QR Code", description: "The scanned code is not a valid product link.", variant: "destructive" });
      }
    }, 300);
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