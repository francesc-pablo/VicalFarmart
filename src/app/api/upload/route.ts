
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload a stream to Cloudinary
const uploadStream = (buffer: Buffer, options: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(options, (error, result) => {
            if (result) {
                resolve(result);
            } else {
                reject(error);
            }
        }).end(buffer);
    });
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided." }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine resource type based on MIME type
    const isDocument = file.type === 'application/pdf' || 
                       file.type === 'application/msword' || 
                       file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                       
    const resource_type = isDocument ? 'raw' : 'image';

    // Upload to Cloudinary with the correct resource type
    const results = await uploadStream(buffer, { 
      folder: 'vical_farmart_uploads',
      resource_type: resource_type,
    });
    
    return NextResponse.json({ success: true, url: results.secure_url });

  } catch (error) {
    console.error("Error uploading to Cloudinary: ", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during upload.";
    return NextResponse.json(
      {
        success: false,
        message: "Error uploading file.",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
