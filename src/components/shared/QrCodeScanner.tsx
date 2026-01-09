
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScannerInitialized, setIsScannerInitialized] = useState(false);

  useEffect(() => {
    if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(QR_SCANNER_ELEMENT_ID, {
            verbose: false,
        });
    }
    const scanner = scannerRef.current;
    
    if (isScannerInitialized || !scanner) {
        return;
    }

    const startScanner = async () => {
        try {
            const cameras = await Html5Qrcode.getCameras();
            if (!cameras || cameras.length === 0) {
                setHasPermission(false);
                toast({ title: 'No cameras found', variant: 'destructive' });
                return;
            }
            setHasPermission(true);

            await scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    handleScanSuccess(decodedText);
                    // No need to stop here, the unmount will handle it
                },
                (errorMessage) => {
                    // Ignore "QR code not found" errors
                }
            );
            setIsScannerInitialized(true);
        } catch (err) {
            setHasPermission(false);
            console.error("QR Scanner Start Error:", err);
            // Don't toast on every render if permission is denied.
        }
    };
    
    startScanner();

    return () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(err => {
                // This can happen if the component unmounts quickly.
                // It's generally safe to ignore.
                console.warn("Failed to stop scanner cleanly during unmount:", err);
            });
        }
    };
  }, [isScannerInitialized, toast]);

  const handleScanSuccess = (decodedText: string) => {
    try {
        const url = new URL(decodedText);
        if (url.pathname.startsWith('/market/')) {
            toast({ title: "QR Code Scanned!", description: "Redirecting to product page..." });
            router.push(url.pathname);
            onScanSuccess();
        } else {
            throw new Error("Not a valid product URL.");
        }
    } catch (error) {
        toast({
            title: "Invalid QR Code",
            description: "The scanned code is not a valid Vical Farmart product link.",
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
                    Please grant camera access in your browser settings to use the scanner. If you have, try reloading the page.
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
