
'use server';

import { db, auth } from "@/lib/firebase";
import type { User } from "@/types";
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { sendWelcomeEmail } from "@/ai/flows/emailFlows";

// Helper to convert Firestore Timestamps to a plain, serializable format
const convertTimestamp = (data: any) => {
  if (!data) return data;
  const convertedData = { ...data };
  for (const key in convertedData) {
    if (convertedData[key] && typeof convertedData[key].toDate === 'function') {
      convertedData[key] = convertedData[key].toDate().toISOString();
    }
  }
  return convertedData;
};


// Function to get all users, sorted by most recently created
export async function getUsers(): Promise<User[]> {
  try {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const convertedData = convertTimestamp(data);
      return {
        id: doc.id,
        ...convertedData,
      } as User;
    });
    return users;
  } catch (error) {
    console.error("Error fetching users: ", error);
    // Fallback if sorting query fails (e.g., no composite index)
    try {
        const fallbackSnapshot = await getDocs(collection(db, "users"));
        const fallbackUsers = fallbackSnapshot.docs.map((doc) => {
            const data = doc.data();
            const convertedData = convertTimestamp(data);
            return { id: doc.id, ...convertedData } as User;
        });
        return fallbackUsers;
    } catch (fallbackError) {
        console.error("Error fetching users with fallback: ", fallbackError);
        return [];
    }
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

// Function to add a new user by calling the secure API route
export async function addUser(userData: Partial<User>, adminToken?: string): Promise<User | null> {
    if (!adminToken) {
        throw new Error("Admin authentication token is required.");
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/create-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userData, adminToken }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to create user via API.');
        }

        return result.user as User;

    } catch (error) {
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
// Note: This does not delete the user from Firebase Auth.
// A Cloud Function would be required for that.
export async function deleteUser(userId: string): Promise<void> {
    try {
        const userDocRef = doc(db, "users", userId);
        await deleteDoc(userDocRef);
    } catch (error) {
        console.error("Error deleting user document: ", error);
    }
}
