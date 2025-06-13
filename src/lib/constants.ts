
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, ShoppingBasket, ClipboardList, Users, Settings, Package, DollarSign, ShieldCheck } from 'lucide-react'; // Removed Tractor

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  items?: NavItem[];
}

// SELLER_DASHBOARD_NAV_ITEMS removed as sellers no longer have a dedicated dashboard

export const ADMIN_DASHBOARD_NAV_ITEMS: NavItem[] = [
  { title: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Manage Users', href: '/admin/dashboard/users', icon: Users }, // Admins manage sellers here
  { title: 'All Orders', href: '/admin/dashboard/orders', icon: Package },
  // Future: Add "Manage Products" for admin to post on behalf of sellers
  // { title: 'Manage Products', href: '/admin/dashboard/products', icon: ShoppingBasket }, 
  { title: 'Platform Settings', href: '/admin/dashboard/settings', icon: Settings, disabled: true },
];

export const PRODUCT_CATEGORIES = [
  "Fruits", "Vegetables", "Grains", "Dairy", "Meat", "Poultry", "Herbs & Spices", "Other"
];

export const PRODUCT_REGIONS = [ // Added product regions
  "North", "South", "East", "West", "Central"
];
