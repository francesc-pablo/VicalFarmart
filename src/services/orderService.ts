
import { db } from "@/lib/firebase";
import type { Order, OrderStatus } from "@/types";
import { collection, getDocs, doc, updateDoc, query, orderBy, where, addDoc, serverTimestamp, getDoc } from "firebase/firestore";

const ordersCollectionRef = collection(db, "orders");

export async function createOrder(orderData: Omit<Order, 'id' | 'orderDate'>): Promise<string | null> {
  try {
    const docRef = await addDoc(ordersCollectionRef, {
      ...orderData,
      orderDate: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating order: ", error);
    return null;
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const orderDocRef = doc(db, "orders", orderId);
    const docSnap = await getDoc(orderDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
          id: docSnap.id, 
          ...data,
          orderDate: data.orderDate?.toDate ? data.orderDate.toDate().toISOString() : new Date().toISOString(),
      } as Order;
    }
    return null;
  } catch (error) {
    console.error("Error fetching order by ID: ", error);
    return null;
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const q = query(ordersCollectionRef, orderBy("orderDate", "desc"));
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        orderDate: data.orderDate?.toDate ? data.orderDate.toDate().toISOString() : new Date().toISOString(),
      } as Order;
    });
    return orders;
  } catch (error) {
    console.error("Error fetching all orders: ", error);
    return [];
  }
}

export async function getOrdersBySellerId(sellerId: string): Promise<Order[]> {
  try {
    const q = query(
      ordersCollectionRef, 
      where("sellerId", "==", sellerId), 
      orderBy("orderDate", "desc")
    );
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        orderDate: data.orderDate?.toDate ? data.orderDate.toDate().toISOString() : new Date().toISOString(),
      } as Order;
    });
    return orders;
  } catch (error) {
    console.error(`Error fetching orders for seller ${sellerId}: `, error);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  try {
    const orderDocRef = doc(db, "orders", orderId);
    await updateDoc(orderDocRef, { status });
  } catch (error) {
    console.error("Error updating order status: ", error);
    throw error; // Re-throw to be caught in the component
  }
}
