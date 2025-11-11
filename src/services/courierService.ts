
import { db } from "@/lib/firebase";
import type { Courier } from "@/types";
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from "firebase/firestore";

const couriersCollectionRef = collection(db, "couriers");

// Helper to upload a file and get URL
async function uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
        throw new Error(result.message || "File upload failed");
    }
    return result.url;
}

export async function getCouriers(): Promise<Courier[]> {
    try {
        const q = query(couriersCollectionRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Courier));
    } catch (error) {
        console.error("Error fetching couriers: ", error);
        return [];
    }
}

export async function getCourierById(id: string): Promise<Courier | null> {
    try {
        const docRef = doc(db, "couriers", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Courier : null;
    } catch (error) {
        console.error("Error fetching courier by ID: ", error);
        return null;
    }
}

export async function addCourier(data: Omit<Courier, 'id'>, files: Record<string, File | null>): Promise<string> {
    try {
        const dataToSave = { ...data };

        for (const key in files) {
            if (files[key]) {
                const url = await uploadFile(files[key] as File);
                (dataToSave as any)[key] = url;
            }
        }

        const docRef = await addDoc(couriersCollectionRef, {
            ...dataToSave,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding courier: ", error);
        throw error;
    }
}


export async function updateCourier(id: string, data: Partial<Omit<Courier, 'id'>>, files: Record<string, File | null>): Promise<void> {
    try {
        const courierDocRef = doc(db, "couriers", id);
        const dataToUpdate: { [key: string]: any } = { ...data };
        delete (dataToUpdate as any).id;

        for (const key in files) {
            if (files[key]) {
                const url = await uploadFile(files[key] as File);
                dataToUpdate[key] = url;
            }
        }
        
        await updateDoc(courierDocRef, dataToUpdate);
    } catch (error) {
        console.error("Error updating courier: ", error);
        throw error;
    }
}


export async function deleteCourier(id: string): Promise<void> {
    try {
        const courierDocRef = doc(db, "couriers", id);
        await deleteDoc(courierDocRef);
    } catch (error) {
        console.error("Error deleting courier: ", error);
        throw error;
    }
}
