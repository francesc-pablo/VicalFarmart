import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, ShoppingBasket, ClipboardList, Users, Settings, Package, DollarSign, Tractor, ShieldCheck } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  items?: NavItem[];
}

export const SELLER_DASHBOARD_NAV_ITEMS: NavItem[] = [
  { title: 'Overview', href: '/seller/dashboard', icon: LayoutDashboard },
  { title: 'Products', href: '/seller/dashboard/products', icon: ShoppingBasket },
  { title: 'Orders', href: '/seller/dashboard/orders', icon: ClipboardList },
  { title: 'Payments', href: '/seller/dashboard/payments', icon: DollarSign },
  { title: 'Settings', href: '/seller/dashboard/settings', icon: Settings, disabled: true },
];

export const ADMIN_DASHBOARD_NAV_ITEMS: NavItem[] = [
  { title: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Manage Users', href: '/admin/dashboard/users', icon: Users },
  { title: 'All Orders', href: '/admin/dashboard/orders', icon: Package },
  { title: 'Platform Settings', href: '/admin/dashboard/settings', icon: Settings, disabled: true },
];

export const PRODUCT_CATEGORIES = [
  "Fruits", "Vegetables", "Grains", "Dairy", "Meat", "Poultry", "Herbs & Spices", "Other"
];
