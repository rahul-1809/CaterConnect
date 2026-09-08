import {
  CateringOffering,
  FunctionType,
  MenuCategory,
  MenuItem,
  Package,
  PackageDetail,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ---------------------------------------------------------------------------
// Seed Data Fallbacks (for standalone execution and offline demo)
// ---------------------------------------------------------------------------

export const SEED_FUNCTIONS: FunctionType[] = [
  {
    id: "fn-1",
    name: "Royal Weddings",
    slug: "royal-weddings",
    description: "Grand multi-course banquets, live artisanal counters, and royal dining hospitality for your dream celebration.",
    image_url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "fn-2",
    name: "Corporate Summits & Galas",
    slug: "corporate-summits",
    description: "Sophisticated executive lunches, networking cocktail buffets, and high-tea spreads tailored for corporate excellence.",
    image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "fn-3",
    name: "Birthdays & Anniversaries",
    slug: "birthdays-anniversaries",
    description: "Festive family feasts, fusion starters, custom mocktail bars, and decadent dessert installations.",
    image_url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
    sort_order: 3,
    is_active: true,
  },
  {
    id: "fn-4",
    name: "Cocktail Receptions",
    slug: "cocktail-receptions",
    description: "Gourmet passed hors d'oeuvres, dynamic live grilling stations, and chic lounge dining formats.",
    image_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80",
    sort_order: 4,
    is_active: true,
  },
  {
    id: "fn-5",
    name: "Traditional Festivities & Pujas",
    slug: "traditional-pujas",
    description: "Pure sattvic vegetarian delicacies, authentic regional delicacies, and traditional ceremonial thalis.",
    image_url: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1200&q=80",
    sort_order: 5,
    is_active: true,
  },
];

export const SEED_OFFERINGS: CateringOffering[] = [
  {
    id: "off-1",
    name: "Grand Imperial Dinner Buffet",
    slug: "grand-dinner-buffet",
    description: "Comprehensive 5-course spread with welcome drinks, starters, main courses, artisanal breads, and dessert bar.",
    image_url: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "off-2",
    name: "Executive Lunch Spread",
    slug: "executive-lunch-spread",
    description: "Efficient yet luxurious corporate lunch buffet designed for seamless dining.",
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "off-3",
    name: "High-Tea & Canapé Soirée",
    slug: "high-tea-canape",
    description: "Artisanal teas, single-origin coffees, handcrafted pastries, and savory bite-sized delights.",
    image_url: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=800&q=80",
    sort_order: 3,
    is_active: true,
  },
  {
    id: "off-4",
    name: "Interactive Live Cooking Stations",
    slug: "live-stations",
    description: "Chef-driven live pasta, robata grills, chaat bazaar, and flaming dessert counters.",
    image_url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
    sort_order: 4,
    is_active: true,
  },
];

export const SEED_CATEGORIES: MenuCategory[] = [
  { id: "cat-1", name: "Welcome Elixirs & Mocktails", slug: "welcome-drinks", description: "Refreshing arrival concoctions", sort_order: 1, is_active: true },
  { id: "cat-2", name: "Artisanal Starters & Appetizers", slug: "starters", description: "Clay oven roasted & crisp finger bites", sort_order: 2, is_active: true },
  { id: "cat-3", name: "Royal Main Courses", slug: "main-courses", description: "Rich gravies, curries, and slow-cooked signatures", sort_order: 3, is_active: true },
  { id: "cat-4", name: "Breads & Fragrant Rice", slug: "breads-rice", description: "Tandoori breads, dum biryanis, and pulavs", sort_order: 4, is_active: true },
  { id: "cat-5", name: "Desserts & Mithai Confections", slug: "desserts", description: "Traditional halwas, kulfis, and continental pastries", sort_order: 5, is_active: true },
];

export const SEED_MENU_ITEMS: MenuItem[] = [
  {
    id: "dish-1",
    category_id: "cat-1",
    name: "Kokum & Basil Sparkling Cooler",
    slug: "kokum-basil-cooler",
    description: "Tangy coastal kokum infused with bruised holy basil, black salt, and sparkling soda.",
    dietary_type: "VEGAN",
    image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
    sort_order: 1,
    is_active: true,
    extra_metadata: { spice_level: 1, is_chef_special: true },
  },
  {
    id: "dish-2",
    category_id: "cat-1",
    name: "Smoked Saffron Thandai",
    slug: "smoked-saffron-thandai",
    description: "Almond and poppy seed reduction perfumed with Kashmiri saffron and smoked cloves.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80",
    sort_order: 2,
    is_active: true,
    extra_metadata: { spice_level: 1, allergens: ["Nuts", "Dairy"] },
  },
  {
    id: "dish-3",
    category_id: "cat-2",
    name: "Paneer Tikka Angara",
    slug: "paneer-tikka-angara",
    description: "Tandoor-charred cottage cheese cubes marinated in degi mirch, mustard oil, and hung curd.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80",
    sort_order: 1,
    is_active: true,
    extra_metadata: { spice_level: 2, allergens: ["Dairy"], is_chef_special: true },
  },
  {
    id: "dish-4",
    category_id: "cat-2",
    name: "Murgh Malai Reshmi Kebab",
    slug: "murgh-malai-reshmi-kebab",
    description: "Melt-in-mouth chicken supremes marinated in heavy cream, green cardamom, and cashew paste.",
    dietary_type: "NON_VEG",
    image_url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80",
    sort_order: 2,
    is_active: true,
    extra_metadata: { spice_level: 1, allergens: ["Dairy", "Nuts"] },
  },
  {
    id: "dish-5",
    category_id: "cat-2",
    name: "Crispy Lotus Stem in Plum Glaze",
    slug: "crispy-lotus-stem",
    description: "Thinly sliced lotus crisplets wok-tossed with sweet plum reduction, roasted sesame, and scallions.",
    dietary_type: "VEGAN",
    image_url: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80",
    sort_order: 3,
    is_active: true,
    extra_metadata: { spice_level: 2, allergens: ["Sesame"] },
  },
  {
    id: "dish-6",
    category_id: "cat-3",
    name: "Dal Makhani Royale 24-Hour Simmer",
    slug: "dal-makhani-royale",
    description: "Signature black urad lentils slow-cooked overnight with white butter, fresh cream, and smoked tomatoes.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    sort_order: 1,
    is_active: true,
    extra_metadata: { spice_level: 1, allergens: ["Dairy"], is_chef_special: true },
  },
  {
    id: "dish-7",
    category_id: "cat-3",
    name: "Nawabi Murgh Dum Handi",
    slug: "nawabi-murgh-dum-handi",
    description: "Succulent chicken braised in a rich brown onion, yogurt, and aromatic garam masala gravy sealed in clay pot.",
    dietary_type: "NON_VEG",
    image_url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
    sort_order: 2,
    is_active: true,
    extra_metadata: { spice_level: 2, allergens: ["Dairy"] },
  },
  {
    id: "dish-8",
    category_id: "cat-3",
    name: "Paneer Lababdar",
    slug: "paneer-lababdar",
    description: "Soft malai paneer simmered in a luscious grated paneer, tomato, and cashew gravy.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    sort_order: 3,
    is_active: true,
    extra_metadata: { spice_level: 2, allergens: ["Dairy", "Nuts"] },
  },
  {
    id: "dish-9",
    category_id: "cat-4",
    name: "Awadhi Gosht / Subz Dum Biryani",
    slug: "awadhi-dum-biryani",
    description: "Long-grain aged basmati rice cooked on slow charcoal dum with fragrant rose water, saffron, and mint.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    sort_order: 1,
    is_active: true,
    extra_metadata: { spice_level: 2, allergens: ["Dairy"], is_chef_special: true },
  },
  {
    id: "dish-10",
    category_id: "cat-5",
    name: "Kesari Shahi Gulab Jamun",
    slug: "kesari-shahi-gulab-jamun",
    description: "Warm golden milk dumplings stuffed with pistachio-cardamom crumble in saffron sugar syrup.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80",
    sort_order: 1,
    is_active: true,
    extra_metadata: { spice_level: 0, allergens: ["Dairy", "Nuts"], is_chef_special: true },
  },
];

export const SEED_PACKAGES: PackageDetail[] = [
  {
    id: "pkg-1",
    name: "Imperial Royal Feast Package",
    slug: "imperial-royal-feast",
    description: "The quintessential luxury wedding buffet featuring 3 welcome drinks, 4 gourmet appetizers, 5 royal mains, live bread basket, signature dum biryani, and artisanal dessert studio.",
    image_url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=80",
    min_guests: 100,
    max_guests: 2000,
    sort_order: 1,
    is_active: true,
    indicative_price: 1850,
    package_items: [
      { id: "pi-1", package_id: "pkg-1", menu_item_id: "dish-6", inclusion_type: "MANDATORY", sort_order: 1, menu_item: SEED_MENU_ITEMS[5] },
      { id: "pi-2", package_id: "pkg-1", menu_item_id: "dish-9", inclusion_type: "MANDATORY", sort_order: 2, menu_item: SEED_MENU_ITEMS[8] },
    ],
    selection_groups: [
      {
        id: "sg-1",
        package_id: "pkg-1",
        name: "Welcome Drink (Choose 1)",
        description: "Select 1 refreshing welcome beverage for guest arrivals",
        min_selections: 1,
        max_selections: 1,
        sort_order: 1,
        is_required: true,
        items: [
          { id: "sgi-1", selection_group_id: "sg-1", menu_item_id: "dish-1", menu_item: SEED_MENU_ITEMS[0] },
          { id: "sgi-2", selection_group_id: "sg-1", menu_item_id: "dish-2", menu_item: SEED_MENU_ITEMS[1] },
        ],
      },
      {
        id: "sg-2",
        package_id: "pkg-1",
        name: "Chef's Appetizers (Choose 2)",
        description: "Select 2 live starters passed during reception",
        min_selections: 2,
        max_selections: 2,
        sort_order: 2,
        is_required: true,
        items: [
          { id: "sgi-3", selection_group_id: "sg-2", menu_item_id: "dish-3", menu_item: SEED_MENU_ITEMS[2] },
          { id: "sgi-4", selection_group_id: "sg-2", menu_item_id: "dish-4", menu_item: SEED_MENU_ITEMS[3] },
          { id: "sgi-5", selection_group_id: "sg-2", menu_item_id: "dish-5", menu_item: SEED_MENU_ITEMS[4] },
        ],
      },
    ],
    addons: [
      { id: "pa-1", package_id: "pkg-1", menu_item_id: "dish-10", display_name: "Artisanal Dessert Bar Add-on", is_active: true, sort_order: 1, menu_item: SEED_MENU_ITEMS[9] },
    ],
  },
  {
    id: "pkg-2",
    name: "Executive Gala Buffet",
    slug: "executive-gala-buffet",
    description: "Designed for high-impact corporate summits and milestone celebrations. Balanced nutritional options, live carving station, crisp appetizers, and gourmet dessert pairings.",
    image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80",
    min_guests: 50,
    max_guests: 800,
    sort_order: 2,
    is_active: true,
    indicative_price: 1350,
    package_items: [
      { id: "pi-3", package_id: "pkg-2", menu_item_id: "dish-6", inclusion_type: "MANDATORY", sort_order: 1, menu_item: SEED_MENU_ITEMS[5] },
    ],
    selection_groups: [
      {
        id: "sg-3",
        package_id: "pkg-2",
        name: "Starters Selection (Choose 2)",
        description: "Select 2 starters",
        min_selections: 2,
        max_selections: 2,
        sort_order: 1,
        is_required: true,
        items: [
          { id: "sgi-6", selection_group_id: "sg-3", menu_item_id: "dish-3", menu_item: SEED_MENU_ITEMS[2] },
          { id: "sgi-7", selection_group_id: "sg-3", menu_item_id: "dish-5", menu_item: SEED_MENU_ITEMS[4] },
        ],
      },
    ],
    addons: [],
  },
  {
    id: "pkg-3",
    name: "Intimate Boutique Soirée",
    slug: "intimate-boutique-soiree",
    description: "Curated for private family parties, anniversaries, and housewarmings. Personalized platter styling and tailored service staff.",
    image_url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80",
    min_guests: 20,
    max_guests: 90,
    sort_order: 3,
    is_active: true,
    indicative_price: 1100,
    package_items: [],
    selection_groups: [],
    addons: [],
  },
];

// ---------------------------------------------------------------------------
// Client Methods with Backend Fetch + Fallback
// ---------------------------------------------------------------------------

async function safeFetch<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return fallback;
    }
    const json = await res.json();
    return (json.data as T) || fallback;
  } catch {
    return fallback;
  }
}

export async function getFunctionTypes(): Promise<FunctionType[]> {
  return safeFetch<FunctionType[]>("/functions", SEED_FUNCTIONS);
}

export async function getFunctionTypeById(id: string): Promise<FunctionType | null> {
  const all = await getFunctionTypes();
  return all.find((f) => f.id === id || f.slug === id) || null;
}

export async function getOfferings(): Promise<CateringOffering[]> {
  return safeFetch<CateringOffering[]>("/offerings", SEED_OFFERINGS);
}

export async function getOfferingsForFunction(functionId: string): Promise<CateringOffering[]> {
  return safeFetch<CateringOffering[]>(`/functions/${functionId}/offerings`, SEED_OFFERINGS);
}

export async function getPackages(filters?: {
  guestCount?: number;
  search?: string;
}): Promise<Package[]> {
  const query = new URLSearchParams();
  if (filters?.guestCount) query.set("guest_count", String(filters.guestCount));
  if (filters?.search) query.set("search", filters.search);
  const qStr = query.toString() ? `?${query.toString()}` : "";

  return safeFetch<Package[]>(`/packages${qStr}`, SEED_PACKAGES);
}

export async function getPackageById(id: string): Promise<PackageDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/packages/${id}`);
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data as PackageDetail;
    }
  } catch {
    // fallback
  }
  return SEED_PACKAGES.find((p) => p.id === id || p.slug === id) || null;
}

export async function getMenuCategories(): Promise<MenuCategory[]> {
  return safeFetch<MenuCategory[]>("/menu/categories", SEED_CATEGORIES);
}

export async function getMenuItems(filters?: {
  categoryId?: string;
  dietaryType?: string;
  search?: string;
}): Promise<MenuItem[]> {
  const query = new URLSearchParams();
  if (filters?.categoryId) query.set("category_id", filters.categoryId);
  if (filters?.dietaryType) query.set("dietary_type", filters.dietaryType);
  if (filters?.search) query.set("search", filters.search);
  const qStr = query.toString() ? `?${query.toString()}` : "";

  let items = await safeFetch<MenuItem[]>(`/menu/items${qStr}`, SEED_MENU_ITEMS);
  if (filters?.categoryId) {
    items = items.filter((i) => i.category_id === filters.categoryId);
  }
  if (filters?.dietaryType && filters.dietaryType !== "ALL") {
    items = items.filter((i) => i.dietary_type === filters.dietaryType);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    items = items.filter((i) => i.name.toLowerCase().includes(s) || i.description?.toLowerCase().includes(s));
  }
  return items;
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  const all = await getMenuItems();
  return all.find((i) => i.id === id || i.slug === id) || null;
}

// ---------------------------------------------------------------------------
// Customer Event Planner & Saved Plans APIs (Phase 5)
// ---------------------------------------------------------------------------

export async function createEventDraft(
  payload: {
    function_type_id?: string;
    offering_id?: string;
    package_id?: string;
    guest_count?: number;
    budget_min?: number;
    budget_max?: number;
    event_date?: string;
    event_time?: string;
    venue_name?: string;
    venue_address?: string;
    venue_notes?: string;
    customer_notes?: string;
  },
  token?: string
): Promise<{ data: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      return { data: null, error: json.detail?.message || "Failed to create event draft" };
    }
    return { data: json.data };
  } catch (err: any) {
    return { data: null, error: err.message || "Network error" };
  }
}

export async function listCustomerEvents(
  token?: string,
  statusFilter?: string
): Promise<{ items: any[]; total: number }> {
  try {
    const q = statusFilter ? `?status=${statusFilter}` : "";
    const res = await fetch(`${API_BASE}/events${q}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || { items: [], total: 0 };
    }
  } catch {
    // fallback
  }
  return { items: [], total: 0 };
}

export async function getEventDetails(
  eventId: string,
  token?: string
): Promise<{ data: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/events/${eventId}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const json = await res.json();
    if (!res.ok) {
      return { data: null, error: json.detail?.message || "Event not found" };
    }
    return { data: json.data };
  } catch (err: any) {
    return { data: null, error: err.message || "Network error" };
  }
}

export async function updateEventDetails(
  eventId: string,
  payload: Record<string, any>,
  token?: string,
  ifMatchVersion?: number
): Promise<{ data: any; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (ifMatchVersion !== undefined) headers["If-Match-Version"] = String(ifMatchVersion);

    const res = await fetch(`${API_BASE}/events/${eventId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      return { data: null, error: json.detail?.message || "Failed to update event details" };
    }
    return { data: json.data };
  } catch (err: any) {
    return { data: null, error: err.message || "Network error" };
  }
}

export async function updateEventConfiguration(
  eventId: string,
  payload: {
    base_version: number;
    package_id?: string;
    menu_items: Array<{
      menu_item_id: string;
      source_type: string;
      selection_group_id?: string | null;
      quantity?: number;
      is_included?: boolean;
    }>;
  },
  token?: string
): Promise<{ data: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/events/${eventId}/configuration`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      return { data: null, error: json.detail?.message || "Failed to update menu configuration" };
    }
    return { data: json.data };
  } catch (err: any) {
    return { data: null, error: err.message || "Network error" };
  }
}

export async function addEventMenuItem(
  eventId: string,
  payload: {
    menu_item_id: string;
    source_type?: string;
    selection_group_id?: string | null;
    quantity?: number;
    base_version: number;
  },
  token?: string
): Promise<{ data: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/events/${eventId}/menu-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      return { data: null, error: json.detail?.message || "Failed to add menu item" };
    }
    return { data: json.data };
  } catch (err: any) {
    return { data: null, error: err.message || "Network error" };
  }
}

export async function removeEventMenuItem(
  eventId: string,
  eventMenuItemId: string,
  baseVersion: number,
  token?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/events/${eventId}/menu-items/${eventMenuItemId}?base_version=${baseVersion}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      const json = await res.json();
      return { success: false, error: json.detail?.message || "Failed to remove menu item" };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}

export async function getEventVersions(
  eventId: string,
  token?: string
): Promise<{ versions: any[]; current_version: number }> {
  try {
    const res = await fetch(`${API_BASE}/events/${eventId}/versions`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || { versions: [], current_version: 1 };
    }
  } catch {
    // fallback
  }
  return { versions: [], current_version: 1 };
}

