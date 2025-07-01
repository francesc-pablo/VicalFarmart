
"use client";

import { CldUploadWidget } from 'next-cloudinary';
import React from 'react';

interface CloudinaryUploadWidgetProps {
  onUpload: (url: string) => void;
  children: React.ReactNode;
}

export function CloudinaryUploadWidget({ onUpload, children }: CloudinaryUploadWidgetProps) {
    
    // Developer-friendly warning for missing environment variables
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
        console.error("Cloudinary upload will not work. Environment variables NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET must be set in your .env.local file.");
        // Render the children but make it clear that it's disabled.
        return <div className="cursor-not-allowed opacity-50" title="Cloudinary not configured">{children}</div>;
    }
    
    // The type for the result object from the onUpload callback is complex,
    // so we use `any` and perform safe runtime checks.
    const handleUpload = (result: any) => {
        if (result.event === 'success' && typeof result.info === 'object' && result.info !== null && 'secure_url' in result.info) {
          onUpload(result.info.secure_url as string);
        }
    };

    return (
        <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            onUpload={handleUpload} // Use onUpload instead of the deprecated onSuccess
            options={{
                sources: ['local', 'url'],
                maxFiles: 1,
                multiple: false,
                cropping: true,
                croppingAspectRatio: 1,
            }}
        >
        {({ open }) => {
          function handleOnClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
            e.preventDefault();
            open();
          }
          return (
            <div onClick={handleOnClick} className="cursor-pointer w-fit">
                {children}
            </div>
          );
        }}
      </CldUploadWidget>
    );
}
