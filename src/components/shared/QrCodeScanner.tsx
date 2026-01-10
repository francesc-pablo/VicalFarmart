
'use client';

import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner, QrCodeResult, Html5QrcodeError } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Camera, ExternalLink, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SCANNER_REGION_ID = "qr-code-reader";

export function QrCodeScannerDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) {
      setScannedUrl(null);
      return;
    }

    if (scannedUrl) {
      return;
    }

    let scanner: Html5QrcodeScanner | null = null;
    
    // Add a short delay to ensure the DOM element is available.
    const timeoutId = setTimeout(() => {
      // Check if the element exists before initializing
      if (!document.getElementById(SCANNER_REGION_ID)) {
          console.error("Scanner container not found.");
          return;
      }

      scanner = new Html5QrcodeScanner(
        SCANNER_REGION_ID,
        {
          qrbox: { width: 250, height: 250 },
          fps: 10,
        },
        false // verbose
      );

      const onScanSuccess = (decodedText: string, decodedResult: QrCodeResult) => {
        setScannedUrl(decodedText);
        if (scanner) {
          scanner.clear().catch(error => {
            console.error("Failed to clear scanner.", error);
          });
        }
      };

      const onScanError = (errorMessage: string, error: Html5QrcodeError) => {
        // This callback is called frequently, so we typically ignore errors.
      };

      scanner.render(onScanSuccess, onScanError);
    }, 100); // 100ms delay

    return () => {
      clearTimeout(timeoutId);
      if (scanner && scanner.getState() !== 2 /* NOT_SCANNING */) {
        scanner.clear().catch(error => {
          console.error("Failed to clear scanner on cleanup.", error);
        });
      }
    };
  }, [isOpen, scannedUrl]);

  const handleGoToUrl = () => {
    if (scannedUrl) {
      setIsOpen(false);
      if (scannedUrl.startsWith('/') || scannedUrl.startsWith(window.location.origin)) {
        router.push(scannedUrl);
      } else {
        window.open(scannedUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleScanAgain = () => {
    setScannedUrl(null);
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setScannedUrl(null); // Reset on close
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Scan QR Code">
          <Camera className="h-5 w-5" />
          <span className="sr-only">Scan QR Code</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
        </DialogHeader>
        <div className="p-4 flex flex-col items-center justify-center min-h-[300px]">
          {scannedUrl ? (
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">Scan Successful!</p>
              <p className="text-sm text-muted-foreground break-all mb-4">{scannedUrl}</p>
              <Button onClick={handleGoToUrl}>
                <ExternalLink className="mr-2 h-4 w-4" /> Go to URL
              </Button>
            </div>
          ) : (
            <div id={SCANNER_REGION_ID} className="w-full rounded-md" />
          )}
        </div>
        <DialogFooter>
           {scannedUrl && (
             <Button variant="outline" onClick={handleScanAgain}>
               <RefreshCw className="mr-2 h-4 w-4" /> Scan Again
             </Button>
           )}
           <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
