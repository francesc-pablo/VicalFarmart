import { db } from "@/lib/firebase";
import type { Order, OrderStatus } from "@/types";
import { collection, getDocs, doc, updateDoc, query, orderBy, where, setDoc, serverTimestamp, getDoc, deleteDoc, addDoc } from "firebase/firestore";

const ordersCollectionRef = collection(db, "orders");

// Helper to convert Firestore Timestamps to a plain, serializable format
const convertTimestamp = (data: any) => {
  const convertedData = { ...data };
  for (const key in convertedData) {
    if (convertedData[key]?.toDate) {
      convertedData[key] = convertedData[key].toDate().toISOString();
    }
  }
  return convertedData;
};

/**
 * Creates a new order in Firestore.
 */
export async function createOrder(orderData: Omit<Order, 'id' | 'orderDate'>): Promise<string | null> {
  try {
    const docRef = await addDoc(ordersCollectionRef, {
      ...orderData,
      orderDate: serverTimestamp(),
    });
    
    // Update the document with its own ID for easier reference
    await updateDoc(docRef, { id: docRef.id });

    return docRef.id;
  } catch (error) {
    console.error("Error creating order: ", error);
    return null;
  }
}

/**
 * Deletes an order from Firestore.
 */
export async function deleteOrder(orderId: string): Promise<void> {
  try {
    const orderDocRef = doc(db, "orders", orderId);
    await deleteDoc(orderDocRef);
  } catch (error) {
    console.error("Error deleting order: ", error);
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const orderDocRef = doc(db, "orders", orderId);
    const docSnap = await getDoc(orderDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const convertedData = convertTimestamp(data);
      return { 
          id: docSnap.id, 
          ...convertedData
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
      const convertedData = convertTimestamp(data);
      return {
        id: doc.id,
        ...convertedData,
      } as Order;
    });
    return orders;
  } catch (error) {
    console.error("Error fetching all orders: ", error);
    return [];
  }
}

export async function getOrdersByCustomerId(customerId: string): Promise<Order[]> {
  try {
    const q = query(
      ordersCollectionRef,
      where("customerId", "==", customerId),
      orderBy("orderDate", "desc")
    );
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const convertedData = convertTimestamp(data);
      return {
        id: doc.id,
        ...convertedData,
      } as Order;
    });
    return orders;
  } catch (error) {
    console.error(`Error fetching orders for customer ${customerId}: `, error);
    return [];
  }
}


export async function getOrdersBySellerId(sellerId: string): Promise<Order[]> {
  try {
    const allOrders = await getAllOrders();
    const sellerOrders = allOrders.filter(order => 
      order.items.some(item => item.sellerId === sellerId)
    );
    return sellerOrders;
  } catch (error) {
    console.error(`Error fetching orders for seller ${sellerId}: `, error);
    return [];
  }
}

export async function getOrdersByCourierId(courierId: string): Promise<Order[]> {
  try {
    const q = query(
      ordersCollectionRef,
      where("courierId", "==", courierId)
    );
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const convertedData = convertTimestamp(data);
      return {
        id: doc.id,
        ...convertedData,
      } as Order;
    });

    orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

    return orders;
  } catch (error) {
    console.error(`Error fetching orders for courier ${courierId}: `, error);
    return [];
  }
}

/**
 * Updates an order status and optional payment details.
 */
export async function updateOrderStatus(
    orderId: string, 
    status: OrderStatus, 
    paymentDetails?: Order['paymentDetails']
): Promise<void> {
  try {
    const orderDocRef = doc(db, "orders", orderId);
    const updateData: any = { status };
    if (paymentDetails) {
        updateData.paymentDetails = paymentDetails;
    }
    
    await updateDoc(orderDocRef, updateData);
  } catch (error) {
    console.error("Error updating order status: ", error);
    throw error;
  }
}

/**
 * Assigns a courier to an order.
 */
export async function assignCourierToOrder(orderId: string, courierId: string, courierName: string): Promise<void> {
    try {
        const orderDocRef = doc(db, "orders", orderId);
        await updateDoc(orderDocRef, {
            courierId: courierId,
            courierName: courierName,
        });
    } catch (error) {
        console.error("Error assigning courier to order: ", error);
        throw error;
    }
}
