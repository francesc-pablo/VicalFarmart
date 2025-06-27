
import { db } from "@/lib/firebase";
import type { Product } from "@/types";
import { collection, getDocs, doc, getDoc, query, where, limit } from "firebase/firestore";

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
