
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { CameraOff, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface QrCodeScannerProps {
  onScanSuccess: () => void;
}

const QR_READER_ID = "qr-code-reader";

export function QrCodeScanner({ onScanSuccess }: QrCodeScannerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const isValidProductUrl = (url: string) => {
    try {
      const urlObject = new URL(url);
      return urlObject.pathname.startsWith('/market/');
    } catch (e) {
      return false;
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    if (isValidProductUrl(decodedText)) {
      toast({
        title: "QR Code Scanned",
        description: "Redirecting to product page...",
      });
      router.push(decodedText);
      onScanSuccess();
    } else {
      toast({
        title: "Invalid QR Code",
        description: "This QR code does not lead to a valid product page.",
        variant: "destructive",
      });
    }
  };

  const handleScanFailure = (error: any) => {
    // This can get noisy, so we don't toast every failure.
    // console.warn(`QR error: ${error}`);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (!html5QrCodeRef.current) return;
      try {
        await html5QrCodeRef.current.scanFile(file, true)
            .then(handleScanSuccess)
            .catch(handleScanFailure);
      } catch (error: any) {
        toast({
          title: "Scan Failed",
          description: error.message || "Could not scan the QR code from the image.",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(QR_READER_ID, {
            formatsToSupport: [0], // 0 corresponds to QR_CODE format
            verbose: false
        });
    }

    const qrCode = html5QrCodeRef.current;
    
    // Prevent starting a new scan if one is already running
    if (qrCode.getState() === Html5QrcodeScannerState.SCANNING) {
      return;
    }

    Html5Qrcode.getCameras()
      .then(cameras => {
        if (cameras && cameras.length) {
          setHasPermission(true);
          qrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            handleScanSuccess,
            handleScanFailure
          ).then(() => {
            setIsScanning(true);
          }).catch(err => {
             console.error("Failed to start scanner", err);
             setHasPermission(false);
          });
        } else {
          setHasPermission(false);
        }
      })
      .catch(err => {
        console.error("Failed to get cameras", err);
        setHasPermission(false);
      });

    return () => {
      // Check if the scanner is running before trying to stop it
      if (qrCode && qrCode.getState() === Html5QrcodeScannerState.SCANNING) {
        qrCode.stop().then(() => {
          setIsScanning(false);
          console.log("QR scanner stopped successfully.");
        }).catch(err => {
          console.error("Failed to stop QR scanner.", err)
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
        <div id={QR_READER_ID} className="w-full border-2 border-dashed rounded-lg bg-muted min-h-[300px] flex items-center justify-center">
            {hasPermission === false && (
                <div className="text-center p-4">
                    <CameraOff className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Camera not available or permission denied.</p>
                    <p className="text-xs text-muted-foreground">Please grant camera access in your browser settings.</p>
                </div>
            )}
             {hasPermission === null && (
                <div className="text-center p-4">
                    <p className="text-muted-foreground">Requesting camera permission...</p>
                </div>
            )}
        </div>
        
        <Alert>
            <AlertTitle className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                No Camera?
            </AlertTitle>
            <AlertDescription>
                You can upload an image of a QR code instead.
            </AlertDescription>
        </Alert>

        <Button
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
        >
            Upload QR Code Image
        </Button>
        <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
        />
    </div>
  );
}
