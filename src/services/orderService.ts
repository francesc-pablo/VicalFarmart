
import { db } from "@/lib/firebase";
import type { Order, OrderStatus } from "@/types";
import { collection, getDocs, doc, updateDoc, query, orderBy, where } from "firebase/firestore";

const ordersCollectionRef = collection(db, "orders");

export async function getAllOrders(): Promise<Order[]> {
  try {
    const q = query(ordersCollectionRef, orderBy("orderDate", "desc"));
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Order));
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
    const orders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Order));
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
