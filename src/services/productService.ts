
import { db } from "@/lib/firebase";
import type { Product } from "@/types";
import { collection, getDocs, doc, getDoc, query, where, limit, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

const productsCollectionRef = collection(db, "products");

export async function getProducts(): Promise<Product[]> {
  try {
    const querySnapshot = await getDocs(productsCollectionRef);
    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Product));
    return products;
  } catch (error) {
    console.error("Error fetching products: ", error);
    return [];
  }
}

export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    } else {
      console.log("No such product found!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching product by ID: ", error);
    return null;
  }
}

export async function getProductsBySellerId(sellerId: string): Promise<Product[]> {
  try {
    const q = query(productsCollectionRef, where("sellerId", "==", sellerId));
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Product));
    return products;
  } catch (error) {
    console.error(`Error fetching products for seller ${sellerId}: `, error);
    return [];
  }
}

export async function getFeaturedProducts(count: number = 4): Promise<Product[]> {
    try {
        // This is a simple implementation. For a real app, you might query
        // for products with a specific "featured" flag.
        const q = query(productsCollectionRef, limit(count));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        } as Product));
        return products;
    } catch (error) {
        console.error("Error fetching featured products: ", error);
        return [];
    }
}

export async function getRelatedProducts(category: string, currentProductId: string, count: number = 3): Promise<Product[]> {
    try {
        const q = query(
            productsCollectionRef,
            where("category", "==", category),
            where("__name__", "!=", currentProductId), // Exclude the current product
            limit(count)
        );
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        } as Product));
        return products;
    } catch (error) {
        console.error("Error fetching related products: ", error);
        return [];
    }
}

// Admin functions
export async function addProduct(productData: Omit<Product, 'id'>): Promise<Product | null> {
  try {
    const docRef = await addDoc(productsCollectionRef, {
      ...productData,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...productData };
  } catch (error) {
    console.error("Error adding product: ", error);
    return null;
  }
}

export async function updateProduct(productId: string, productData: Partial<Product>): Promise<void> {
  try {
    const productDocRef = doc(db, "products", productId);
    const dataToUpdate = { ...productData };
    delete dataToUpdate.id; // Don't try to update the ID
    await updateDoc(productDocRef, dataToUpdate);
  } catch (error) {
    console.error("Error updating product: ", error);
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  try {
    const productDocRef = doc(db, "products", productId);
    await deleteDoc(productDocRef);
  } catch (error) {
    console.error("Error deleting product: ", error);
  }
}
