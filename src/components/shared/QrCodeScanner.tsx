
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useToast } from '@/hooks/use-toast';
import { CameraOff, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface QrCodeScannerProps {
  onScanSuccess: () => void;
}

const QR_SCANNER_ELEMENT_ID = "qr-code-scanner-region";

export const QrCodeScanner: React.FC<QrCodeScannerProps> = ({ onScanSuccess }) => {
  const { toast } = useToast();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use a ref to hold the Html5Qrcode instance
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Ensure this only runs on the client
    if (typeof window === "undefined") {
      return;
    }

    // Initialize the scanner instance once
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(QR_SCANNER_ELEMENT_ID, {
         useBarCodeDetectorIfSupported: false,
         verbose: false,
      });
    }
    const scanner = scannerRef.current;

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            handleScanSuccess(decodedText);
          },
          (errorMessage) => {
            // This callback is for scan errors, which we can ignore.
          }
        );
        setHasPermission(true);
      } catch (err) {
        console.error("QR Scanner Start Error:", err);
        setHasPermission(false);
      }
    };
    
    startScanner();

    // Define a cleanup function
    return () => {
      if (scanner && scanner.isScanning) {
        scanner.stop().catch(err => {
          // This can fail if the component unmounts quickly, so we just log a warning.
          console.warn("Failed to stop scanner cleanly during cleanup:", err);
        });
      }
    };
    // The empty dependency array ensures this effect runs only once on mount and cleans up on unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScanSuccess = (decodedText: string) => {
    const scanner = scannerRef.current;
    if (scanner && scanner.isScanning) {
        scanner.stop().catch(err => console.warn("Failed to stop scanner after success:", err));
    }
    
    try {
      // Validate if the decoded text is a plausible URL before opening
      new URL(decodedText); 
      toast({ title: "QR Code Scanned!", description: "Opening in a new tab..." });
      window.open(decodedText, '_blank', 'noopener,noreferrer');
      onScanSuccess();
    } catch (error) {
      toast({
        title: "Invalid QR Code",
        description: "The scanned code does not contain a valid URL.",
        variant: "destructive",
      });
      // Optionally restart the scanner if the code is invalid
      if(scanner && !scanner.isScanning) {
        scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => handleScanSuccess(decodedText),
          () => {}
        ).catch(err => console.error("Failed to restart scanner:", err));
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const scanner = scannerRef.current;
    if (file && scanner) {
      try {
        const decodedText = await scanner.scanFile(file, false);
        handleScanSuccess(decodedText);
      } catch (err) {
        toast({
          title: "Scan Failed",
          description: "Could not find a valid QR code in the uploaded image.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div>
      {/* This div is the target for the scanner */}
      <div id={QR_SCANNER_ELEMENT_ID} className="w-full rounded-md overflow-hidden border"></div>
      
      {hasPermission === false && (
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
