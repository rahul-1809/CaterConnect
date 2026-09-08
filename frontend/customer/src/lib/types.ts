export type DietaryType = "VEG" | "NON_VEG" | "VEGAN" | "EGG";

export interface FunctionType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface CateringOffering {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  dietary_type: DietaryType | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  extra_metadata?: {
    spice_level?: number; // 1 to 3
    allergens?: string[];
    is_chef_special?: boolean;
    prep_time_minutes?: number;
    calories?: number;
  } | null;
}

export interface PackageItem {
  id: string;
  package_id: string;
  menu_item_id: string;
  inclusion_type: "MANDATORY" | "INCLUDED";
  sort_order: number;
  menu_item?: MenuItem;
}

export interface PackageSelectionGroupItem {
  id: string;
  selection_group_id: string;
  menu_item_id: string;
  menu_item?: MenuItem;
}

export interface PackageSelectionGroup {
  id: string;
  package_id: string;
  name: string;
  description: string | null;
  min_selections: number;
  max_selections: number;
  sort_order: number;
  is_required: boolean;
  items: PackageSelectionGroupItem[];
}

export interface PackageAddon {
  id: string;
  package_id: string;
  menu_item_id: string;
  display_name: string | null;
  is_active: boolean;
  sort_order: number;
  menu_item?: MenuItem;
}

export interface Package {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  min_guests: number | null;
  max_guests: number | null;
  sort_order: number;
  is_active: boolean;
  indicative_price?: number; // per person indicative
}

export interface PackageDetail extends Package {
  package_items: PackageItem[];
  selection_groups: PackageSelectionGroup[];
  addons: PackageAddon[];
}

export type EventStatus = "DRAFT" | "SUBMITTED" | "CANCELLED" | "COMPLETED";

export interface EventMenuItem {
  id: string;
  event_id: string;
  menu_item_id: string;
  source_type: "PACKAGE" | "CUSTOM" | "ADDON" | "AI";
  selection_group_id?: string | null;
  quantity?: number;
  is_included: boolean;
  name?: string | null;
  category_name?: string | null;
  dietary_type?: DietaryType | null;
  price?: number | null;
  image_url?: string | null;
  created_at: string;
}

export interface EventSummary {
  id: string;
  status: EventStatus;
  configuration_version: number;
  guest_count?: number | null;
  budget_min?: number | null;
  budget_max?: number | null;
  event_date?: string | null;
  event_time?: string | null;
  venue_name?: string | null;
  function_name?: string | null;
  offering_name?: string | null;
  package_name?: string | null;
  items_count: number;
  created_at: string;
  updated_at: string;
}

export interface EventDetail {
  id: string;
  customer_id: string;
  caterer_id: string;
  status: EventStatus;
  configuration_version: number;
  function_type_id?: string | null;
  offering_id?: string | null;
  package_id?: string | null;
  guest_count?: number | null;
  budget: {
    min?: number | null;
    max?: number | null;
    currency: string;
  };
  event_date?: string | null;
  event_time?: string | null;
  timezone: string;
  venue: {
    name?: string | null;
    address?: string | null;
    notes?: string | null;
  };
  customer_notes?: string | null;
  function?: { id: string; name: string; slug: string } | null;
  offering?: { id: string; name: string; slug: string } | null;
  package?: { id: string; name: string; slug: string; description?: string | null } | null;
  menu_items: EventMenuItem[];
  created_at: string;
  updated_at: string;
}

export interface EventVersion {
  id: string;
  event_id: string;
  version_number: number;
  snapshot: Record<string, any>;
  change_reason?: string | null;
  created_at: string;
}

