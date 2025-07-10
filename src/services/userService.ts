
import { db, auth } from "@/lib/firebase";
import type { User } from "@/types";
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, serverTimestamp, orderBy } from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { sendWelcomeEmail } from "@/ai/flows/emailFlows";

const usersCollectionRef = collection(db, "users");

// Function to get all users, sorted by most recently created
export async function getUsers(): Promise<User[]> {
  try {
    // Fetch all users without server-side sorting to avoid indexing issues.
    const querySnapshot = await getDocs(usersCollectionRef);
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as User));

    // Sort client-side. Users without a createdAt date will be at the end.
    return users.sort((a, b) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
      
      // If timestamps are the same or one is missing, fall back to sorting by name
      if (timeB - timeA === 0) {
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
      return { id: docSnap.id, ...docSnap.data() } as User;
    } else {
      console.log("No such user found!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user by ID: ", error);
    return null;
  }
}

// Function to add a new user (Auth + Firestore) via secure API route
export async function addUser(userData: Partial<User>): Promise<User | null> {
    if (!userData.email || !userData.password) {
        throw new Error("Email and password are required to create a new user.");
    }
    const currentAdmin = auth.currentUser;
    if (!currentAdmin) {
        throw new Error("Admin not authenticated. Please log in again.");
    }
    
    // Get the ID token of the currently signed-in admin
    const idToken = await currentAdmin.getIdToken();

    try {
        const response = await fetch('/api/admin/create-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify(userData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to create user.');
        }

        // Send welcome email on success
        await sendWelcomeEmail({ name: userData.name || "New User", email: userData.email });

        return result.user;
    } catch (error) {
        console.error("Error adding new user via API:", error);
        throw error; // Re-throw the error to be caught by the form
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
