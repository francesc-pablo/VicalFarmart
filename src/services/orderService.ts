import { db } from "@/lib/firebase";
import type { Order, OrderStatus } from "@/types";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  where, 
  setDoc, 
  serverTimestamp, 
  getDoc, 
  deleteDoc 
} from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

const ordersCollectionRef = collection(db, "orders");

/**
 * Helper to remove undefined properties from an object recursively.
 * Firestore does not support 'undefined' as a field value.
 */
function scrubUndefined(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(scrubUndefined);
  
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, scrubUndefined(v)])
  );
}

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
 * Creates a new order in Firestore using a non-blocking write.
 */
export async function createOrder(orderData: Omit<Order, 'id' | 'orderDate'>): Promise<string | null> {
  const orderRef = doc(collection(db, "orders"));
  const orderId = orderRef.id;

  // Scrub undefined values to prevent Firestore validation errors
  const cleanOrderData = scrubUndefined(orderData);

  const finalData = {
    ...cleanOrderData,
    id: orderId,
    orderDate: serverTimestamp(),
  };

  // Initiate non-blocking write
  setDoc(orderRef, finalData).catch(async (error) => {
    const permissionError = new FirestorePermissionError({
      path: orderRef.path,
      operation: 'create',
      requestResourceData: finalData,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });

  return orderId;
}

export async function deleteOrder(orderId: string): Promise<void> {
  const orderDocRef = doc(db, "orders", orderId);
  deleteDoc(orderDocRef).catch(async (error) => {
    const permissionError = new FirestorePermissionError({
      path: orderDocRef.path,
      operation: 'delete',
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
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

export async function updateOrderStatus(
    orderId: string, 
    status: OrderStatus, 
    paymentDetails?: Order['paymentDetails']
): Promise<void> {
  const orderDocRef = doc(db, "orders", orderId);
  
  // Scrub undefined to prevent SDK crashes
  const updateData: any = scrubUndefined({ 
    status,
    paymentDetails
  });
  
  updateDoc(orderDocRef, updateData).catch(async (error) => {
    const permissionError = new FirestorePermissionError({
      path: orderDocRef.path,
      operation: 'update',
      requestResourceData: updateData,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}

export async function assignCourierToOrder(orderId: string, courierId: string, courierName: string): Promise<void> {
    const orderDocRef = doc(db, "orders", orderId);
    const updateData = {
        courierId: courierId,
        courierName: courierName,
    };
    updateDoc(orderDocRef, updateData).catch(async (error) => {
      const permissionError = new FirestorePermissionError({
        path: orderDocRef.path,
        operation: 'update',
        requestResourceData: updateData,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
}
