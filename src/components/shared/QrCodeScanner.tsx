
"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useToast } from '@/hooks/use-toast';
import { Link as LinkIcon, ExternalLink, CameraOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '../ui/button';

// Dynamically import the scanner component to ensure it only runs on the client-side
// and correctly reference the default export from the module.
const QrScanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then(mod => mod.default),
  { ssr: false }
);

interface QrCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export const QrCodeScanner: React.FC<QrCodeScannerProps> = ({ onScanSuccess }) => {
  const { toast } = useToast();
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);

  const handleDecode = (result: string) => {
    try {
      new URL(result); // Validate if it's a URL
      setScannedUrl(result);
      toast({ title: "QR Code Scanned!", description: "Click the button to open the link." });
    } catch (error) {
      toast({
        title: "Invalid QR Code",
        description: "The scanned code does not contain a valid URL.",
        variant: "destructive",
      });
    }
  };

  const handleError = (error: any) => {
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
  
  return (
    <div>
      {!scannedUrl ? (
         <div className="w-full rounded-md overflow-hidden border">
           <QrScanner
                onDecode={handleDecode}
                onError={handleError}
                containerStyle={{ width: '100%', paddingTop: '100%' }}
                videoStyle={{ objectFit: 'cover' }}
            />
         </div>
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
    </div>
  );
};
