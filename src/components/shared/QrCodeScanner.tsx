"use client";

import React, { useState } from 'react';
import { QrScanner } from '@yudiel/react-qr-scanner';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ExternalLink } from 'lucide-react';

interface QrCodeScannerProps {
  onScanSuccess: () => void;
}

export const QrCodeScanner = ({ onScanSuccess }: QrCodeScannerProps) => {
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDecode = (result: string) => {
    try {
      const url = new URL(result);
      setScannedUrl(url.href);
      onScanSuccess();
    } catch (_) {
      setError("Scanned QR code is not a valid URL.");
      setScannedUrl(null);
    }
  };

  const handleError = (err: Error) => {
    if (err.name === 'NotAllowedError') {
      setError('Camera access denied. Please allow camera permissions in your browser settings.');
    } else {
      console.error('QR Scanner Error:', err);
      // Avoid showing overly technical errors to the user
    }
  };

  const handleGoToUrl = () => {
    if (scannedUrl) {
      window.open(scannedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Scanner Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {scannedUrl ? (
        <div className="text-center space-y-3">
          <Alert>
            <AlertTitle>Scan Successful!</AlertTitle>
            <AlertDescription className="break-all">{scannedUrl}</AlertDescription>
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
  );
};

export default QrCodeScanner;