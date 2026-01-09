
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useToast } from '@/hooks/use-toast';
import { CameraOff, Upload, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface QrCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

const QR_SCANNER_ELEMENT_ID = "qr-code-scanner-region";

export const QrCodeScanner: React.FC<QrCodeScannerProps> = ({ onScanSuccess }) => {
  const { toast } = useToast();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const handleScanSuccess = (decodedText: string) => {
    try {
      new URL(decodedText); // Validate if it's a URL
      setScannedUrl(decodedText);
      toast({ title: "QR Code Scanned!", description: "Click the button to open the link." });
    } catch (error) {
      toast({
        title: "Invalid QR Code",
        description: "The scanned code does not contain a valid URL.",
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(QR_SCANNER_ELEMENT_ID, false);
    }
    const scanner = scannerRef.current;
    
    // If a URL has been scanned, we should stop the scanner.
    if (scannedUrl) {
      if (scanner && scanner.isScanning) {
        scanner.stop().catch(err => {
          console.error("Failed to stop scanner after success:", err);
        });
      }
      return;
    }

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          handleScanSuccess,
          (errorMessage) => { /* ignore non-successful scans */ }
        );
        setHasPermission(true);
      } catch (err) {
        console.error("QR Scanner Start Error:", err);
        setHasPermission(false);
      }
    };
    
    startScanner();

    return () => {
      if (scanner && scanner.isScanning) {
        scanner.stop().catch(err => {
          console.warn("Failed to stop scanner cleanly during cleanup:", err);
        });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannedUrl]); // Rerun effect when scannedUrl changes to stop the scanner

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const scanner = scannerRef.current;
    
    if (file && scanner) {
      // Stop the camera feed before scanning file
      if (scanner.isScanning) {
        await scanner.stop();
      }
      try {
        const decodedText = await scanner.scanFile(file, false);
        handleScanSuccess(decodedText);
      } catch (err) {
        toast({
          title: "Scan Failed",
          description: "Could not find a valid QR code in the uploaded image.",
          variant: "destructive",
        });
         // If file scan fails, try to restart the camera if it was running
        if (!scannedUrl) {
            scanner.start(
              { facingMode: "environment" },
              { fps: 10, qrbox: { width: 250, height: 250 } },
              handleScanSuccess,
              () => {}
            ).catch(() => {});
        }
      }
    }
  };

  const openScannedUrl = () => {
    if (scannedUrl) {
      onScanSuccess(scannedUrl);
    }
  };
  
  return (
    <div>
      {!scannedUrl ? (
         <div id={QR_SCANNER_ELEMENT_ID} className="w-full rounded-md overflow-hidden border"></div>
      ) : (
        <div className="flex flex-col items-center justify-center p-4 border rounded-md bg-muted min-h-[300px]">
           <LinkIcon className="h-12 w-12 text-primary mb-4" />
           <p className="text-sm text-muted-foreground mb-2">Scanned Link:</p>
           <p className="text-center font-semibold break-all mb-6">{scannedUrl}</p>
           <Button onClick={openScannedUrl} size="lg">
              <ExternalLink className="mr-2 h-4 w-4" />
              Go to URL
           </Button>
        </div>
      )}
      
      {hasPermission === false && !scannedUrl && (
        <Alert variant="destructive" className="mt-4">
          <CameraOff className="h-4 w-4" />
          <AlertTitle>Camera Permission Required</AlertTitle>
          <AlertDescription>
            Please grant camera access in your browser settings to use the scanner.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground mb-2">Or upload an image of a QR code</p>
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
      </div>
    </div>
  );
};
