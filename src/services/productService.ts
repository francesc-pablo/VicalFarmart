import { db } from "@/lib/firebase";
import type { Product } from "@/types";
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  limit, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  setDoc 
} from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

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
            where("__name__", "!=", currentProductId),
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

export async function addProduct(productData: Omit<Product, 'id'>): Promise<Product | null> {
  const docRef = doc(collection(db, "products"));
  const productId = docRef.id;
  const finalData = {
    ...productData,
    id: productId,
    createdAt: serverTimestamp(),
  };

  setDoc(docRef, finalData).catch(async (error) => {
    const permissionError = new FirestorePermissionError({
      path: docRef.path,
      operation: 'create',
      requestResourceData: finalData,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });

  return { id: productId, ...productData } as Product;
}

export async function updateProduct(productId: string, productData: Partial<Product>): Promise<void> {
  const productDocRef = doc(db, "products", productId);
  const dataToUpdate = { ...productData };
  delete dataToUpdate.id; 
  
  updateDoc(productDocRef, dataToUpdate).catch(async (error) => {
    const permissionError = new FirestorePermissionError({
      path: productDocRef.path,
      operation: 'update',
      requestResourceData: dataToUpdate,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}

export async function deleteProduct(productId: string): Promise<void> {
  const productDocRef = doc(db, "products", productId);
  deleteDoc(productDocRef).catch(async (error) => {
    const permissionError = new FirestorePermissionError({
      path: productDocRef.path,
      operation: 'delete',
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}
