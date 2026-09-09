import {
  CateringOffering,
  FunctionType,
  MenuCategory,
  MenuItem,
  Package,
  PackageDetail,
  User,
  OTPRequestResult,
  OTPVerifyResult,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ---------------------------------------------------------------------------
// Authentic Telugu & Hyderabadi Function Types (Telangana & Andhra Pradesh)
// ---------------------------------------------------------------------------

export const SEED_FUNCTIONS: FunctionType[] = [
  {
    id: "fn-1",
    name: "Grand Telugu Wedding & Reception",
    slug: "royal-weddings",
    description: "Opulent multi-course Pelli Bhojanam, royal Hyderabadi reception buffets, live counters, and traditional banti hospitality.",
    image_url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "fn-2",
    name: "Sangeeth, Mehendi & Haldi Soiree",
    slug: "sangeeth-mehendi",
    description: "Vibrant live tandoor grills, interactive Chaat Bazaar, fusion starters, craft mocktail stations, and dessert studios.",
    image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "fn-3",
    name: "Gruhapravesam & Satyanarayana Vratham",
    slug: "gruhapravesam-pujas",
    description: "Pure traditional Sattvic vegetarian feast on fresh plantain leaves with authentic prasadam, podis, and sweets.",
    image_url: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1200&q=80",
    sort_order: 3,
    is_active: true,
  },
  {
    id: "fn-4",
    name: "Seemantham & Baby Shower",
    slug: "seemantham-srimantham",
    description: "Auspicious 7-variety Chitrannam rice spread, traditional Andhra festival sweets, and wholesome celebratory banquets.",
    image_url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80",
    sort_order: 4,
    is_active: true,
  },
  {
    id: "fn-5",
    name: "Half Saree & Dhothi Ceremony",
    slug: "half-saree-dhothi",
    description: "Festive family feasts featuring traditional Godavari Ruchulu, Hyderabadi Dum Biryanis, and live sweet making.",
    image_url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
    sort_order: 5,
    is_active: true,
  },
  {
    id: "fn-6",
    name: "Corporate Summits & Executive Galas",
    slug: "corporate-summits",
    description: "Multi-cuisine executive spreads, live pasta & grill stations, formal dining setups, and high-tea packages.",
    image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    sort_order: 6,
    is_active: true,
  },
];

// ---------------------------------------------------------------------------
// Catering Offerings / Service Formats
// ---------------------------------------------------------------------------

export const SEED_OFFERINGS: CateringOffering[] = [
  {
    id: "off-1",
    name: "Royal Banti Bhojanam (Plantain Leaf Service)",
    slug: "banti-bhojanam",
    description: "Traditional course-by-course seated dining on fresh banana leaves with dedicated service staff and royal hospitality.",
    image_url: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "off-2",
    name: "Grand Imperial Buffet Spread",
    slug: "grand-imperial-buffet",
    description: "Lavish multi-station buffet layout with chafing warmers, dedicated soup/salad bar, live counters, and dessert studio.",
    image_url: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "off-3",
    name: "Live Interactive Cooking Theatres",
    slug: "live-stations",
    description: "Live chefs preparing hot MLA Pesarattu, Dosas, Tandoori Kebabs, Chaats, and flaming Jalebis on demand.",
    image_url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80",
    sort_order: 3,
    is_active: true,
  },
  {
    id: "off-4",
    name: "High-Tea & Savory Soiree",
    slug: "high-tea-canape",
    description: "Artisanal filter coffees, Irani chai, Osmania biscuits, Mirchi bajjis, canapes, and fresh mithai bites.",
    image_url: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=800&q=80",
    sort_order: 4,
    is_active: true,
  },
];

// ---------------------------------------------------------------------------
// Menu Categories
// ---------------------------------------------------------------------------

export const SEED_CATEGORIES: MenuCategory[] = [
  { id: "cat-1", name: "Welcome Drinks & Traditional Coolers", slug: "welcome-drinks", description: "Refreshing arrival drinks and herbal digestifs", sort_order: 1, is_active: true },
  { id: "cat-2", name: "Traditional Veg Starters & Bajjis", slug: "starters-veg", description: "Crisp clay oven & tawa fried appetizers", sort_order: 2, is_active: true },
  { id: "cat-3", name: "Royal Non-Veg Starters & Vepudu", slug: "starters-nonveg", description: "Spicy coastal seafood, chicken & mutton fries", sort_order: 3, is_active: true },
  { id: "cat-4", name: "Hyderabadi Biryanis & Flavored Rices", slug: "biryani-rice", description: "Dum biryanis, bagara rice, pulihora & pulaos", sort_order: 4, is_active: true },
  { id: "cat-5", name: "Authentic Curries, Kooras & Pulusu", slug: "gravies-curries", description: "Gutti vankaya, gongura curries and royal gravies", sort_order: 5, is_active: true },
  { id: "cat-6", name: "Pappu, Sambar, Ulavacharu & Charu", slug: "dals-rasam", description: "Comforting dals, traditional stews and pepper rasam", sort_order: 6, is_active: true },
  { id: "cat-7", name: "Podis, Pachadis & Accompaniments", slug: "podis-pachadis", description: "Gongura pachadi, avakaya, kandi podi and fryums", sort_order: 7, is_active: true },
  { id: "cat-8", name: "Traditional Sweets & Hyderabadi Desserts", slug: "sweets-desserts", description: "Pootharekulu, bobbatlu, double ka meetha & kulfi", sort_order: 8, is_active: true },
  { id: "cat-9", name: "Interactive Live Counters", slug: "live-counters", description: "Live Dosa, Pesarattu, Chaat & Jalebi stations", sort_order: 9, is_active: true },
];

// ---------------------------------------------------------------------------
// Curated Authentic 45+ Telugu & Hyderabadi Menu Items
// ---------------------------------------------------------------------------

export const SEED_MENU_ITEMS: MenuItem[] = [
  // 1. Welcome Drinks
  {
    id: "dish-1",
    category_id: "cat-1",
    name: "Sugandhi Nannari Sharbat",
    slug: "sugandhi-nannari-sharbat",
    description: "Traditional aromatic root elixir infused with fresh lime juice, black salt, and sabja seeds.",
    dietary_type: "VEGAN",
    image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
    sort_order: 1,
    is_active: true,
    extra_metadata: { spice_level: 0, is_chef_special: true },
  },
  {
    id: "dish-2",
    category_id: "cat-1",
    name: "Masala Majjiga (Spiced Buttermilk)",
    slug: "masala-majjiga",
    description: "Churned country yogurt blended with crushed green chillies, ginger, fresh curry leaves, and roasted jeera.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80",
    sort_order: 2,
    is_active: true,
    extra_metadata: { spice_level: 1, allergens: ["Dairy"] },
  },
  {
    id: "dish-3",
    category_id: "cat-1",
    name: "Fresh Tender Coconut & Mint Elixir",
    slug: "tender-coconut-mint-elixir",
    description: "Pure East Godavari tender coconut water muddled with bruised mint leaves and a hint of lemon.",
    dietary_type: "VEGAN",
    image_url: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=600&q=80",
    sort_order: 3,
    is_active: true,
    extra_metadata: { spice_level: 0 },
  },
  {
    id: "dish-4",
    category_id: "cat-1",
    name: "Traditional Panakam Nectar",
    slug: "traditional-panakam",
    description: "Auspicious festive drink crafted with organic jaggery, dry ginger, crushed black pepper, and holy basil.",
    dietary_type: "VEGAN",
    image_url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80",
    sort_order: 4,
    is_active: true,
    extra_metadata: { spice_level: 1, is_chef_special: true },
  },
  {
    id: "dish-5",
    category_id: "cat-1",
    name: "Shahi Kesar Badam Milk",
    slug: "shahi-kesar-badam-milk",
    description: "Rich slow-simmered whole milk perfumed with Kashmiri saffron threads, crushed green cardamom, and toasted almond slivers.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1570696516188-ade861b84a49?auto=format&fit=crop&w=600&q=80",
    sort_order: 5,
    is_active: true,
    extra_metadata: { spice_level: 0, allergens: ["Dairy", "Nuts"] },
  },

  // 2. Veg Starters
  {
    id: "dish-6",
    category_id: "cat-2",
    name: "Andhra Stuffed Mirchi Bajji",
    slug: "andhra-stuffed-mirchi-bajji",
    description: "Crisp gram flour battered Bhavnagri chillies stuffed with tangy tamarind, roasted peanuts, and finely chopped onions.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
    sort_order: 1,
    is_active: true,
    extra_metadata: { spice_level: 2, allergens: ["Peanuts"], is_chef_special: true },
  },
  {
    id: "dish-7",
    category_id: "cat-2",
    name: "Gongura Paneer Tikka",
    slug: "gongura-paneer-tikka",
    description: "Fresh cottage cheese cubes marinated in tangy Andhra sorrel leaf paste, hung curd, and roasted spices charred in clay oven.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80",
    sort_order: 2,
    is_active: true,
    extra_metadata: { spice_level: 2, allergens: ["Dairy"], is_chef_special: true },
  },
  {
    id: "dish-8",
    category_id: "cat-2",
    name: "Pesara Punugulu with Allam Pachadi",
    slug: "pesara-punugulu",
    description: "Golden crisp whole green moong dal fritters served with hot allam (ginger) and kobbari (coconut) chutneys.",
    dietary_type: "VEGAN",
    image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
    sort_order: 3,
    is_active: true,
    extra_metadata: { spice_level: 2 },
  },
  {
    id: "dish-9",
    category_id: "cat-2",
    name: "Crispy Gobi 65",
    slug: "crispy-gobi-65",
    description: "Fresh cauliflower florets marinated in South Indian spices, degi mirch, curry leaves, and flash-fried to golden perfection.",
    dietary_type: "VEGAN",
    image_url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80",
    sort_order: 4,
    is_active: true,
    extra_metadata: { spice_level: 2 },
  },
  {
    id: "dish-10",
    category_id: "cat-2",
    name: "Dondakaya Cashew Vepudu",
    slug: "dondakaya-cashew-vepudu",
    description: "Thinly sliced tindora (ivy gourd) slow-roasted with crunchy cashews, garlic, curry leaves, and dry coconut masala.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    sort_order: 5,
    is_active: true,
    extra_metadata: { spice_level: 1, allergens: ["Nuts"] },
  },

  // 3. Non-Veg Starters
  {
    id: "dish-11",
    category_id: "cat-3",
    name: "Andhra Green Chilli Chicken",
    slug: "andhra-chilli-chicken",
    description: "Tender boneless chicken morsels tossed with slit green chillies, caramelized shallots, curry leaves, and freshly cracked pepper.",
    dietary_type: "NON_VEG",
    image_url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80",
    sort_order: 1,
    is_active: true,
    extra_metadata: { spice_level: 3, is_chef_special: true },
  },
  {
    id: "dish-12",
    category_id: "cat-3",
    name: "Apollo Fish (Hyderabadi Special)",
    slug: "apollo-fish-hyderabad",
    description: "Signature boneless fish fillets spiced with ginger-garlic, tossed in seasoned yogurt reduction, curry leaves, and red chillies.",
    dietary_type: "NON_VEG",
    image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80",
    sort_order: 2,
    is_active: true,
    extra_metadata: { spice_level: 2, allergens: ["Fish", "Dairy"], is_chef_special: true },
  },
  {
    id: "dish-13",
    category_id: "cat-3",
    name: "Royyala Vepudu (Prawns Pepper Fry)",
    slug: "royyala-vepudu",
    description: "Coastal Bay of Bengal fresh prawns wok-roasted with black peppercorns, shallots, garlic, and freshly grated coconut.",
    dietary_type: "NON_VEG",
    image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    sort_order: 3,
    is_active: true,
    extra_metadata: { spice_level: 3, allergens: ["Crustacean"], is_chef_special: true },
  },
  {
    id: "dish-14",
    category_id: "cat-3",
    name: "Rayalaseema Mutton Sukka Vepudu",
    slug: "mutton-sukka-vepudu",
    description: "Succulent tender lamb pieces braised with Guntur red chillies, shallots, and slow-roasted village garam masala.",
    dietary_type: "NON_VEG",
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    sort_order: 4,
    is_active: true,
    extra_metadata: { spice_level: 3, is_chef_special: true },
  },

  // 4. Biryanis & Rice
  {
    id: "dish-15",
    category_id: "cat-4",
    name: "Hyderabadi Mutton Dum Biryani",
    slug: "hyderabadi-mutton-dum-biryani",
    description: "Royal aged basmati rice cooked on slow charcoal dum with marinated tender goat meat, saffron, pure ghee, and caramelized onions.",
    dietary_type: "NON_VEG",
    image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    sort_order: 1,
    is_active: true,
    extra_metadata: { spice_level: 2, allergens: ["Dairy"], is_chef_special: true },
  },
  {
    id: "dish-16",
    category_id: "cat-4",
    name: "Hyderabadi Chicken Dum Biryani",
    slug: "hyderabadi-chicken-dum-biryani",
    description: "Authentic kacchi dum biryani layered with marinated farm chicken, fresh mint, coriander, and royal aromatic spices.",
    dietary_type: "NON_VEG",
    image_url: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80",
    sort_order: 2,
    is_active: true,
    extra_metadata: { spice_level: 2, allergens: ["Dairy"], is_chef_special: true },
  },
  {
    id: "dish-17",
    category_id: "cat-4",
    name: "Telangana Bagara Rice",
    slug: "telangana-bagara-rice",
    description: "Fragrant rice seasoned with whole spices (shahjeera, cloves, cinnamon), mint leaves, and golden fried onions.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80",
    sort_order: 3,
    is_active: true,
    extra_metadata: { spice_level: 1, is_chef_special: true },
  },
  {
    id: "dish-18",
    category_id: "cat-4",
    name: "Traditional Chintapandu Pulihora",
    slug: "chintapandu-pulihora",
    description: "The iconic festive tamarind rice tempered in hot sesame oil with mustard seeds, roasted peanuts, curry leaves, and dry red chillies.",
    dietary_type: "VEGAN",
    image_url: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=600&q=80",
    sort_order: 4,
    is_active: true,
    extra_metadata: { spice_level: 2, allergens: ["Peanuts"], is_chef_special: true },
  },
  {
    id: "dish-19",
    category_id: "cat-4",
    name: "Mamidikaya Pulihora (Raw Mango Rice)",
    slug: "mamidikaya-pulihora",
    description: "Seasonal raw grated mango spiced rice tempered with green chillies, ginger juliennes, mustard, and curry leaves.",
    dietary_type: "VEGAN",
    image_url: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80",
    sort_order: 5,
    is_active: true,
    extra_metadata: { spice_level: 2, allergens: ["Peanuts"] },
  },
  {
    id: "dish-20",
    category_id: "cat-4",
    name: "Ulavacharu Dum Biryani",
    slug: "ulavacharu-dum-biryani",
    description: "Exquisite fusion biryani layered with rich horsegram reduction (ulavacharu), herbs, and fresh dairy cream.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80",
    sort_order: 6,
    is_active: true,
    extra_metadata: { spice_level: 2, allergens: ["Dairy"], is_chef_special: true },
  },
  {
    id: "dish-21",
    category_id: "cat-4",
    name: "Daddojanam (Curd Rice)",
    slug: "daddojanam-perugu-annam",
    description: "Temple style creamy curd rice tempered with mustard seeds, green chillies, ginger, and fresh pomegranate jewels.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    sort_order: 7,
    is_active: true,
    extra_metadata: { spice_level: 1, allergens: ["Dairy"] },
  },

  // 5. Curries & Pulusu
  {
    id: "dish-22",
    category_id: "cat-5",
    name: "Gutti Vankaya Koora",
    slug: "gutti-vankaya-koora",
    description: "Tender purple baby brinjals stuffed with a roasted blend of peanuts, sesame seeds, fresh coconut, coriander, and simmered in gravy.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    sort_order: 1,
    is_active: true,
    extra_metadata: { spice_level: 2, allergens: ["Peanuts", "Sesame"], is_chef_special: true },
  },
  {
    id: "dish-23",
    category_id: "cat-5",
    name: "Gongura Mamsam (Mutton Gongura)",
    slug: "gongura-mamsam",
    description: "The crown jewel of Andhra non-vegetarian feasts: tender lamb simmered with tangy sorrel leaves and red chilli spices.",
    dietary_type: "NON_VEG",
    image_url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
    sort_order: 2,
    is_active: true,
    extra_metadata: { spice_level: 3, is_chef_special: true },
  },
  {
    id: "dish-24",
    category_id: "cat-5",
    name: "Nellore Chepala Pulusu (Fish Curry)",
    slug: "nellore-chepala-pulusu",
    description: "Traditional freshwater Korrameenu fish slow-cooked in earthen pots with thick tamarind extract, fenugreek, and raw mango.",
    dietary_type: "NON_VEG",
    image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    sort_order: 3,
    is_active: true,
    extra_metadata: { spice_level: 3, allergens: ["Fish"], is_chef_special: true },
  },
  {
    id: "dish-25",
    category_id: "cat-5",
    name: "Natu Kodi Pulusu (Country Chicken)",
    slug: "natu-kodi-pulusu",
    description: "Free-range country chicken cooked in an authentic village-style spicy gravy, best enjoyed with Bagara rice or Garelu.",
    dietary_type: "NON_VEG",
    image_url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    sort_order: 4,
    is_active: true,
    extra_metadata: { spice_level: 3, is_chef_special: true },
  },
  {
    id: "dish-26",
    category_id: "cat-5",
    name: "Paneer Butter Masala Royale",
    slug: "paneer-butter-masala",
    description: "Velvety malai paneer cubes simmered in a slow-cooked cashew nut, butter, and sun-ripened tomato gravy.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    sort_order: 5,
    is_active: true,
    extra_metadata: { spice_level: 1, allergens: ["Dairy", "Nuts"] },
  },
  {
    id: "dish-27",
    category_id: "cat-5",
    name: "Mirchi Ka Salan",
    slug: "mirchi-ka-salan",
    description: "Classic Hyderabadi accompaniment for biryani featuring roasted green chillies in a sesame, peanut, and tamarind curry.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80",
    sort_order: 6,
    is_active: true,
    extra_metadata: { spice_level: 2, allergens: ["Peanuts", "Sesame"] },
  },

  // 6. Pappu, Sambar & Rasam
  {
    id: "dish-28",
    category_id: "cat-6",
    name: "Mudda Pappu with Pure Desi Ghee",
    slug: "mudda-pappu-ghee",
    description: "The auspicious opening course of every Telugu wedding: thick yellow toor dal mash topped with steaming hot ghee.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    sort_order: 1,
    is_active: true,
    extra_metadata: { spice_level: 0, allergens: ["Dairy"], is_chef_special: true },
  },
  {
    id: "dish-29",
    category_id: "cat-6",
    name: "Mamidikaya Pappu (Raw Mango Dal)",
    slug: "mamidikaya-pappu",
    description: "Hearty toor dal cooked with tart raw mango slices, tempered in pure ghee with mustard, garlic, and red chillies.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    sort_order: 2,
    is_active: true,
    extra_metadata: { spice_level: 2, is_chef_special: true },
  },
  {
    id: "dish-30",
    category_id: "cat-6",
    name: "Ulavacharu with Fresh Cream",
    slug: "ulavacharu-fresh-cream",
    description: "Slow-reduced horsegram broth seasoned with spices and served with a generous dollop of fresh thick dairy cream.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
    sort_order: 3,
    is_active: true,
    extra_metadata: { spice_level: 2, allergens: ["Dairy"], is_chef_special: true },
  },
  {
    id: "dish-31",
    category_id: "cat-6",
    name: "Andhra Drumstick Sambar",
    slug: "andhra-drumstick-sambar",
    description: "Slow-simmered lentil stew brimming with tender drumsticks, shallots, and freshly ground roasted coriander sambar masala.",
    dietary_type: "VEGAN",
    image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    sort_order: 4,
    is_active: true,
    extra_metadata: { spice_level: 2 },
  },
  {
    id: "dish-32",
    category_id: "cat-6",
    name: "Miriyala Rasam (Pepper Charu)",
    slug: "miriyala-rasam",
    description: "Pungent, tangy broth made from crushed black pepper, roasted cumin, garlic, and fresh country tomatoes.",
    dietary_type: "VEGAN",
    image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
    sort_order: 5,
    is_active: true,
    extra_metadata: { spice_level: 3 },
  },

  // 7. Podis, Pachadis & Accompaniments
  {
    id: "dish-33",
    category_id: "cat-7",
    name: "Andhra Gongura Pachadi",
    slug: "andhra-gongura-pachadi",
    description: "The undisputed Queen of Andhra pickles made from fresh sour sorrel leaves stone-ground with garlic and red chillies.",
    dietary_type: "VEGAN",
    image_url: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80",
    sort_order: 1,
    is_active: true,
    extra_metadata: { spice_level: 3, is_chef_special: true },
  },
  {
    id: "dish-34",
    category_id: "cat-7",
    name: "Kandi Podi with Ghee",
    slug: "kandi-podi-ghee",
    description: "Roasted spiced toor and chana dal powder stone-ground with red chillies and cumin, served with hot rice and ghee.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80",
    sort_order: 2,
    is_active: true,
    extra_metadata: { spice_level: 1, is_chef_special: true },
  },
  {
    id: "dish-35",
    category_id: "cat-7",
    name: "Avakaya Ooragaya (Cut Mango Pickle)",
    slug: "avakaya-ooragaya",
    description: "The quintessential Andhra mango pickle spiced with pungent mustard powder and cold-pressed sesame oil.",
    dietary_type: "VEGAN",
    image_url: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80",
    sort_order: 3,
    is_active: true,
    extra_metadata: { spice_level: 3, is_chef_special: true },
  },
  {
    id: "dish-36",
    category_id: "cat-7",
    name: "Perugu Vada (Dahi Vada)",
    slug: "perugu-vada",
    description: "Fluffy medu vadas steeped in seasoned whipped yogurt, garnished with boondi, roasted cumin, and fresh cilantro.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
    sort_order: 4,
    is_active: true,
    extra_metadata: { spice_level: 1, allergens: ["Dairy"] },
  },

  // 8. Traditional Sweets & Desserts
  {
    id: "dish-37",
    category_id: "cat-8",
    name: "Atreyapuram Pootharekulu",
    slug: "atreyapuram-pootharekulu",
    description: "Famous paper-thin rice starch sweet filled with powdered organic jaggery, pure ghee, and finely chopped dry fruits.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80",
    sort_order: 1,
    is_active: true,
    extra_metadata: { spice_level: 0, allergens: ["Dairy", "Nuts"], is_chef_special: true },
  },
  {
    id: "dish-38",
    category_id: "cat-8",
    name: "Nethi Bobbatlu (Puran Poli) with Ghee",
    slug: "nethi-bobbatlu",
    description: "Warm, melt-in-mouth sweet flatbreads stuffed with chana dal and jaggery paste, drizzled generously with steaming hot ghee.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=600&q=80",
    sort_order: 2,
    is_active: true,
    extra_metadata: { spice_level: 0, allergens: ["Dairy"], is_chef_special: true },
  },
  {
    id: "dish-39",
    category_id: "cat-8",
    name: "Poornam Boorelu",
    slug: "poornam-boorelu",
    description: "Golden crispy fried dumplings stuffed with sweet jaggery-coconut-chana dal poornam; a sacred Telugu wedding delicacy.",
    dietary_type: "VEGAN",
    image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
    sort_order: 3,
    is_active: true,
    extra_metadata: { spice_level: 0, is_chef_special: true },
  },
  {
    id: "dish-40",
    category_id: "cat-8",
    name: "Hyderabadi Double Ka Meetha",
    slug: "double-ka-meetha",
    description: "Nawabi royal dessert of ghee-fried bread rounds soaked in saffron, cardamom infused condensed milk, and garnished with silver vark and roasted nuts.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80",
    sort_order: 4,
    is_active: true,
    extra_metadata: { spice_level: 0, allergens: ["Dairy", "Nuts"], is_chef_special: true },
  },
  {
    id: "dish-41",
    category_id: "cat-8",
    name: "Qubani Ka Meetha with Vanilla Ice Cream",
    slug: "qubani-ka-meetha",
    description: "Slow-stewed Turkish dried apricot compote flavored with rose water, topped with apricot kernels and rich gourmet vanilla bean ice cream.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80",
    sort_order: 5,
    is_active: true,
    extra_metadata: { spice_level: 0, allergens: ["Dairy", "Nuts"], is_chef_special: true },
  },
  {
    id: "dish-42",
    category_id: "cat-8",
    name: "Hyderabadi Apricot Delight",
    slug: "apricot-delight",
    description: "Modern Hyderabadi wedding favorite featuring moist sponge cake soaked in apricot puree, layered with fresh cream and almond flakes.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&q=80",
    sort_order: 6,
    is_active: true,
    extra_metadata: { spice_level: 0, allergens: ["Dairy", "Nuts"], is_chef_special: true },
  },

  // 9. Live Stations
  {
    id: "dish-43",
    category_id: "cat-9",
    name: "Live MLA Pesarattu & Ghee Dosa Theatre",
    slug: "live-pesarattu-dosa-station",
    description: "Interactive live station serving sizzling hot ghee dosas, cheese dosas, and authentic MLA Pesarattu stuffed with Upma and ginger chutney.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80",
    sort_order: 1,
    is_active: true,
    extra_metadata: { spice_level: 2, is_chef_special: true },
  },
  {
    id: "dish-44",
    category_id: "cat-9",
    name: "Live Chaat Bazaar Counter",
    slug: "live-chaat-bazaar",
    description: "Live chefs crafting crisp Pani Puris with mint and teekha water, Dahi Puris, Sev Papdi Chaat, and Bhel Puri.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80",
    sort_order: 2,
    is_active: true,
    extra_metadata: { spice_level: 2, is_chef_special: true },
  },
  {
    id: "dish-45",
    category_id: "cat-9",
    name: "Live Hot Jalebi & Rabdi Station",
    slug: "live-jalebi-rabdi-station",
    description: "Live frying of spiral saffron jalebis dipped in sugar syrup, paired with chilled thick cardamom rabdi.",
    dietary_type: "VEG",
    image_url: "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80",
    sort_order: 3,
    is_active: true,
    extra_metadata: { spice_level: 0, allergens: ["Dairy"], is_chef_special: true },
  },
];

// ---------------------------------------------------------------------------
// Authentic Telugu & Hyderabadi Packages
// ---------------------------------------------------------------------------

export const SEED_PACKAGES: PackageDetail[] = [
  {
    id: "pkg-1",
    name: "Sri Krishna Devaraya Pelli Bhojanam",
    slug: "sri-krishna-devaraya-pelli-bhojanam",
    description: "The quintessential royal vegetarian wedding feast served traditionally on plantain leaf or grand buffet. Includes 3 sweets, 2 podis with ghee, Gutti Vankaya, Chintapandu Pulihora, Ulavacharu with cream, and live Paan counter.",
    image_url: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1000&q=80",
    min_guests: 100,
    max_guests: 5000,
    sort_order: 1,
    is_active: true,
    indicative_price: 850,
    package_items: [
      { id: "pi-1", package_id: "pkg-1", menu_item_id: "dish-28", inclusion_type: "MANDATORY", sort_order: 1, menu_item: SEED_MENU_ITEMS[27] }, // Mudda Pappu
      { id: "pi-2", package_id: "pkg-1", menu_item_id: "dish-34", inclusion_type: "MANDATORY", sort_order: 2, menu_item: SEED_MENU_ITEMS[33] }, // Kandi Podi
      { id: "pi-3", package_id: "pkg-1", menu_item_id: "dish-33", inclusion_type: "MANDATORY", sort_order: 3, menu_item: SEED_MENU_ITEMS[32] }, // Gongura Pachadi
      { id: "pi-4", package_id: "pkg-1", menu_item_id: "dish-35", inclusion_type: "MANDATORY", sort_order: 4, menu_item: SEED_MENU_ITEMS[34] }, // Avakaya
      { id: "pi-5", package_id: "pkg-1", menu_item_id: "dish-22", inclusion_type: "MANDATORY", sort_order: 5, menu_item: SEED_MENU_ITEMS[21] }, // Gutti Vankaya
      { id: "pi-6", package_id: "pkg-1", menu_item_id: "dish-30", inclusion_type: "MANDATORY", sort_order: 6, menu_item: SEED_MENU_ITEMS[29] }, // Ulavacharu with Cream
      { id: "pi-7", package_id: "pkg-1", menu_item_id: "dish-31", inclusion_type: "MANDATORY", sort_order: 7, menu_item: SEED_MENU_ITEMS[30] }, // Sambar
    ],
    selection_groups: [
      {
        id: "sg-1",
        package_id: "pkg-1",
        name: "Welcome Drinks (Choose 1)",
        description: "Select 1 traditional welcome beverage for guest arrivals",
        min_selections: 1,
        max_selections: 1,
        sort_order: 1,
        is_required: true,
        items: [
          { id: "sgi-1", selection_group_id: "sg-1", menu_item_id: "dish-1", menu_item: SEED_MENU_ITEMS[0] }, // Sugandhi Sharbat
          { id: "sgi-2", selection_group_id: "sg-1", menu_item_id: "dish-2", menu_item: SEED_MENU_ITEMS[1] }, // Majjiga
          { id: "sgi-3", selection_group_id: "sg-1", menu_item_id: "dish-3", menu_item: SEED_MENU_ITEMS[2] }, // Coconut Mint
        ],
      },
      {
        id: "sg-2",
        package_id: "pkg-1",
        name: "Festive Rice Course (Choose 1)",
        description: "Select 1 signature festive rice specialty",
        min_selections: 1,
        max_selections: 1,
        sort_order: 2,
        is_required: true,
        items: [
          { id: "sgi-4", selection_group_id: "sg-2", menu_item_id: "dish-18", menu_item: SEED_MENU_ITEMS[17] }, // Chintapandu Pulihora
          { id: "sgi-5", selection_group_id: "sg-2", menu_item_id: "dish-19", menu_item: SEED_MENU_ITEMS[18] }, // Mamidikaya Pulihora
          { id: "sgi-6", selection_group_id: "sg-2", menu_item_id: "dish-17", menu_item: SEED_MENU_ITEMS[16] }, // Bagara Rice
        ],
      },
      {
        id: "sg-3",
        package_id: "pkg-1",
        name: "Traditional Wedding Mithai (Choose 2)",
        description: "Select 2 authentic Telugu sweets",
        min_selections: 2,
        max_selections: 2,
        sort_order: 3,
        is_required: true,
        items: [
          { id: "sgi-7", selection_group_id: "sg-3", menu_item_id: "dish-37", menu_item: SEED_MENU_ITEMS[36] }, // Pootharekulu
          { id: "sgi-8", selection_group_id: "sg-3", menu_item_id: "dish-38", menu_item: SEED_MENU_ITEMS[37] }, // Bobbatlu
          { id: "sgi-9", selection_group_id: "sg-3", menu_item_id: "dish-39", menu_item: SEED_MENU_ITEMS[38] }, // Boorelu
        ],
      },
    ],
    addons: [
      { id: "pa-1", package_id: "pkg-1", menu_item_id: "dish-43", display_name: "Live MLA Pesarattu Counter Add-on", is_active: true, sort_order: 1, menu_item: SEED_MENU_ITEMS[42] },
    ],
  },
  {
    id: "pkg-2",
    name: "Hyderabadi Shahi Dawat",
    slug: "hyderabadi-shahi-dawat",
    description: "The royal Nawabi wedding feast featuring Hyderabadi Mutton Dum Biryani, Chicken Dum Biryani, Apollo Fish, Andhra Chilli Chicken, Mirchi Ka Salan, Bagara Baingan, Double Ka Meetha, and Qubani Ka Meetha.",
    image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80",
    min_guests: 100,
    max_guests: 4000,
    sort_order: 2,
    is_active: true,
    indicative_price: 1250,
    package_items: [
      { id: "pi-8", package_id: "pkg-2", menu_item_id: "dish-15", inclusion_type: "MANDATORY", sort_order: 1, menu_item: SEED_MENU_ITEMS[14] }, // Mutton Biryani
      { id: "pi-9", package_id: "pkg-2", menu_item_id: "dish-27", inclusion_type: "MANDATORY", sort_order: 2, menu_item: SEED_MENU_ITEMS[26] }, // Mirchi Ka Salan
      { id: "pi-10", package_id: "pkg-2", menu_item_id: "dish-40", inclusion_type: "MANDATORY", sort_order: 3, menu_item: SEED_MENU_ITEMS[39] }, // Double Ka Meetha
      { id: "pi-11", package_id: "pkg-2", menu_item_id: "dish-41", inclusion_type: "MANDATORY", sort_order: 4, menu_item: SEED_MENU_ITEMS[40] }, // Qubani Ka Meetha
    ],
    selection_groups: [
      {
        id: "sg-4",
        package_id: "pkg-2",
        name: "Non-Veg Starters (Choose 2)",
        description: "Select 2 live starters passed during reception",
        min_selections: 2,
        max_selections: 2,
        sort_order: 1,
        is_required: true,
        items: [
          { id: "sgi-10", selection_group_id: "sg-4", menu_item_id: "dish-11", menu_item: SEED_MENU_ITEMS[10] }, // Chilli Chicken
          { id: "sgi-11", selection_group_id: "sg-4", menu_item_id: "dish-12", menu_item: SEED_MENU_ITEMS[11] }, // Apollo Fish
          { id: "sgi-12", selection_group_id: "sg-4", menu_item_id: "dish-13", menu_item: SEED_MENU_ITEMS[12] }, // Royyala Vepudu
          { id: "sgi-13", selection_group_id: "sg-4", menu_item_id: "dish-14", menu_item: SEED_MENU_ITEMS[13] }, // Mutton Sukka
        ],
      },
      {
        id: "sg-5",
        package_id: "pkg-2",
        name: "Main Course Gravy (Choose 1)",
        description: "Select 1 rich gravy specialty",
        min_selections: 1,
        max_selections: 1,
        sort_order: 2,
        is_required: true,
        items: [
          { id: "sgi-14", selection_group_id: "sg-5", menu_item_id: "dish-23", menu_item: SEED_MENU_ITEMS[22] }, // Gongura Mamsam
          { id: "sgi-15", selection_group_id: "sg-5", menu_item_id: "dish-24", menu_item: SEED_MENU_ITEMS[23] }, // Nellore Chepala Pulusu
          { id: "sgi-16", selection_group_id: "sg-5", menu_item_id: "dish-25", menu_item: SEED_MENU_ITEMS[24] }, // Natu Kodi Pulusu
        ],
      },
    ],
    addons: [
      { id: "pa-2", package_id: "pkg-2", menu_item_id: "dish-42", display_name: "Apricot Delight Dessert Studio", is_active: true, sort_order: 1, menu_item: SEED_MENU_ITEMS[41] },
    ],
  },
  {
    id: "pkg-3",
    name: "Godavari & Rayalaseema Ruchulu",
    slug: "godavari-rayalaseema-ruchulu",
    description: "Authentic coastal Andhra & Rayalaseema spicy celebration spread featuring Nellore Chepala Pulusu, Royyala Vepudu, Natu Kodi Pulusu, Bagara Rice, Poornam Boorelu, and Pootharekulu.",
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80",
    min_guests: 50,
    max_guests: 2000,
    sort_order: 3,
    is_active: true,
    indicative_price: 1050,
    package_items: [
      { id: "pi-12", package_id: "pkg-3", menu_item_id: "dish-17", inclusion_type: "MANDATORY", sort_order: 1, menu_item: SEED_MENU_ITEMS[16] }, // Bagara Rice
      { id: "pi-13", package_id: "pkg-3", menu_item_id: "dish-23", inclusion_type: "MANDATORY", sort_order: 2, menu_item: SEED_MENU_ITEMS[22] }, // Gongura Mamsam
      { id: "pi-14", package_id: "pkg-3", menu_item_id: "dish-33", inclusion_type: "MANDATORY", sort_order: 3, menu_item: SEED_MENU_ITEMS[32] }, // Gongura Pachadi
    ],
    selection_groups: [
      {
        id: "sg-6",
        package_id: "pkg-3",
        name: "Coastal Seafood or Poultry Starters (Choose 2)",
        description: "Select 2 spicy regional starters",
        min_selections: 2,
        max_selections: 2,
        sort_order: 1,
        is_required: true,
        items: [
          { id: "sgi-17", selection_group_id: "sg-6", menu_item_id: "dish-13", menu_item: SEED_MENU_ITEMS[12] }, // Royyala Vepudu
          { id: "sgi-18", selection_group_id: "sg-6", menu_item_id: "dish-11", menu_item: SEED_MENU_ITEMS[10] }, // Chilli Chicken
          { id: "sgi-19", selection_group_id: "sg-6", menu_item_id: "dish-12", menu_item: SEED_MENU_ITEMS[11] }, // Apollo Fish
        ],
      },
    ],
    addons: [],
  },
  {
    id: "pkg-4",
    name: "Gruhapravesam & Puja Sattvic Thali",
    slug: "gruhapravesam-sattvic-thali",
    description: "Pure traditional No Onion No Garlic auspicious feast. Includes Rava Kesari Prasadam, Katte Pongali, Mamidikaya Pulihora, Mudda Pappu with ghee, Dondakaya Vepudu, Perugu Vada, and Majjiga.",
    image_url: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1000&q=80",
    min_guests: 30,
    max_guests: 500,
    sort_order: 4,
    is_active: true,
    indicative_price: 450,
    package_items: [
      { id: "pi-15", package_id: "pkg-4", menu_item_id: "dish-28", inclusion_type: "MANDATORY", sort_order: 1, menu_item: SEED_MENU_ITEMS[27] }, // Mudda Pappu
      { id: "pi-16", package_id: "pkg-4", menu_item_id: "dish-19", inclusion_type: "MANDATORY", sort_order: 2, menu_item: SEED_MENU_ITEMS[18] }, // Mamidikaya Pulihora
      { id: "pi-17", package_id: "pkg-4", menu_item_id: "dish-10", inclusion_type: "MANDATORY", sort_order: 3, menu_item: SEED_MENU_ITEMS[9] }, // Dondakaya Vepudu
      { id: "pi-18", package_id: "pkg-4", menu_item_id: "dish-36", inclusion_type: "MANDATORY", sort_order: 4, menu_item: SEED_MENU_ITEMS[35] }, // Perugu Vada
    ],
    selection_groups: [
      {
        id: "sg-7",
        package_id: "pkg-4",
        name: "Traditional Sweet Choice (Choose 1)",
        description: "Select 1 traditional auspicious sweet",
        min_selections: 1,
        max_selections: 1,
        sort_order: 1,
        is_required: true,
        items: [
          { id: "sgi-20", selection_group_id: "sg-7", menu_item_id: "dish-38", menu_item: SEED_MENU_ITEMS[37] }, // Bobbatlu
          { id: "sgi-21", selection_group_id: "sg-7", menu_item_id: "dish-39", menu_item: SEED_MENU_ITEMS[38] }, // Boorelu
        ],
      },
    ],
    addons: [],
  },
  {
    id: "pkg-5",
    name: "Srimantham (Seemantham) 7-Rice & Sweet Spread",
    slug: "seemantham-7-rice-spread",
    description: "Celebratory feast featuring 7 traditional Chitrannam rice varieties (Chintapandu Pulihora, Mamidikaya Pulihora, Kobbari Annam, Daddojanam, Bisibelebath, Pudina Rice, Sweet Pongal), Bobbatlu, and Vadiyalu.",
    image_url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1000&q=80",
    min_guests: 40,
    max_guests: 600,
    sort_order: 5,
    is_active: true,
    indicative_price: 550,
    package_items: [
      { id: "pi-19", package_id: "pkg-5", menu_item_id: "dish-18", inclusion_type: "MANDATORY", sort_order: 1, menu_item: SEED_MENU_ITEMS[17] }, // Tamarind Rice
      { id: "pi-20", package_id: "pkg-5", menu_item_id: "dish-19", inclusion_type: "MANDATORY", sort_order: 2, menu_item: SEED_MENU_ITEMS[18] }, // Mango Rice
      { id: "pi-21", package_id: "pkg-5", menu_item_id: "dish-21", inclusion_type: "MANDATORY", sort_order: 3, menu_item: SEED_MENU_ITEMS[20] }, // Daddojanam
      { id: "pi-22", package_id: "pkg-5", menu_item_id: "dish-38", inclusion_type: "MANDATORY", sort_order: 4, menu_item: SEED_MENU_ITEMS[37] }, // Bobbatlu
    ],
    selection_groups: [],
    addons: [],
  },
  {
    id: "pkg-6",
    name: "Modern Sangeeth Live Counter Extravaganza",
    slug: "sangeeth-live-counter-extravaganza",
    description: "High-energy cocktail party layout featuring Live Dosa & MLA Pesarattu Theatre, Live Chaat Bazaar, Tandoori Platters, Chilli Chicken, Paneer Tikka, and Live Hot Jalebi & Rabdi Station.",
    image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80",
    min_guests: 50,
    max_guests: 1500,
    sort_order: 6,
    is_active: true,
    indicative_price: 950,
    package_items: [
      { id: "pi-23", package_id: "pkg-6", menu_item_id: "dish-43", inclusion_type: "MANDATORY", sort_order: 1, menu_item: SEED_MENU_ITEMS[42] }, // Live Dosa / Pesarattu
      { id: "pi-24", package_id: "pkg-6", menu_item_id: "dish-44", inclusion_type: "MANDATORY", sort_order: 2, menu_item: SEED_MENU_ITEMS[43] }, // Live Chaat
      { id: "pi-25", package_id: "pkg-6", menu_item_id: "dish-45", inclusion_type: "MANDATORY", sort_order: 3, menu_item: SEED_MENU_ITEMS[44] }, // Live Jalebi
    ],
    selection_groups: [
      {
        id: "sg-8",
        package_id: "pkg-6",
        name: "Cocktail Starters (Choose 2)",
        description: "Select 2 hot starters",
        min_selections: 2,
        max_selections: 2,
        sort_order: 1,
        is_required: true,
        items: [
          { id: "sgi-22", selection_group_id: "sg-8", menu_item_id: "dish-7", menu_item: SEED_MENU_ITEMS[6] }, // Gongura Paneer Tikka
          { id: "sgi-23", selection_group_id: "sg-8", menu_item_id: "dish-11", menu_item: SEED_MENU_ITEMS[10] }, // Chilli Chicken
          { id: "sgi-24", selection_group_id: "sg-8", menu_item_id: "dish-12", menu_item: SEED_MENU_ITEMS[11] }, // Apollo Fish
        ],
      },
    ],
    addons: [],
  },
];

// ---------------------------------------------------------------------------
// Client Methods with Backend Fetch + Seed Data Fallback
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

// ---------------------------------------------------------------------------
// Phase 6: Pricing & Estimate Engine APIs
// ---------------------------------------------------------------------------

export async function getEventEstimate(
  eventId: string,
  token?: string
): Promise<{ data: any; isStale: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/events/${eventId}/estimate`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (res.ok) {
      const json = await res.json();
      return {
        data: json.data,
        isStale: json.meta?.status === "STALE",
      };
    }
    const json = await res.json().catch(() => ({}));
    return { data: null, isStale: false, error: json.detail?.message || "Failed to load estimate" };
  } catch (err: any) {
    return { data: null, isStale: false, error: err.message || "Network error" };
  }
}

export async function calculateEventEstimate(
  eventId: string,
  configurationVersion?: number,
  token?: string
): Promise<{ data: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/events/${eventId}/estimate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(configurationVersion ? { configuration_version: configurationVersion } : {}),
    });
    const json = await res.json();
    if (!res.ok) {
      return { data: null, error: json.detail?.message || "Failed to calculate estimate" };
    }
    return { data: json.data };
  } catch (err: any) {
    return { data: null, error: err.message || "Network error" };
  }
}

export async function getBudgetOptimizations(
  eventId: string,
  targetBudget?: number,
  token?: string
): Promise<{ data: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/events/${eventId}/optimize-budget`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(targetBudget ? { target_budget: targetBudget } : {}),
    });
    const json = await res.json();
    if (!res.ok) {
      return { data: null, error: json.detail?.message || "Failed to generate recommendations" };
    }
    return { data: json.data };
  } catch (err: any) {
    return { data: null, error: err.message || "Network error" };
  }
}

export async function applyBudgetRecommendation(
  eventId: string,
  recommendationId: string,
  baseVersion: number,
  token?: string
): Promise<{ data: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/events/${eventId}/recommendations/${recommendationId}/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ base_version: baseVersion }),
    });
    const json = await res.json();
    if (!res.ok) {
      return { data: null, error: json.detail?.message || "Failed to apply recommendation" };
    }
    return { data: json.data };
  } catch (err: any) {
    return { data: null, error: err.message || "Network error" };
  }
}

// ---------------------------------------------------------------------------
// Authentication & User Session APIs
// ---------------------------------------------------------------------------

export async function requestOTP(
  phoneNumber: string,
  countryCode: string = "+91"
): Promise<{ data: OTPRequestResult | null; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/otp/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone_number: phoneNumber,
        country_code: countryCode,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      return {
        data: null,
        error: json.detail?.message || json.message || "Failed to send OTP",
      };
    }
    return { data: json.data };
  } catch (err: any) {
    return { data: null, error: err.message || "Network error connecting to auth service" };
  }
}

export async function verifyOTP(
  challengeId: string,
  otpCode: string
): Promise<{ data: OTPVerifyResult | null; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        challenge_id: challengeId,
        otp: otpCode,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      return {
        data: null,
        error: json.detail?.message || json.message || "Invalid or expired OTP",
      };
    }
    return { data: json.data };
  } catch (err: any) {
    return { data: null, error: err.message || "Network error connecting to auth service" };
  }
}

export async function getCurrentUser(
  token?: string
): Promise<{ data: User | null; error?: string }> {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers,
      credentials: "include",
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { data: null, error: json.detail?.message || "Not authenticated" };
    }
    const json = await res.json();
    return { data: json.data };
  } catch (err: any) {
    return { data: null, error: err.message || "Network error" };
  }
}

export async function logoutUser(token?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers,
      credentials: "include",
    });
    if (res.ok || res.status === 204) {
      return { success: true };
    }
    return { success: false, error: "Failed to logout" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}

