
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
  region?: string;
  town?: string; // Added town
  currency?: string;
  createdAt?: any;
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
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  orderDate: string;
  sellerId?: string;
}

export type UserRole = 'seller' | 'admin' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt?: any;
  phone?: string;
  address?: string;
  region?: string;
  town?: string;

  // Seller-specific fields
  businessName?: string;
  businessOwnerName?: string;
  businessAddress?: string;
  contactNumber?: string;
  businessLocationRegion?: string;
  businessLocationTown?: string;
  geoCoordinatesLat?: string;
  geoCoordinatesLng?: string;
  businessType?: string;

  // For login attempts
  failedLoginAttempts?: number;
  lockoutUntil?: number | null; // Store as UTC milliseconds
}
