
import { db, auth } from "@/lib/firebase";
import type { User } from "@/types";
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, serverTimestamp, orderBy } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

const usersCollectionRef = collection(db, "users");

// Function to get all users, sorted by most recently created
export async function getUsers(): Promise<User[]> {
  try {
    const q = query(usersCollectionRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as User));
    return users;
  } catch (error) {
    const anyError = error as any;
    // Fallback for when createdAt field doesn't exist on all documents yet, which throws a specific error
    if (anyError.code === "failed-precondition") {
      console.log("Fallback: fetching users without sorting due to missing 'createdAt' field on some documents.");
      const fallbackSnapshot = await getDocs(usersCollectionRef);
      const users = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      return users.sort((a, b) => a.name.localeCompare(b.name));
    }
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

// Function to add a new user (Auth + Firestore)
export async function addUser(userData: Partial<User>): Promise<User | null> {
  if (!userData.email || !userData.password) {
    throw new Error("Email and password are required to create a new user.");
  }
  try {
    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const user = userCredential.user;

    // 2. Create user document in Firestore
    const newUser: Omit<User, 'id'> = {
      name: userData.name || "New User",
      email: user.email!,
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
    return { id: user.uid, ...newUser } as User;

  } catch (error) {
    console.error("Error adding new user:", error);
    return null;
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

// Function to delete a user from Firestore
// Note: This only deletes the Firestore record. A production app would need a Cloud Function to delete the Auth user too.
export async function deleteUser(userId: string): Promise<void> {
  try {
    const userDocRef = doc(db, "users", userId);
    await deleteDoc(userDocRef);
  } catch (error) {
    console.error("Error deleting user: ", error);
  }
}
