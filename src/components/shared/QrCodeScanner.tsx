
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useToast } from '@/hooks/use-toast';
import { CameraOff, Upload } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

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
            // Ignore scan errors
          }
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
  }, []);

  const handleScanSuccess = (decodedText: string) => {
    try {
      new URL(decodedText); 
      toast({ title: "QR Code Scanned!", description: "Redirecting..." });
      onScanSuccess(decodedText);
    } catch (error) {
      toast({
        title: "Invalid QR Code",
        description: "The scanned code does not contain a valid URL.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && scannerRef.current) {
      try {
        const decodedText = await scannerRef.current.scanFile(file, false);
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
