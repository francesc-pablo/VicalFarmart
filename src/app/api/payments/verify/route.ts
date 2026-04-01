import { NextResponse } from 'next/server';

/**
 * Securely verifies a transaction with Flutterwave on the backend.
 * Uses the secret key to ensure the transaction is legitimate and successful.
 */
export async function POST(request: Request) {
  try {
    const { transaction_id } = await request.json();

    if (!transaction_id || transaction_id === 'N/A') {
      return NextResponse.json({ success: false, message: 'Invalid transaction ID provided.' }, { status: 400 });
    }

    const flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!flutterwaveSecretKey) {
      console.error("FLUTTERWAVE_SECRET_KEY is not set.");
      return NextResponse.json({ success: false, message: 'Server configuration error.' }, { status: 500 });
    }

    // Verify transaction with Flutterwave
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${flutterwaveSecretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const verifyData = await response.json();

    if (verifyData.status === 'success' && verifyData.data?.status === 'successful') {
      // Transaction is legitimately successful
      return NextResponse.json({ 
        success: true, 
        data: verifyData.data 
      });
    } else {
      console.warn("Transaction verification failed:", verifyData);
      return NextResponse.json({ 
        success: false, 
        message: verifyData.message || 'Transaction could not be verified.' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error("Error in /api/payments/verify:", error);
    return NextResponse.json({ success: false, message: 'Unexpected verification error.' }, { status: 500 });
  }
}
