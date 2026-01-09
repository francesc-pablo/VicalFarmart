
"use client";

import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { ExternalLink, LinkIcon, ScanLine } from 'lucide-react';
import { QrScanner } from '@yudiel/react-qr-scanner';

interface QrCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

const QrCodeScannerComponent: React.FC<QrCodeScannerProps> = ({ onScanSuccess }) => {
  const { toast } = useToast();
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);

  const handleDecode = (result: string) => {
    if (result && !scannedUrl) {
      try {
        // Simple validation to check if it's a plausible URL
        new URL(result);
        setScannedUrl(result);
        toast({ title: "QR Code Scanned!", description: "Click the button to open the link." });
      } catch (error) {
        toast({
          title: "Invalid QR Code",
          description: "The scanned code does not contain a valid URL.",
          variant: "destructive",
        });
      }
    }
  };

  const handleError = (error: Error) => {
    console.error("QR Scanner Error:", error);
    let message = "An unknown error occurred with the camera.";
    if (error?.name === "NotAllowedError") {
      message = "Camera permission was denied. Please enable it in your browser settings.";
    } else if (error?.name === "NotFoundError") {
      message = "No camera was found on this device.";
    }
    toast({
      title: "Camera Error",
      description: message,
      variant: "destructive",
    });
  };

  const openScannedUrl = () => {
    if (scannedUrl) {
      onScanSuccess(scannedUrl);
    }
  };

  const scanAgain = () => {
    setScannedUrl(null);
  };
  
  return (
    <div>
      {scannedUrl ? (
        <div className="flex flex-col items-center justify-center p-4 border rounded-md bg-muted min-h-[300px]">
           <LinkIcon className="h-12 w-12 text-primary mb-4" />
           <p className="text-sm text-muted-foreground mb-2">Scanned Link:</p>
           <p className="text-center font-semibold break-all mb-6">{scannedUrl}</p>
           <div className="flex gap-4">
            <Button onClick={openScannedUrl} size="lg">
                <ExternalLink className="mr-2 h-4 w-4" />
                Go to URL
            </Button>
            <Button onClick={scanAgain} variant="outline">
                <ScanLine className="mr-2 h-4 w-4" />
                Scan Again
            </Button>
           </div>
        </div>
      ) : (
        <div className="w-full rounded-md overflow-hidden border">
           <QrScanner
                onDecode={handleDecode}
                onError={handleError}
                constraints={{ facingMode: 'environment' }}
            />
            <p className="text-center text-sm text-muted-foreground p-2">Point your camera at a QR code.</p>
        </div>
      )}
    </div>
  );
};

export default QrCodeScannerComponent;
