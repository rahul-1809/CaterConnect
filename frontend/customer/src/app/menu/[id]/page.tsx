"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Utensils,
  ArrowLeft,
  Flame,
  Sparkles,
  ShieldAlert,
  ChefHat,
  Heart,
  PackageCheck,
} from "lucide-react";
import { getMenuItemById } from "@/lib/api";
import { MenuItem } from "@/lib/types";

export default function MenuItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [dish, setDish] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getMenuItemById(resolvedParams.id);
      setDish(data);
      setLoading(false);
    }
    load();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse space-y-8">
        <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        <h1 className="text-3xl font-bold">Dish Not Found</h1>
        <p className="text-zinc-500">The selected menu item could not be retrieved.</p>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 text-white font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back link */}
      <div>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Menu Catalog
        </Link>
      </div>

      {/* Main Dish Card */}
      <div className="rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl">
        <div className="relative h-80 sm:h-96 w-full bg-zinc-900">
          <Image
            src={
              dish.image_url ||
              "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80"
            }
            alt={dish.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-md ${
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

          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            {dish.extra_metadata?.is_chef_special && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-md">
                <Sparkles className="w-3.5 h-3.5" /> Chef Signature Selection
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-black">{dish.name}</h1>
          </div>
        </div>

        <div className="p-6 sm:p-10 space-y-8">
          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Culinary Description
            </h3>
            <p className="text-base sm:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
              {dish.description}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            {/* Spice Level */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700 space-y-1">
              <span className="text-[11px] font-bold uppercase text-zinc-400 block">Spice Profile</span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-red-600 dark:text-red-400">
                <Flame className="w-4 h-4 fill-current" />
                <span>
                  {dish.extra_metadata?.spice_level === 1
                    ? "Mild & Fragrant"
                    : dish.extra_metadata?.spice_level === 2
                    ? "Medium Spicy"
                    : dish.extra_metadata?.spice_level === 3
                    ? "Hot & Robust"
                    : "Delicate Flavor"}
                </span>
              </div>
            </div>

            {/* Allergens */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700 space-y-1">
              <span className="text-[11px] font-bold uppercase text-zinc-400 block">Allergen Advice</span>
              <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                {dish.extra_metadata?.allergens && dish.extra_metadata.allergens.length > 0
                  ? dish.extra_metadata.allergens.join(", ")
                  : "None declared"}
              </div>
            </div>

            {/* Banquet Suitability */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700 space-y-1">
              <span className="text-[11px] font-bold uppercase text-zinc-400 block">Service Style</span>
              <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                Live Counter & Buffet
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 hover:text-orange-500"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Find Packages Featuring This Dish</span>
            </Link>

            <Link
              href="/menu"
              className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 font-bold text-xs shadow-md transition-colors"
            >
              Explore Other Dishes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
