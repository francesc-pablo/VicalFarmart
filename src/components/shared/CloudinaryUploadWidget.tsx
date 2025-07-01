
"use client";

import { CldUploadWidget, type CldUploadWidgetProps } from 'next-cloudinary';
import React from 'react';

interface CustomUploadWidgetProps {
  onUpload: (url: string) => void;
  children: ({ open }: { open: (() => void) | undefined }) => React.ReactNode;
}

export function CloudinaryUploadWidget({ onUpload, children }: CustomUploadWidgetProps) {
    
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
        console.error("Cloudinary upload will not work. Environment variables NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET must be set in your .env.local file.");
        const disabledOpen = () => console.error("Cloudinary not configured. Cannot open widget.");
        return <div className="cursor-not-allowed opacity-50" title="Cloudinary not configured">{children({ open: disabledOpen })}</div>;
    }
    
    const handleUpload: CldUploadWidgetProps['onUpload'] = (result, { widget }) => {
        if (result.event === 'success' && typeof result.info === 'object' && result.info !== null && 'secure_url' in result.info) {
          onUpload(result.info.secure_url as string);
          widget.close();
        }
    };

    return (
        <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            onUpload={handleUpload}
            options={{
                sources: ['local', 'url'],
                maxFiles: 1,
                multiple: false,
                cropping: true,
                croppingAspectRatio: 1,
            }}
        >
        {({ open }) => {
            return <>{children({ open })}</>;
        }}
      </CldUploadWidget>
    );
}
