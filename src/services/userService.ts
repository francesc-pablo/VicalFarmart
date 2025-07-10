
'use server';

import { db, auth } from "@/lib/firebase";
import type { User } from "@/types";
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { sendWelcomeEmail } from "@/ai/flows/emailFlows";
import { createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";

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
    console.error("Error fetching users with sorting (index might be missing): ", error);
    // Fallback if sorting query fails (e.g., no composite index)
    try {
        console.log("Attempting to fetch users without sorting as a fallback.");
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

// Function to add a new user. This will log the admin out.
export async function addUser(userData: Partial<User>): Promise<User | null> {
    const { email, password, name, role } = userData;
    if (!email || !password || !name || !role) {
        throw new Error("Missing required fields for user creation.");
    }
    
    // Temporarily sign out the admin to avoid auth state conflicts
    const adminUser = auth.currentUser;
    if (adminUser) {
        await signOut(auth);
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: name });
        
        const newUserProfile: Omit<User, 'id' | 'password'> = {
            name: name,
            email: email,
            role: role,
            isActive: true,
            createdAt: serverTimestamp(),
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

        await setDoc(doc(db, "users", user.uid), newUserProfile);
        
        try {
            await sendWelcomeEmail({ name, email });
        } catch (emailError) {
            console.error("Failed to send welcome email, but user was created:", emailError);
        }

        const finalUser = { id: user.uid, ...newUserProfile };
        return finalUser as User;

    } catch (error) {
        console.error("Error creating user:", error);
        // The admin is already logged out, so just re-throw the error
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
    throw error; // Re-throw to be handled by the caller
  }
}
