
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertTitle } from '@/components/ui/alert';
import { QrScanner } from '@yudiel/react-qr-scanner';
import { ExternalLink, Camera } from 'lucide-react';


export const QrCodeScannerDialog = () => {
    const [scannedUrl, setScannedUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleDecode = (result: string) => {
        try {
            if (result && (result.startsWith('http://') || result.startsWith('https://'))) {
                const url = new URL(result);
                setScannedUrl(url.href);
            } else {
                setError("Scanned QR code does not contain a valid URL.");
                setScannedUrl(null);
            }
        } catch (_) {
            setError("Scanned QR code is not a valid URL.");
            setScannedUrl(null);
        }
    };

    const handleError = (err: any) => {
        if (err && err.name === 'NotAllowedError') {
            setError('Camera access denied. Please allow camera permissions in your browser settings.');
        } else {
            console.error('QR Scanner Error:', err);
            setError('An unexpected error occurred with the camera.');
        }
    };

    const handleGoToUrl = () => {
        if (scannedUrl) {
            window.open(scannedUrl, '_blank', 'noopener,noreferrer');
            setIsOpen(false);
        }
    };
    
    // Reset state when dialog is closed
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setScannedUrl(null);
                setError(null);
            }, 300); // Delay to allow dialog to close smoothly
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Scan QR Code">
                    <Camera className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Scan QR Code</DialogTitle>
                    <DialogDescription>
                        Point your camera at a product or payment QR code to quickly access it.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>{error}</AlertTitle>
                        </Alert>
                    )}
                    {scannedUrl ? (
                        <div className="text-center space-y-3">
                            <Alert>
                                <AlertTitle>Scan Successful!</AlertTitle>
                                <p className="text-sm text-muted-foreground break-all">{scannedUrl}</p>
                            </Alert>
                            <Button onClick={handleGoToUrl} className="w-full">
                                <ExternalLink className="mr-2 h-4 w-4" /> Go to URL
                            </Button>
                        </div>
                    ) : (
                        <div className="w-full rounded-md overflow-hidden border">
                           <QrScanner
                                onDecode={handleDecode}
                                onError={handleError}
                                constraints={{ facingMode: 'environment' }}
                                videoStyle={{ width: '100%', height: '100%' }}
                                containerStyle={{ width: '100%' }}
                            />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
