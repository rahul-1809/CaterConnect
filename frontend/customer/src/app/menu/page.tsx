"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Utensils,
  Search,
  Flame,
  Sparkles,
  AlertCircle,
  Tag,
  ArrowRight,
  Filter,
} from "lucide-react";
import { getMenuCategories, getMenuItems } from "@/lib/api";
import { MenuCategory, MenuItem } from "@/lib/types";

export default function MenuCatalogPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedDiet, setSelectedDiet] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [cats, dishes] = await Promise.all([
        getMenuCategories(),
        getMenuItems({
          categoryId: selectedCategory === "ALL" ? undefined : selectedCategory,
          dietaryType: selectedDiet === "ALL" ? undefined : selectedDiet,
          search: searchTerm.trim() || undefined,
        }),
      ]);
      setCategories(cats);
      setItems(dishes);
      setLoading(false);
    }
    load();
  }, [selectedCategory, selectedDiet, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
          <Utensils className="w-3.5 h-3.5" /> Culinary Repertoire
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
          Artisanal Menu Catalog
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Explore our handcrafted dishes across traditional, contemporary, and fusion styles with real-time dietary and category filtering.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        {/* Search + Dietary Bar */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search dishes (e.g. Paneer, Biryani, Tikka)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>

          {/* Dietary Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: "ALL", label: "All Items" },
              { id: "VEG", label: "Pure Veg 🟢" },
              { id: "NON_VEG", label: "Non-Veg 🔴" },
              { id: "VEGAN", label: "Vegan 🌱" },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDiet(d.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedDiet === d.id
                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/25"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              selectedCategory === "ALL"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-orange-500"
            }`}
          >
            All Courses ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-orange-500"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
          <Utensils className="w-12 h-12 text-zinc-400 mx-auto" />
          <h3 className="text-xl font-bold">No dishes found</h3>
          <p className="text-sm text-zinc-500">Try changing your search terms or dietary filters.</p>
          <button
            onClick={() => {
              setSelectedCategory("ALL");
              setSelectedDiet("ALL");
              setSearchTerm("");
            }}
            className="px-5 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((dish) => (
            <div
              key={dish.id}
              className="rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-52 w-full overflow-hidden bg-zinc-800">
                  <Image
                    src={
                      dish.image_url ||
                      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80"
                    }
                    alt={dish.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {dish.extra_metadata?.is_chef_special && (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-amber-500 text-white shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Chef Signature
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase shadow-sm ${
                        dish.dietary_type === "VEG"
                          ? "bg-emerald-500 text-white"
                          : dish.dietary_type === "NON_VEG"
                          ? "bg-red-500 text-white"
                          : "bg-teal-500 text-white"
                      }`}
                    >
                      {dish.dietary_type}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="font-bold text-xl text-zinc-900 dark:text-white group-hover:text-orange-600 transition-colors">
                    {dish.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {dish.description}
                  </p>

                  {/* Metadata tags */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {dish.extra_metadata?.spice_level !== undefined && dish.extra_metadata.spice_level > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-[11px] font-bold">
                        <Flame className="w-3 h-3 text-red-500 fill-current" />
                        {"Mild Spice,Medium Spice,Hot & Spiced".split(",")[dish.extra_metadata.spice_level - 1] || "Spiced"}
                      </span>
                    )}

                    {dish.extra_metadata?.allergens && dish.extra_metadata.allergens.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] font-medium">
                        Contains: {dish.extra_metadata.allergens.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-orange-600 dark:text-orange-400">
                  <Link href={`/menu/${dish.id}`} className="hover:underline flex items-center gap-1">
                    <span>View Culinary Story & Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
