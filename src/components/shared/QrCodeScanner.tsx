
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
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
import { QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';

const SCANNER_REGION_ID = "qr-code-reader";

export function QrCodeScannerDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const handleScanSuccess = useCallback((result: string) => {
    // Stop the scanner immediately
    if (scannerRef.current) {
      scannerRef.current.clear().catch(err => {
        console.error("Failed to clear scanner after success:", err);
      });
      scannerRef.current = null;
    }
    
    // Close the dialog
    setIsDialogOpen(false);

    // Regular expression to find a product ID in a URL or as a standalone string
    const urlPattern = /^(https?:\/\/[^\s$.?#].[^\s]*\/market\/|vicalfarmart:\/\/product\/)([a-zA-Z0-9_-]+)$/;
    const match = result.match(urlPattern);
    // If it matches a URL, grab the last part. Otherwise, assume the whole string is the ID.
    const productId = match ? match[2] : result.split('/').pop();

    if (productId && productId.length > 3) { // Basic validation
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

  useEffect(() => {
    if (isDialogOpen) {
      // Delay initialization slightly to ensure the dialog and DOM element are ready
      const timer = setTimeout(() => {
        if (!document.getElementById(SCANNER_REGION_ID)) {
          console.error("Scanner region element not found.");
          return;
        }

        const scanner = new Html5QrcodeScanner(
          SCANNER_REGION_ID,
          {
            qrbox: { width: 250, height: 250 },
            fps: 10,
            rememberLastUsedCamera: true,
          },
          false // verbose
        );

        scanner.render(
          (decodedText) => {
            // Pause the scanner to prevent multiple triggers
            scanner.pause();
            handleScanSuccess(decodedText);
          },
          (errorMessage) => {
            // ignore common "not found" errors
          }
        );

        scannerRef.current = scanner;
      }, 100); // 100ms delay

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(err => {
            console.error("Failed to clear scanner on cleanup:", err);
          });
          scannerRef.current = null;
        }
      };
    }
  }, [isDialogOpen, handleScanSuccess]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Scan QR Code">
          <QrCode className="h-5 w-5" />
          <span className="sr-only">Scan Product QR Code</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Product QR Code</DialogTitle>
          <DialogDescription>
            Position the QR code inside the box.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 flex flex-col items-center justify-center min-h-[300px]">
          <div id={SCANNER_REGION_ID} className="w-full rounded-md" />
        </div>
        <DialogFooter>
           <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
