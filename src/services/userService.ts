import { db, auth } from "@/lib/firebase";
import type { User } from "@/types";
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  orderBy 
} from "firebase/firestore";
import { sendWelcomeEmail } from "@/ai/flows/emailFlows";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

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
    console.error("Error fetching users with sorting: ", error);
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

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const convertedData = convertTimestamp(data);
      return { id: docSnap.id, ...convertedData } as User;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user by ID: ", error);
    return null;
  }
}

export async function addUser(userData: Partial<User>): Promise<User | null> {
    const { email, password, name, role } = userData;
    if (!email || !password || !name || !role) {
        throw new Error("Missing required fields for user creation.");
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
            businessRegistrationNumber: userData.businessRegistrationNumber || "",
            businessLocation: userData.businessLocation || "",
            tradeLicenseUrl: userData.tradeLicenseUrl || "",
            tinNumber: userData.tinNumber || "",
            nationalIdUrl: userData.nationalIdUrl || "",
            residentialAddress: userData.residentialAddress || "",
            policeClearanceUrl: userData.policeClearanceUrl || "",
            driverLicenseUrl: userData.driverLicenseUrl || "",
            licenseCategory: userData.licenseCategory || "",
            vehicleType: userData.vehicleType || "",
            vehicleRegistrationNumber: userData.vehicleRegistrationNumber || "",
            vehicleInsuranceUrl: userData.vehicleInsuranceUrl || "",
            roadworthinessUrl: userData.roadworthinessUrl || "",
            failedLoginAttempts: 0,
            lockoutUntil: null,
        };

        const userDocRef = doc(db, "users", user.uid);
        setDoc(userDocRef, newUserProfile).catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'create',
            requestResourceData: newUserProfile,
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        });
        
        try {
            await sendWelcomeEmail({ name, email });
        } catch (emailError) {
            console.warn("User created, but welcome email failed:", emailError);
        }

        return { id: user.uid, ...newUserProfile } as User;

    } catch (error) {
        console.error("Error in addUser service:", error);
        throw error;
    }
}


export async function updateUser(userId: string, data: Partial<User>): Promise<void> {
    const userDocRef = doc(db, "users", userId);
    const updateData: { [key: string]: any } = {};

    const userFields: (keyof User)[] = [
        'name', 'role', 'avatarUrl', 'isActive', 'phone', 'address', 'region', 'town',
        'businessName', 'businessOwnerName', 'businessAddress', 'contactNumber', 'businessLocationRegion', 
        'businessLocationTown', 'geoCoordinatesLat', 'geoCoordinatesLng', 'businessType',
        'businessRegistrationNumber', 'businessLocation', 'tradeLicenseUrl', 'tinNumber', 'nationalIdUrl',
        'residentialAddress', 'policeClearanceUrl', 'driverLicenseUrl', 'licenseCategory',
        'vehicleType', 'vehicleRegistrationNumber', 'vehicleInsuranceUrl', 'roadworthinessUrl'
    ];

    for (const key of userFields) {
        if (key in data) {
            updateData[key] = (data as any)[key];
        }
    }
    
    delete updateData.id; 
    delete updateData.password; 
    delete updateData.createdAt;
    delete updateData.email;

    updateDoc(userDocRef, updateData).catch(async (error) => {
      const permissionError = new FirestorePermissionError({
        path: userDocRef.path,
        operation: 'update',
        requestResourceData: updateData,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
}

export async function deleteUser(userId: string): Promise<void> {
  const userDocRef = doc(db, "users", userId);
  deleteDoc(userDocRef).catch(async (error) => {
    const permissionError = new FirestorePermissionError({
      path: userDocRef.path,
      operation: 'delete',
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}
