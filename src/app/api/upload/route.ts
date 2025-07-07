
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * API route to handle signing of Cloudinary upload parameters.
 * This is used for secure, direct client-side uploads.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paramsToSign } = body;

    if (!process.env.CLOUDINARY_API_SECRET) {
      throw new Error("Cloudinary API secret is not configured.");
    }
    
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);

    return NextResponse.json({ signature });

  } catch (error) {
    console.error("Error signing Cloudinary request: ", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Error signing upload request.",
        error: errorMessage,
      }),
      { status: 500 }
    );
  }
}
