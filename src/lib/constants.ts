

import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, ShoppingBasket, ClipboardList, Users, Settings, Package, DollarSign, ShieldCheck, UserCog, Shell, Truck, Briefcase } from 'lucide-react';

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
  { title: 'Profile', href: '/admin/dashboard/profile', icon: UserCog },
  { title: 'Platform Settings', href: '/admin/dashboard/settings', icon: Settings, disabled: true },
];

export const SUPERVISOR_DASHBOARD_NAV_ITEMS: NavItem[] = [
  { title: 'Overview', href: '/supervisor/dashboard', icon: LayoutDashboard },
  { title: 'Manage Users', href: '/supervisor/dashboard/users', icon: Users },
  { title: 'All Orders', href: '/supervisor/dashboard/orders', icon: Package },
  { title: 'Profile', href: '/supervisor/dashboard/profile', icon: UserCog },
];

export const SELLER_DASHBOARD_NAV_ITEMS: NavItem[] = [
  { title: 'Overview', href: '/seller/dashboard', icon: LayoutDashboard },
  { title: 'My Products', href: '/seller/dashboard/products', icon: ShoppingBasket },
  { title: 'My Sales', href: '/seller/dashboard/orders', icon: Package },
  { title: 'Profile', href: '/seller/dashboard/profile', icon: UserCog },
];

export const COURIER_DASHBOARD_NAV_ITEMS: NavItem[] = [
  { title: 'Overview', href: '/courier/dashboard', icon: LayoutDashboard },
  { title: 'Assigned Orders', href: '/courier/dashboard/orders', icon: Package },
  { title: 'Profile', href: '/courier/dashboard/profile', icon: UserCog },
];


export const PRODUCT_CATEGORIES = [
  "Fruits", "Vegetables", "Grains", "Dairy", "Tubers", "Poultry", "Herbs & Spices", "Meat & Fish", "Groceries & Provisions", "Other"
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
  "Ahafo": ["Goaso", "Bechem", "Duayaw Nkwanta", "Hwidiem", "Kenyasi", "Mim", "Sankore", "Kukuom", "Acherensua", "Techimantia", "Akrodie", "Ayomso", "Goaso Old Town", "Kenyasi No.1", "Kenyasi No.2", "Mehame", "Ntotroso", "Wamahinso"],
  "Ashanti": ["Kumasi", "Obuasi", "Ejisu", "Mampong", "Konongo", "Bekwai", "Offinso", "Agogo", "Tafo", "Asokore Mampong", "Effiduase", "Tepa", "New Edubiase", "Juaso", "Agona", "Ahenkro", "Ahwiaa", "Akropong", "Bantama", "Barekesse", "Bibiani", "Bonwire", "Breman", "Buokrom", "Fomena", "Jacobu", "Jamasi", "Juaben", "Kenyasi-Abirem", "Kodiekrom", "Manso Nkwanta", "Nkawie", "Pankrono", "Santasi", "Suame", "Tontokrom"],
  "Bono": ["Sunyani", "Berekum", "Dormaa Ahenkro", "Wenchi", "Jaman South (Drobo)", "Sampa", "Seikwa", "Nsoatre", "Odumase", "Fiapre", "Abesim", "Adamsu", "Badu", "Banda Ahenkro", "Chiraa", "Diabaa", "Jinijini", "Koraso", "Kwasibourkrom", "Nkrankwanta", "Nsawkaw", "Suma-Ahenkro", " Wamfie"],
  "Bono East": ["Techiman", "Kintampo", "Nkoranza", "Atebubu", "Yeji", "Prang", "Busunya", "Amantin", "Ejura", "Kwame Danso", "Apesika", "Forikrom", "Jema", "Kajaji", "Kintampo North", "Kintampo South", "Nkoranza North", "Nkoranza South", "Pru East", "Pru West", "Techiman North", "Techiman South", "Tuobodom"],
  "Central": ["Cape Coast", "Kasoa", "Winneba", "Mankessim", "Elmina", "Swedru", "Assin Fosu", "Saltpond", "Apam", "Twifo Praso", "Dunkwa-on-Offin", "Abakrampa", "Abura-Dunkwa", "Ajumako", "Anomabu", "Asikuma", "Bawjiase", "Breman Asikuma", "Buduburam", "Diaso", "Effutu", "Ekumfi", "Gomoa Afransi", "Gomoa Dawurampong", "Gomoa Onyadze", "Komenda", "Moree", "Nyakrom", "Nyananor", "Odoben", "Potsin", "Senya Beraku"],
  "Eastern": ["Koforidua", "Nkawkaw", "Akropong", "Suhum", "Oda", "Nsawam", "Aburi", "Somanya", "Begoro", "New Abirem", "Asamankese", "Akosombo", "Achiase", "Adeiso", "Adukrom", "Akim Swedru", "Akwatia", "Anyinam", "Asesewa", "Atimpoku", "Coaltar", "Donkorkrom", "Kade", "Kibi", "Kwabeng", "Mpraeso", "Osino", "Peki", "Suhum-Kraboa-Coaltar", "Tafo"],
  "Greater Accra": [
    "Ablekuma", "Abokobi", "Abossey Okai", "Accra", "Accra New Town", "Adabraka", "Adenta", "Adenta East",
    "Ada Foah", "Afienya", "Agbogba", "Airport Residential Area", "Amasaman", "Ashaiman", "Ashongman",
    "Awoshie", "Banana Inn", "Bortianor", "Bubiiashie", "Cantonments", "Circle", "Darkuman", "Dansoman",
    "Dodowa", "Dome", "Dzorwulu", "East Legon", "Gbawe", "Haatso", "James Town", "Kaneshie",
    "Kasoa (partly in Central)", "Katamanso", "Kisseiman", "Kokomlemle", "Korle Gonno", "Kwashieman",
    "Labadi", "Lapaz", "Lartebiokorshie", "Lashibi", "Legon", "Madina", "Makola", "Mallam", "Mamprobi",
    "McCarthy Hill", "Medie", "New Bortianor", "Nima", "North Kaneshie", "Nungua", "Odorkor",
    "Old Bortianor", "Osu", "Oyibi", "Pokuase", "Prampram", "Ringway Estates", "Roman Ridge", "Sakumono",
    "Santa Maria", "Sowutuom", "Spintex", "Sukura", "Taifa", "Tema", "Tema Community 1", "Tema Community 2",
    "Tema Community 25", "Tema New Town", "Teshie", "Tesano", "Tuba", "Usher Town", "Weija", "West Legon"
  ].sort(),
  "North East": ["Nalerigu", "Walewale", "Gambaga", "Bunkpurugu", "Chereponi", "Yagaba", "Wulugu", "Kpasenkpe", "Sakogu", "Langbinsi", "Gbintiri", "Janga", "Kparigu", "Nakpanduri", "Nasuan", "Soo", "Wungu", "Yunyo"],
  "Northern": ["Tamale", "Yendi", "Savelugu", "Bimbilla", "Tolon", "Kumbungu", "Karaga", "Wulensi", "Nanton", "Gushegu", "Sang", "Diare", "Dipale", "Gbungbaliga", "Kpatia", "Mion", "Nabogu", "Pion", "Saboba", "Zabzugu"],
  "Oti": ["Dambai", "Kadjebi", "Jasikan", "Nkwanta", "Worawora", "Kete Krachi", "Chinderi", "Krachi Nchumuru", "Likpe-Mate", "Kpassa", "Abotoase", "Ahamansu", "Baglo", "Borada", "Guan", "Okadjakrom", "Pampawie", "Tokuroano", "Tutukpene", "Zongo Macheri"],
  "Savannah": ["Damongo", "Bole", "Salaga", "Sawla", "Daboya", "Buipe", "Yapei", "Kpalbe", "Mpaha", "Tinga", "Bamboi", "Busunu", "Debre", "Fufulso", "Kalba", "Kpembe", "Kulmasa", "Laribanga", "Mole", "Suminakese"],
  "Upper East": ["Bolgatanga", "Bawku", "Navrongo", "Paga", "Zebilla", "Sandema", "Binduri", "Garu", "Tempane", "Bongo", "Chuchuliga", "Fumbisi", "Gbeogo", "Kologo", "Mirigu", "Nangodi", "Pelungu", "Pusiga", "Sirigu", "Tongo", "Widana", "Zuarungu"],
  "Upper West": ["Wa", "Tumu", "Lawra", "Jirapa", "Nandom", "Gwollu", "Funsi", "Wechiau", "Issa", "Kaleo", "Babile", "Charia", "Daffiama", "Eremon", "Fielmuo", "Goziri", "Hain", "Ko", "Lambussie", "Loggu", "Manwe", "Nadawli", "Nyoli", "Piina", "Sankana", "Wichiau", "Zini"],
  "Volta": ["Ho", "Keta", "Hohoe", "Anloga", "Aflao", "Kpandu", "Sogakope", "Peki", "Dzodze", "Adidome", "Akatsi", "Kpando", "Abor", "Adaklu", "Afadzato South", "Agotime-Ziope", "Anfoega", "Anyako", "Ave Dakpa", "Battor Dugame", "Denu", "Juapong", "Kpetoe", "Likpe", "Logba", "Mafi Kumasi", "Nkonya", "Tsito", "Vakpo", "Ve Golokwati", "Weta", "Wusuta"],
  "Western": ["Sekondi-Takoradi", "Tarkwa", "Axim", "Elubo", "Prestea", "Shama", "Mpohor", "Agona Nkwanta", "Dixcove", "Bogoso", "Aboso", "Adiembra", "Apowa", "Asankrangwa", "Beposo", "Daboase", "Damang", "Essikado", "Half Assini", "Inchaban", "Kojokrom", "Kwesimintsim", "Manso Amenfi", "Nsuaem", "Samreboi", "Wassa Akropong"],
  "Western North": ["Sefwi Wiawso", "Bibiani", "Juaboso", "Enchi", "Asankragua", "Sefwi Bekwai", "Dadieso", "Akotombra", "Bodi", "Debiso", "Adabokrom", "Aowin", "Asempaneye", "Benkyema", "Bia East", "Bia West", "Chirano", "Datano", "Elluokrom", "Kaase", "Kramokrom", "Kwabena Tenten", "Sefwi Akontombra", "Sefwi Anhwiaso", "Sefwi Asafo", "Sefwi Essam", "Sefwi Kaase", "Yawmatwa"],
};
