
import { db } from "@/lib/firebase";
import type { Order, OrderStatus } from "@/types";
import { collection, getDocs, doc, updateDoc, query, orderBy, where, setDoc, serverTimestamp, getDoc, deleteDoc } from "firebase/firestore";

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
 * Follows non-blocking pattern: returns the ID immediately and queues the write.
 */
export async function createOrder(orderData: Omit<Order, 'id' | 'orderDate'>): Promise<string | null> {
  try {
    const docRef = doc(ordersCollectionRef);
    const id = docRef.id;
    
    // NO await here to leverage optimistic concurrency and offline sync
    setDoc(docRef, {
      ...orderData,
      id,
      orderDate: serverTimestamp(),
    }).catch(error => {
      console.error("Firestore createOrder background error: ", error);
    });

    return id;
  } catch (error) {
    console.error("Error initiating order creation: ", error);
    return null;
  }
}

/**
 * Deletes an order from Firestore.
 * Used for cleaning up stale records if a checkout is cancelled.
 */
export async function deleteOrder(orderId: string): Promise<void> {
  try {
    const orderDocRef = doc(db, "orders", orderId);
    // NO await here
    deleteDoc(orderDocRef).catch(error => {
      console.error("Firestore deleteOrder background error: ", error);
    });
  } catch (error) {
    console.error("Error initiating order deletion: ", error);
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
 * Follows non-blocking pattern.
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
    
    // NO await here
    updateDoc(orderDocRef, updateData).catch(error => {
        console.error("Firestore updateOrderStatus background error: ", error);
    });
  } catch (error) {
    console.error("Error initiating order status update: ", error);
    throw error;
  }
}

/**
 * Assigns a courier to an order.
 * Follows non-blocking pattern.
 */
export async function assignCourierToOrder(orderId: string, courierId: string, courierName: string): Promise<void> {
    try {
        const orderDocRef = doc(db, "orders", orderId);
        // NO await here
        updateDoc(orderDocRef, {
            courierId: courierId,
            courierName: courierName,
        }).catch(error => {
            console.error("Firestore assignCourierToOrder background error: ", error);
        });
    } catch (error) {
        console.error("Error initiating courier assignment: ", error);
        throw error;
    }
}
