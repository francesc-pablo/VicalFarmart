import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ success: false, message: 'No authorization token provided.' }, { status: 401 });
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    return NextResponse.json({ success: false, message: 'Malformed authorization token.' }, { status: 401 });
  }

  const { userIdToDelete } = await request.json();
  if (!userIdToDelete) {
    return NextResponse.json({ success: false, message: 'User ID to delete is required.' }, { status: 400 });
  }

  try {
    // 1. Verify the ID token of the user making the request (the admin)
    const decodedToken = await adminAuth.verifyIdToken(token);
    const adminUid = decodedToken.uid;

    // 2. Check if the user making the request is an admin in Firestore
    const adminUserDoc = await adminDb.collection('users').doc(adminUid).get();
    if (!adminUserDoc.exists || adminUserDoc.data()?.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden: Caller is not an admin.' }, { status: 403 });
    }
    
    // 3. Prevent admin from deleting themselves
    if (adminUid === userIdToDelete) {
      return NextResponse.json({ success: false, message: 'Admins cannot delete their own accounts.' }, { status: 400 });
    }

    // 4. The caller is a valid admin, proceed with deletion
    // Delete from Firebase Auth first
    await adminAuth.deleteUser(userIdToDelete);
    
    // Then delete from Firestore
    await adminDb.collection('users').doc(userIdToDelete).delete();
    
    return NextResponse.json({ success: true, message: 'User deleted successfully from Authentication and Firestore.' });

  } catch (error: any) {
    console.error('Error deleting user:', error);
    let message = 'An internal server error occurred.';
    let status = 500;
    
    if (error.code === 'auth/id-token-expired') {
        message = 'Authentication token expired, please log in again.';
        status = 401;
    } else if (error.code === 'auth/user-not-found') {
        message = 'User to delete not found in Authentication. Deleting from Firestore only.';
        // If auth user doesn't exist, still try to delete from Firestore
        try {
            await adminDb.collection('users').doc(userIdToDelete).delete();
            return NextResponse.json({ success: true, message });
        } catch (dbError) {
             console.error('Error deleting user from Firestore after Auth check failed:', dbError);
             return NextResponse.json({ success: false, message: 'User not in Auth, and also failed to delete from Firestore.' }, { status: 500 });
        }
    }

    return NextResponse.json({ success: false, message }, { status });
  }
}
