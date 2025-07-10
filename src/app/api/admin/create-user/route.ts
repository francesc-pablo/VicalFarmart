
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import type { User } from '@/types';
import { initAdminApp } from '@/lib/firebase-admin';
import { sendWelcomeEmail } from '@/ai/flows/emailFlows';

// Initialize Firebase Admin SDK
initAdminApp();

export async function POST(request: Request) {
  try {
    const { userData, adminToken } = await request.json();

    if (!adminToken) {
      return NextResponse.json({ success: false, message: 'Authentication token is missing.' }, { status: 401 });
    }

    // Verify the admin token
    const decodedToken = await getAuth().verifyIdToken(adminToken);
    const adminUserRecord = await getAuth().getUser(decodedToken.uid);
    
    // Check if the authenticated user is an admin
    if (adminUserRecord.customClaims?.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized: User is not an admin.' }, { status: 403 });
    }

    // Now, create the new user
    const { email, password, name, role } = userData;

    if (!email || !password || !name || !role) {
        return NextResponse.json({ success: false, message: 'Missing required user data.' }, { status: 400 });
    }

    const newUserRecord = await getAuth().createUser({
      email,
      password,
      displayName: name,
    });
    
    // Set custom claims for the new user (e.g., their role)
    await getAuth().setCustomUserClaims(newUserRecord.uid, { role });
    
    // Create the user profile in Firestore
    const db = getFirestore();
    const newUserProfile: Omit<User, 'id' | 'password'> = {
      name: name,
      email: email,
      role: role,
      isActive: true,
      createdAt: new Date(),
      phone: userData.phone || "",
      address: userData.address || "",
      region: userData.region || "",
      town: userData.town || "",
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

    await db.collection('users').doc(newUserRecord.uid).set(newUserProfile);

    // Send a welcome email
    try {
        await sendWelcomeEmail({ name: newUserProfile.name, email: newUserProfile.email });
    } catch (emailError) {
        console.error("Failed to send welcome email, but user was created:", emailError);
    }
    
    const finalUser = { id: newUserRecord.uid, ...newUserProfile };

    return NextResponse.json({ success: true, user: finalUser });

  } catch (error: any) {
    console.error('Error creating user (API):', error);
    let message = 'An unknown error occurred.';
    if (error.code === 'auth/email-already-exists') {
        message = 'This email address is already in use.';
    } else if (error.code === 'auth/id-token-expired') {
        message = 'Admin session expired. Please sign in again.';
    } else if (error.code === 'auth/id-token-revoked') {
        message = 'Admin session has been revoked.';
    }
    
    return NextResponse.json({ success: false, message: message }, { status: 500 });
  }
}
