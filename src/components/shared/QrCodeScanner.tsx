
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

// --- Native Scanner UI Component ---
const NativeScanner = ({ onScanSuccess, onCancel }: { onScanSuccess: (result: string) => void; onCancel: () => void }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let didCancel = false;

    const startScan = async () => {
      try {
        document.body.classList.add('scanner-active');
        await BarcodeScanner.checkPermission({ force: true });
        await BarcodeScanner.hideBackground();
        
        const result = await BarcodeScanner.startScan({ targetedFormats: [SupportedFormat.QR_CODE] });

        if (result.hasContent && !didCancel) {
          onScanSuccess(result.content);
        }
      } catch (e: any) {
        if (!didCancel) {
            const message = (e.message || 'unknown error').toLowerCase();
            if (message.includes('cancelled')) {
                onCancel();
            } else if (message.includes('permission was denied')) {
                setError('Camera permission is required. Please grant permission in your app settings and try again.');
            } else {
                setError(`An error occurred: ${e.message}`);
            }
        }
      }
    };

    startScan();

    return () => {
      didCancel = true;
      document.body.classList.remove('scanner-active');
      BarcodeScanner.showBackground();
      BarcodeScanner.stopScan();
    };
  }, [onScanSuccess, onCancel]);

  return (
      <div id="native-scanner-ui">
          {error ? (
              <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-8 text-center text-white">
                  <h3 className="text-xl font-bold text-destructive mb-2">Scanning Error</h3>
                  <p className="mb-4">{error}</p>
                  <Button onClick={onCancel} variant="secondary">Close</Button>
              </div>
          ) : (
              <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-transparent text-white">
                  <div className="relative w-64 h-64">
                      <div className="absolute top-0 left-0 h-12 w-12 rounded-tl-lg border-t-4 border-l-4 border-white/80"></div>
                      <div className="absolute top-0 right-0 h-12 w-12 rounded-tr-lg border-t-4 border-r-4 border-white/80"></div>
                      <div className="absolute bottom-0 left-0 h-12 w-12 rounded-bl-lg border-b-4 border-l-4 border-white/80"></div>
                      <div className="absolute bottom-0 right-0 h-12 w-12 rounded-br-lg border-b-4 border-r-4 border-white/80"></div>
                  </div>
                  <p className="mt-4 text-lg font-medium">Position the QR code inside the box</p>
                  <div className="absolute bottom-8 w-full px-8">
                      <Button onClick={onCancel} variant="secondary" size="lg" className="w-full">Cancel Scan</Button>
                  </div>
              </div>
          )}
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
        if (typeof err === 'string' && err.includes('Cannot transition to a new state, already under transition')) {
            console.warn("Ignoring non-fatal scanner transition error.");
            return;
        }
        console.error("Web Scanner Start Error:", err);
        onError("Could not start camera. Please check permissions.");
      }
    };
    startScanner();

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        try {
          html5QrCodeRef.current.stop();
        } catch (err: any) {
          if (typeof err === 'string' && err.includes('Cannot transition to a new state, already under transition')) {
            console.warn("Ignoring non-fatal scanner transition error on cleanup.");
            return;
          }
          console.error("Error stopping web scanner:", err);
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
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4">
          <div className="relative w-2/3 max-w-[250px] aspect-square">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/50 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/50 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/50 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/50 rounded-br-lg"></div>
          </div>
           <p className="mt-4 text-white/90 text-xs font-medium bg-black/40 px-2 py-1 rounded-md">
            Place QR code here
          </p>
        </div>
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

  const handleClose = useCallback(() => {
    setMode('closed');
  }, []);

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
    }, 150);
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

      {mode === 'native' && (
        <NativeScanner
          onScanSuccess={handleScanResult}
          onCancel={handleClose}
        />
      )}

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
