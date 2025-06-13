
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  sellerId: string;
  sellerName?: string;
  region?: string; // Added region
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Paid';
export type PaymentMethod = 'Mobile Payment' | 'Pay on Delivery';

export interface Order {
  id: string;
  customerId: string; // Could be more detailed if customer profiles are added
  customerName: string; // Simplified for now
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  orderDate: string; // ISO date string
  sellerId?: string; // If order is specific to one seller's products
}

export type UserRole = 'seller' | 'admin' | 'customer'; // Added customer role

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean; // For admin management
}
