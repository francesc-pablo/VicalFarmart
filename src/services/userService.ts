
'use server';

import { db, auth } from "@/lib/firebase";
import type { User } from "@/types";
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile, fetchSignInMethodsForEmail, FirebaseError } from "firebase/auth";
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


// Function to add a new user (via client SDK, will log out admin)
export async function addUser(userData: Partial<User>): Promise<User | null> {
    if (!userData.email || !userData.password) {
        throw new Error("Email and password are required for user creation.");
    }

    try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, userData.email);
        if (signInMethods.length > 0) {
            throw new Error("This email is already in use by another account.");
        }

        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: userData.name });

        const newUser: Omit<User, 'id' | 'password'> = {
            name: userData.name || "New User",
            email: user.email!,
            role: userData.role || 'customer',
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

        await setDoc(doc(db, "users", user.uid), newUser);

        await sendWelcomeEmail({ name: newUser.name, email: newUser.email });

        return { id: user.uid, ...newUser };
    } catch (error) {
        const firebaseError = error as FirebaseError;
        console.error("Error adding user:", firebaseError);
        throw new Error(firebaseError.message || "An unexpected error occurred during user creation.");
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
