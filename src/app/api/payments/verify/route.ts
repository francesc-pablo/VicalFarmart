import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, collection, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * ATOMIC VERIFICATION: 
 * Securely verifies a transaction with Flutterwave AND saves the order to Firestore.
 * This is the "Reliable Fix" to prevent data loss on mobile redirects.
 */
export async function POST(request: Request) {
  try {
    const { transaction_id, orderData } = await request.json();

    if (!transaction_id || transaction_id === 'N/A') {
      return NextResponse.json({ success: false, message: 'Invalid transaction ID.' }, { status: 400 });
    }

    const flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!flutterwaveSecretKey) {
      return NextResponse.json({ success: false, message: 'Server config error.' }, { status: 500 });
    }

    // 1. Verify transaction with Flutterwave
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${flutterwaveSecretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const verifyData = await response.json();

    if (verifyData.status === 'success' && verifyData.data?.status === 'successful') {
      // 2. ATOMIC WRITE: If payment is good, save the order record immediately on the server
      if (orderData) {
        const orderRef = doc(collection(db, "orders"));
        const finalOrder = {
          ...orderData,
          id: orderRef.id,
          orderDate: serverTimestamp(), // Ensure server-side timestamp
          status: 'Paid',
          paymentDetails: {
            transactionId: transaction_id,
            status: 'successful',
            gateway: 'Flutterwave (Verified)',
          }
        };

        // Standard Firestore Client SDK works in Next.js Server Routes
        await setDoc(orderRef, finalOrder);

        return NextResponse.json({ 
          success: true, 
          orderId: orderRef.id,
          data: verifyData.data 
        });
      }

      return NextResponse.json({ 
        success: true, 
        data: verifyData.data 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: verifyData.message || 'Transaction verification failed.' 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Error in /api/payments/verify:", error);
    return NextResponse.json({ success: false, message: error.message || 'Verification error.' }, { status: 500 });
  }
}