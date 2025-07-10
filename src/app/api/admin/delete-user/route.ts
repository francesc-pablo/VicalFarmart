
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    if (!adminAuth || !adminDb) {
        return new NextResponse(
            JSON.stringify({ success: false, message: "Firebase Admin SDK not initialized." }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
    
    try {
        const { userId, adminToken } = await request.json();

        if (!userId || !adminToken) {
            return new NextResponse(
                JSON.stringify({ success: false, message: "Missing userId or adminToken." }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Verify the admin's token
        const decodedToken = await adminAuth.verifyIdToken(adminToken);
        
        // Optional: Check if the user is an admin
        const adminUserRecord = await adminAuth.getUser(decodedToken.uid);
        if (adminUserRecord.customClaims?.role !== 'admin') {
             return new NextResponse(
                JSON.stringify({ success: false, message: "Unauthorized: Not an admin." }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Proceed with deletion
        await adminAuth.deleteUser(userId);
        await adminDb.collection('users').doc(userId).delete();

        return new NextResponse(
            JSON.stringify({ success: true, message: "User deleted successfully from Auth and Firestore." }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error("Error deleting user:", error);
        let message = "An internal server error occurred.";
        let status = 500;

        if (error.code === 'auth/id-token-expired') {
            message = "Admin session expired. Please log in again.";
            status = 401;
        } else if (error.code === 'auth/user-not-found') {
            message = "User to be deleted not found.";
            status = 404;
        }

        return new NextResponse(
            JSON.stringify({ success: false, message, error: error.message }),
            { status, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
