
import { db } from "@/lib/firebase";
import type { Courier } from "@/types";
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from "firebase/firestore";

const couriersCollectionRef = collection(db, "couriers");

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

export async function addCourier(data: Omit<Courier, 'id' | 'createdAt'>): Promise<string> {
    try {
        const docRef = await addDoc(couriersCollectionRef, {
            ...data,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding courier: ", error);
        throw error;
    }
}


export async function updateCourier(id: string, data: Partial<Omit<Courier, 'id' | 'createdAt'>>): Promise<void> {
    try {
        const courierDocRef = doc(db, "couriers", id);
        await updateDoc(courierDocRef, data);
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

    