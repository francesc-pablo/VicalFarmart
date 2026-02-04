
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Validate required fields from the client
    const requiredFields = ['tx_ref', 'amount', 'currency', 'redirect_url', 'customer'];
    for (const field of requiredFields) {
        if (!body[field]) {
            return NextResponse.json({ success: false, message: `Missing required field: ${field}` }, { status: 400 });
        }
    }

    const flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!flutterwaveSecretKey) {
        console.error("FLUTTERWAVE_SECRET_KEY is not set in environment variables.");
        return NextResponse.json({ success: false, message: 'Payment provider not configured on server.' }, { status: 500 });
    }

    // 2. Make the secure server-to-server call to Flutterwave
    const flutterwaveResponse = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${flutterwaveSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const flutterwaveData = await flutterwaveResponse.json();

    // 3. Handle Flutterwave's response
    if (flutterwaveData.status !== 'success') {
      console.error("Flutterwave API Error:", flutterwaveData);
      return NextResponse.json({ success: false, message: flutterwaveData.message || 'Failed to generate payment link.' }, { status: 500 });
    }

    const paymentLink = flutterwaveData.data?.link;
    if (!paymentLink) {
        console.error("Flutterwave response did not include a payment link:", flutterwaveData);
        return NextResponse.json({ success: false, message: 'Could not retrieve payment link from provider.' }, { status: 500 });
    }
    
    // 4. Send the payment link back to the client
    return NextResponse.json({ success: true, paymentLink });

  } catch (error) {
    console.error("Error in /api/payments/initiate:", error);
    return NextResponse.json({ success: false, message: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
