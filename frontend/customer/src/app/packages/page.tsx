"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  PackageCheck,
  Search,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { getPackages } from "@/lib/api";
import { Package } from "@/lib/types";

function PackagesList() {
  const searchParams = useSearchParams();
  const initialGuests = Number(searchParams.get("guests")) || 150;

  const [packages, setPackages] = useState<Package[]>([]);
  const [guestCount, setGuestCount] = useState<number>(initialGuests);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getPackages({
        guestCount: guestCount > 0 ? guestCount : undefined,
        search: searchTerm.trim() || undefined,
      });
      setPackages(data);
      setLoading(false);
    }
    load();
  }, [guestCount, searchTerm]);

  return (
    <div className="space-y-12">
      {/* Search & Filter Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Keyword Search */}
          <div className="md:col-span-6 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search packages by name or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>

          {/* Guest Count Range Filter */}
          <div className="md:col-span-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-orange-600" /> Filter by Guest Size
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 font-extrabold text-sm">
                {guestCount} Guests
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="1500"
              step="20"
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
          <PackageCheck className="w-12 h-12 text-zinc-400 mx-auto" />
          <h3 className="text-xl font-bold">No packages match the criteria</h3>
          <p className="text-sm text-zinc-500">
            Try adjusting your guest count filter or searching for another term.
          </p>
          <button
            onClick={() => {
              setGuestCount(150);
              setSearchTerm("");
            }}
            className="px-5 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-56 w-full overflow-hidden bg-zinc-800">
                  <Image
                    src={
                      pkg.image_url ||
                      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={pkg.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/20">
                      <Users className="w-3.5 h-3.5 text-orange-400" />
                      {pkg.min_guests ? `${pkg.min_guests} - ${pkg.max_guests} Guests` : "Flexible Size"}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white group-hover:text-orange-600 transition-colors">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Artisanal Welcome Drinks & Starters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Full Multi-Course Main Buffet & Breads</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Warm Dessert & Mithai Presentation</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  href={`/packages/${pkg.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-md shadow-orange-600/20 transition-all duration-200"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Inspect Menu & Selections</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PackagesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
          <PackageCheck className="w-3.5 h-3.5" /> Curated Packages
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
          Catering Packages & Menus
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Filter packages by your expected guest count and discover curated multi-course menus ready for instant customization.
        </p>
      </div>

      <Suspense fallback={<div className="h-64 rounded-3xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />}>
        <PackagesList />
      </Suspense>
    </div>
  );
}
