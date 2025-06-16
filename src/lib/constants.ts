
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, ShoppingBasket, ClipboardList, Users, Settings, Package, DollarSign, ShieldCheck } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  items?: NavItem[];
}

export const ADMIN_DASHBOARD_NAV_ITEMS: NavItem[] = [
  { title: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Manage Users', href: '/admin/dashboard/users', icon: Users },
  { title: 'Manage Products', href: '/admin/dashboard/products', icon: ShoppingBasket },
  { title: 'All Orders', href: '/admin/dashboard/orders', icon: Package },
  { title: 'Platform Settings', href: '/admin/dashboard/settings', icon: Settings, disabled: true },
];

export const PRODUCT_CATEGORIES = [
  "Fruits", "Vegetables", "Grains", "Dairy", "Meat", "Poultry", "Herbs & Spices", "Meat & Fish", "Groceries & Provisions", "Other"
];

export const PRODUCT_REGIONS = [
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North"
];

export const GHANA_REGIONS_AND_TOWNS: Record<string, string[]> = {
  "Ahafo": ["Goaso", "Bechem", "Duayaw Nkwanta", "Hwidiem", "Kenyasi"],
  "Ashanti": ["Kumasi", "Obuasi", "Ejisu", "Mampong", "Konongo"],
  "Bono": ["Sunyani", "Berekum", "Dormaa Ahenkro", "Wenchi", "Jaman South"],
  "Bono East": ["Techiman", "Kintampo", "Nkoranza", "Atebubu", "Yeji"],
  "Central": ["Cape Coast", "Kasoa", "Winneba", "Mankessim", "Elmina"],
  "Eastern": ["Koforidua", "Nkawkaw", "Akropong", "Suhum", "Oda"],
  "Greater Accra": ["Accra", "Tema", "Madina", "Ashaiman", "Dome"],
  "North East": ["Nalerigu", "Walewale", "Gambaga", "Bunkpurugu", "Chereponi"],
  "Northern": ["Tamale", "Yendi", "Savelugu", "Damongo", "Bimbilla"], // Damongo is now Savannah capital
  "Oti": ["Dambai", "Kadjebi", "Jasikan", "Nkwanta", "Worawora"],
  "Savannah": ["Damongo", "Bole", "Salaga", "Sawla", "Daboya"], // Corrected capital for Savannah
  "Upper East": ["Bolgatanga", "Bawku", "Navrongo", "Paga", "Zebilla"],
  "Upper West": ["Wa", "Tumu", "Lawra", "Jirapa", "Nandom"],
  "Volta": ["Ho", "Keta", "Hohoe", "Anloga", "Aflao"],
  "Western": ["Sekondi-Takoradi", "Tarkwa", "Axim", "Elubo", "Prestea"],
  "Western North": ["Sefwi Wiawso", "Bibiani", "Juaboso", "Enchi", "Asankragua"],
};
