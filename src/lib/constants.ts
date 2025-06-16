
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
  "Ahafo": ["Goaso", "Bechem", "Duayaw Nkwanta", "Hwidiem", "Kenyasi", "Mim", "Sankore", "Kukuom", "Acherensua", "Techimantia"],
  "Ashanti": ["Kumasi", "Obuasi", "Ejisu", "Mampong", "Konongo", "Bekwai", "Offinso", "Agogo", "Tafo", "Asokore Mampong", "Effiduase", "Tepa", "New Edubiase", "Juaso"],
  "Bono": ["Sunyani", "Berekum", "Dormaa Ahenkro", "Wenchi", "Jaman South (Drobo)", "Sampa", "Seikwa", "Nsoatre", "Odumase", "Fiapre"],
  "Bono East": ["Techiman", "Kintampo", "Nkoranza", "Atebubu", "Yeji", "Prang", "Busunya", "Amantin", "Ejura", "Kwame Danso"],
  "Central": ["Cape Coast", "Kasoa", "Winneba", "Mankessim", "Elmina", "Swedru", "Assin Fosu", "Saltpond", "Apam", "Twifo Praso", "Dunkwa-on-Offin"],
  "Eastern": ["Koforidua", "Nkawkaw", "Akropong", "Suhum", "Oda", "Nsawam", "Aburi", "Somanya", "Begoro", "New Abirem", "Asamankese", "Akosombo"],
  "Greater Accra": ["Accra", "Tema", "Madina", "Ashaiman", "Dome", "Lashibi", "Teshie", "Nungua", "Adenta", "Dansoman", "Kaneshie", "Ga East", "Weija Gbawe"],
  "North East": ["Nalerigu", "Walewale", "Gambaga", "Bunkpurugu", "Chereponi", "Yagaba", "Wulugu", "Kpasenkpe", "Sakogu", "Langbinsi"],
  "Northern": ["Tamale", "Yendi", "Savelugu", "Bimbilla", "Tolon", "Kumbungu", "Karaga", "Wulensi", "Nanton", "Gushegu", "Sang"],
  "Oti": ["Dambai", "Kadjebi", "Jasikan", "Nkwanta", "Worawora", "Kete Krachi", "Chinderi", "Krachi Nchumuru", "Likpe-Mate", "Kpassa"],
  "Savannah": ["Damongo", "Bole", "Salaga", "Sawla", "Daboya", "Buipe", "Yapei", "Kpalbe", "Mpaha", "Tinga"],
  "Upper East": ["Bolgatanga", "Bawku", "Navrongo", "Paga", "Zebilla", "Sandema", "Binduri", "Garu", "Tempane", "Bongo"],
  "Upper West": ["Wa", "Tumu", "Lawra", "Jirapa", "Nandom", "Gwollu", "Funsi", "Wechiau", "Issa", "Kaleo"],
  "Volta": ["Ho", "Keta", "Hohoe", "Anloga", "Aflao", "Kpandu", "Sogakope", "Peki", "Dzodze", "Adidome", "Akatsi", "Kpando"],
  "Western": ["Sekondi-Takoradi", "Tarkwa", "Axim", "Elubo", "Prestea", "Shama", "Mpohor", "Agona Nkwanta", "Dixcove", "Bogoso"],
  "Western North": ["Sefwi Wiawso", "Bibiani", "Juaboso", "Enchi", "Asankragua", "Sefwi Bekwai", "Dadieso", "Akotombra", "Bodi", "Debiso"],
};

