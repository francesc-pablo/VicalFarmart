
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

// This component is for the web-based scanner, including camera and file upload.
const WebScanner = ({ onScanSuccess, onError }: { onScanSuccess: (result: string) => void; onError: (message: string) => void }) => {
  const scannerRegionId = "web-qr-reader";
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect for camera scanning
  useEffect(() => {
    // Initialize scanner only once
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode(scannerRegionId, /* verbose= */ false);
    }
    const html5QrCode = html5QrCodeRef.current;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10 }, // Removed qrbox to scan the full region
          (decodedText: string, result: Html5QrcodeResult) => {
            onScanSuccess(decodedText);
          },
          (errorMessage: string, error: Html5QrcodeError) => {
            // ignore scan errors, they're verbose
          }
        );
      } catch (err) {
         // This specific string error is a known race condition in the library during hot-reloads.
         // We can safely ignore it to prevent a crash.
         const errorMessage = typeof err === 'string' ? err : (err as Error).message;
         if (errorMessage.includes('Cannot transition to a new state, already under transition')) {
            console.warn("Ignoring a non-fatal QR scanner race condition:", err);
         } else {
            console.error("Web Scanner Start Error:", err);
            onError("Could not start camera. Please check permissions.");
         }
      }
    };
    startScanner();

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop()
          .catch(err => {
            const errorMessage = typeof err === 'string' ? err : (err as Error).message;
            if (errorMessage.includes("Cannot transition to a new state, already under transition")) {
              console.warn("Ignoring expected scanner stop error during cleanup.");
            } else {
              console.error("Error stopping scanner:", err);
            }
          });
      }
    };
  }, [onScanSuccess, onError]);

  // Handler for file scanning
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!html5QrCodeRef.current) return;
      try {
        const result = await html5QrCodeRef.current.scanFile(file, /* showImage= */ false);
        onScanSuccess(result);
      } catch (err) {
        console.error("File scan error:", err);
        onError("Could not scan the QR code from the selected file.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Container for the camera feed */}
      <div id={scannerRegionId} className="w-full rounded-lg bg-muted aspect-square" />
      
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
      
      <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
        <Upload className="mr-2 h-4 w-4" />
        Scan from File
      </Button>
    </div>
  );
};


export function QrCodeScannerDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleScanResult = useCallback((result: string) => {
    // Close the dialog FIRST, then handle the result.
    setIsDialogOpen(false);
    
    // Use a small timeout to allow the dialog to close before navigating.
    setTimeout(() => {
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
    }, 100);
  }, [router, toast]);
  
  const onWebScanError = (message: string) => {
      toast({
          title: "Scan Failed",
          description: message,
          variant: "destructive"
      });
  };

  return (
    <>
      <Button variant="ghost" size="icon" title="Scan QR Code" onClick={() => setIsDialogOpen(true)}>
        <QrCode className="h-5 w-5" />
        <span className="sr-only">Scan Product QR Code</span>
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Product QR Code</DialogTitle>
            <DialogDescription>Position the QR code inside the camera view or upload an image file.</DialogDescription>
          </DialogHeader>
          <div className="p-0 sm:p-4 flex flex-col items-center justify-center min-h-[300px]">
            {isDialogOpen && <WebScanner onScanSuccess={handleScanResult} onError={onWebScanError} />}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
