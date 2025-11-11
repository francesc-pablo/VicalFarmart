
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
  imageUrl?: string;
  sellerName?: string;
  sellerId?: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Paid';
export type PaymentMethod = 'Online Payment' | 'Pay on Delivery';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: {
    address: string;
    city: string;
    zipCode: string;
    idCardNumber?: string;
  };
  orderDate: string;
  sellerId?: string;
  sellerName?: string; // Add sellerName to the order itself
  paymentDetails?: {
    transactionId?: string | number;
    status?: string;
    gateway?: string;
  };
}

export type UserRole = 'seller' | 'admin' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // Only used for creation/update, not stored
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

export interface Courier {
    id: string;
    createdAt?: any;
    // Company Info
    businessName: string;
    businessType: 'sole proprietorship' | 'partnership' | 'LLC' | 'corporation';
    businessRegistrationNumber?: string;
    businessLocation: string;
    tradeLicenseUrl?: string;
    tinNumber?: string;
    // Personal Info
    contactName: string;
    nationalIdUrl?: string;
    phone: string;
    email: string;
    residentialAddress: string;
    policeClearanceUrl?: string;
    driverLicenseUrl?: string;
    licenseCategory: string;
    // Vehicle Info
    vehicleType: string;
    vehicleRegistrationNumber: string;
    vehicleInsuranceUrl: string;
    roadworthinessUrl: string;
}
