
'use server';

import { db, auth } from "@/lib/firebase";
import type { User } from "@/types";
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, serverTimestamp, orderBy, writeBatch } from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { sendWelcomeEmail } from "@/ai/flows/emailFlows";

const usersCollectionRef = collection(db, "users");

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
    const querySnapshot = await getDocs(usersCollectionRef);
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

// Function to add a new user (Auth + Firestore)
export async function addUser(userData: Partial<User> & { adminPassword?: string }): Promise<User | null> {
  const admin = auth.currentUser;
  if (!admin || !admin.email) {
    // This check runs on the server, where auth.currentUser might be null.
    // The real check is the re-authentication with the provided password.
    console.warn("auth.currentUser is not available in this server context. Proceeding with re-authentication.");
  }
  
  if (!userData.email || !userData.password) {
      throw new Error("Email and password are required to create a new user.");
  }
  
  const adminEmail = admin?.email; // Store admin email before it's gone
  const adminPassword = userData.adminPassword;

  if (!adminEmail || !adminPassword) {
      throw new Error("Admin credentials are required to perform this action.");
  }

  // This property is not part of the User type and should be removed before database insertion
  delete userData.adminPassword;

  try {
    // 1. Create the new user. This will log the admin out and log the new user in.
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const user = userCredential.user;

    // 2. Set up the new user's profile and database entry.
    await updateProfile(user, { displayName: userData.name });

    const newUser: Omit<User, 'id'> = {
        name: userData.name || "New User",
        email: user.email!,
        phone: userData.phone || "",
        address: userData.address || "",
        region: userData.region || "",
        town: userData.town || "",
        role: userData.role || 'customer',
        isActive: true,
        createdAt: serverTimestamp(),
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
    
    // 3. Re-authenticate the admin to keep them logged in.
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

    return { id: user.uid, ...newUser };

  } catch (error: any) {
    // If something went wrong, try to log the admin back in as a fallback.
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword).catch(reauthError => {
      console.error("Failed to re-authenticate admin after error:", reauthError);
    });

    console.error("Error adding new user:", error);
    if (error.code === 'auth/wrong-password') {
       throw new Error("Admin password was incorrect. User not created.");
    }
    throw error; // Re-throw the original error to be caught by the form
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

    