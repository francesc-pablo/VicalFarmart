
"use client";

import { CldUploadWidget, CldUploadWidgetPropsSuccess } from 'next-cloudinary';
import React from 'react';

interface CloudinaryUploadWidgetProps {
  onUpload: (url: string) => void;
  children: React.ReactNode;
}

export function CloudinaryUploadWidget({ onUpload, children }: CloudinaryUploadWidgetProps) {
    
    const handleSuccess = (result: CldUploadWidgetPropsSuccess) => {
        if (result.event === 'success' && typeof result.info === 'object' && result.info !== null && 'secure_url' in result.info) {
          onUpload(result.info.secure_url as string);
        }
    };

    return (
        <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            onSuccess={handleSuccess}
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
