
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
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (result) {
                resolve(result);
            } else {
                reject(error);
            }
        });
        stream.end(buffer);
    });
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new NextResponse(JSON.stringify({ success: false, message: "No file provided." }), { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const results = await uploadStream(buffer, { folder: 'vical_farmart_products' });
    
    return NextResponse.json({ success: true, url: results.secure_url });

  } catch (error) {
    console.error("Error uploading to Cloudinary: ", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Error uploading file.",
        error: errorMessage,
      }),
      { status: 500 }
    );
  }
}
