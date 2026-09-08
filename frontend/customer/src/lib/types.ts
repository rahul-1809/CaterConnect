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
