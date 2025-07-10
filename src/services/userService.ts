
'use server';

import { db, auth } from "@/lib/firebase";
import type { User } from "@/types";
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { sendWelcomeEmail } from "@/ai/flows/emailFlows";

// Helper to convert Firestore Timestamps to ISO strings
const convertTimestamp = (data: any) => {
  const convertedData = { ...data };
  if (convertedData.createdAt?.toDate) {
    convertedData.createdAt = convertedData.createdAt.toDate().toISOString();
  }
  if (convertedData.lockoutUntil?.toDate) {
    convertedData.lockoutUntil = convertedData.lockoutUntil.toDate().getTime();
  } else if (convertedData.lockoutUntil instanceof Date) {
    convertedData.lockoutUntil = convertedData.lockoutUntil.getTime();
  }
  return convertedData;
};

// Function to get all users, sorted by most recently created
export async function getUsers(): Promise<User[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const convertedData = convertTimestamp(data);
      return {
        id: doc.id,
        ...convertedData,
      } as User;
    });

    // Sort client-side. Users without a createdAt date will be at the end.
    return users.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      
      if (timeB === timeA) {
        return (a.name || "").localeCompare(b.name || "");
      }
      return timeB - timeA; // Sort descending (newest first)
    });
  } catch (error) {
    console.error("Error fetching users: ", error);
    return [];
  }
}

// Function to get a single user by ID
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const convertedData = convertTimestamp(data);
      return { id: docSnap.id, ...convertedData } as User;
    } else {
      console.log("No such user found!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user by ID: ", error);
    return null;
  }
}


// Function to add a new user (via API)
export async function addUser(userData: Partial<User> & { password?: string; idToken?: string }): Promise<User | null> {
  if (!userData.idToken) {
     throw new Error("Admin user is not authenticated.");
  }

  const { idToken, ...userPayload } = userData;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/create-user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(userPayload)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Failed to create user via API.');
    }

    // Send welcome email after successful creation
    await sendWelcomeEmail({ name: userData.name!, email: userData.email! });

    return result.user as User;

  } catch (error: any) {
    console.error("Error adding user via API:", error);
    throw error;
  }
}


// Function to update a user's details
export async function updateUser(userId: string, data: Partial<User>): Promise<void> {
    try {
        const userDocRef = doc(db, "users", userId);
        const updateData = { ...data };
        delete updateData.password;
        delete updateData.id; 
        
        await updateDoc(userDocRef, updateData);
    } catch (error) {
        console.error("Error updating user: ", error);
    }
}

// Function to delete a user's Firestore document
export async function deleteUser(userId: string): Promise<void> {
    try {
        const userDocRef = doc(db, "users", userId);
        await deleteDoc(userDocRef);
    } catch (error) {
        console.error("Error deleting user document: ", error);
    }
}
