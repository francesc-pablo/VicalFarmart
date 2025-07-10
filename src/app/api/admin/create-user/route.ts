
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeAdminApp } from '@/lib/firebase-admin';
import type { User } from '@/types';

// Initialize Firebase Admin SDK
initializeAdminApp();

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token.' }, { status: 401 });
    }
    const idToken = authorization.split('Bearer ')[1];

    // Verify the ID token to ensure the request is from an authenticated admin
    const decodedToken = await getAuth().verifyIdToken(idToken);
    if (decodedToken.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

    // Now that we're authenticated as an admin, proceed with user creation
    const userData: Partial<User> = await request.json();

    if (!userData.email || !userData.password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    // 1. Create user in Firebase Authentication using Admin SDK
    const userRecord = await getAuth().createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.name,
      disabled: false,
    });
    
    // Set the user's role as a custom claim
    await getAuth().setCustomUserClaims(userRecord.uid, { role: userData.role || 'customer' });


    // 2. Create user document in Firestore
    const newUser: Omit<User, 'id'> = {
      name: userData.name || "New User",
      email: userRecord.email!,
      phone: userData.phone || "",
      address: userData.address || "",
      region: userData.region || "",
      town: userData.town || "",
      role: userData.role || 'customer',
      isActive: true,
      createdAt: Timestamp.now(),
      businessName: userData.businessName || "",
      businessOwnerName: userData.businessOwnerName || "",
      businessAddress: userData.businessAddress || "",
      contactNumber: userData.contactNumber || "",
      businessLocationRegion: userData.businessLocationRegion || "",
      businessLocationTown: userData.businessLocationTown || "",
      geoCoordinatesLat: userData.geoCoordinatesLat || "",
      geoCoordinatesLng: userData.geoCoordinatesLng || "",
      businessType: userData.businessType || "",
      failedLoginAttempts: 0,
      lockoutUntil: null,
    };
    
    await getFirestore().collection('users').doc(userRecord.uid).set(newUser);
    
    const finalUser = { id: userRecord.uid, ...newUser };

    return NextResponse.json({ message: 'User created successfully', user: finalUser }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating user with Admin SDK:', error);
    if (error.code === 'auth/email-already-exists') {
        return NextResponse.json({ error: 'This email is already in use by another account.' }, { status: 409 });
    }
    if (error.code === 'auth/id-token-expired') {
        return NextResponse.json({ error: 'Your session has expired. Please log in again.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
