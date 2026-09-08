"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  Users,
  UtensilsCrossed,
  ChefHat,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  Star,
} from "lucide-react";
import {
  getFunctionTypes,
  getPackages,
  getMenuCategories,
  getMenuItems,
} from "@/lib/api";
import { FunctionType, MenuCategory, MenuItem, Package } from "@/lib/types";

export default function HomePage() {
  const [functions, setFunctions] = useState<FunctionType[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [featuredDishes, setFeaturedDishes] = useState<MenuItem[]>([]);
  const [selectedGuestRange, setSelectedGuestRange] = useState<number>(150);
  const [activeDietFilter, setActiveDietFilter] = useState<string>("ALL");

  useEffect(() => {
    async function loadData() {
      const [fns, pkgs, cats, dishes] = await Promise.all([
        getFunctionTypes(),
        getPackages(),
        getMenuCategories(),
        getMenuItems(),
      ]);
      setFunctions(fns);
      setPackages(pkgs);
      setCategories(cats);
      setFeaturedDishes(dishes.slice(0, 6));
    }
    loadData();
  }, []);

  const filteredDishes =
    activeDietFilter === "ALL"
      ? featuredDishes
      : featuredDishes.filter((d) => d.dietary_type === activeDietFilter);

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* ========================================================================= */}
      {/* Hero Section */}
      {/* ========================================================================= */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-orange-50/60 via-amber-50/30 to-transparent dark:from-zinc-900/60 dark:via-zinc-950 dark:to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/80 text-orange-800 dark:text-orange-300 text-xs font-bold uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                Authentic Telugu & Hyderabadi Catering Heritage
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-900 dark:text-white tracking-tight leading-[1.1]">
                Grand Vindhu Bhojanam for Life’s Greatest{" "}
                <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 bg-clip-text text-transparent">
                  Celebrations.
                </span>
              </h1>

              <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl font-normal leading-relaxed mx-auto lg:mx-0">
                From traditional Andhra & Telangana <em>Pelli Bhojanam</em> on fresh banana leaves to royal Hyderabadi Dum Biryani banquets — experience time-honored recipes, pure ghee delicacies, and live culinary counters.
              </p>

              {/* Interactive Quick Discovery Tool */}
              <div className="pt-4 max-w-xl mx-auto lg:mx-0">
                <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-orange-950/5 space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-orange-600" /> Expected Guest Count
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 font-extrabold text-sm">
                      {selectedGuestRange} Guests
                    </span>
                  </div>

                  <input
                    type="range"
                    min="20"
                    max="1000"
                    step="20"
                    value={selectedGuestRange}
                    onChange={(e) => setSelectedGuestRange(Number(e.target.value))}
                    className="w-full accent-orange-600 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
                  />

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link
                      href={`/packages?guests=${selectedGuestRange}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm shadow-md shadow-orange-600/25 hover:shadow-orange-600/35 transition-all duration-200"
                    >
                      <span>Find Matching Packages</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/menu"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-sm transition-all duration-200"
                    >
                      <UtensilsCrossed className="w-4 h-4" />
                      Browse Full Menu
                    </Link>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% FSSAI Certified
                </span>
                <span className="flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-orange-600" /> Master Telugu Chefs
                </span>
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-600" /> Live Tawa & Dum Theatres
                </span>
              </div>
            </div>

            {/* Hero Image / Visual Grid */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Floating Rating Pill */}
                <div className="absolute -top-4 -left-4 z-20 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-zinc-900 dark:text-white">4.9 / 5.0 Star Rating</div>
                    <div className="text-[10px] text-zinc-500">From 1,200+ Telugu Banquets Hosted</div>
                  </div>
                </div>

                {/* Main Visual Image Card */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-800 aspect-[4/5] bg-zinc-900">
                  <Image
                    src="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80"
                    alt="Authentic Telugu Wedding Bhojanam"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                    <span className="px-3 py-1 rounded-full bg-orange-600 text-[11px] font-bold uppercase tracking-wider inline-block">
                      Signature Showcase
                    </span>
                    <h3 className="text-xl font-bold">Godavari Grand Pelli Bhojanam</h3>
                    <p className="text-xs text-zinc-300">Mudda Pappu, Avakaya, Gutti Vankaya, Pootharekulu & live Ghee counters.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* Function Types Section */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block mb-2">
              Event Types & Functions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              Bespoke Menus for Every Occasion
            </h2>
          </div>
          <Link
            href="/functions"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-500 transition-colors"
          >
            <span>View All Event Types</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {functions.map((fn) => (
            <Link
              key={fn.id}
              href={`/functions/${fn.id}`}
              className="group relative rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative h-56 w-full overflow-hidden bg-zinc-800">
                <Image
                  src={fn.image_url || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80"}
                  alt={fn.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-xs font-bold text-zinc-900 dark:text-white shadow-sm flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-600" />
                    Specialty Service
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-orange-600 transition-colors">
                    {fn.name}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                    {fn.description || "Tailored culinary formats and dedicated service for memorable celebrations."}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-orange-600 dark:text-orange-400">
                  <span>Explore Offerings & Packages</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* Signature Catering Packages */}
      {/* ========================================================================= */}
      <section className="bg-zinc-900 text-white py-20 rounded-3xl max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block mb-2">
                Curated Packages
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Signature Catering Experiences
              </h2>
            </div>
            <Link
              href="/packages"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors"
            >
              <span>Compare All Packages</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-2xl bg-zinc-950/80 border border-zinc-800 p-6 flex flex-col justify-between hover:border-orange-500/50 transition-all duration-300 space-y-6 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold">
                      {pkg.min_guests ? `${pkg.min_guests} - ${pkg.max_guests || "1000+"} Guests` : "All Sizes"}
                    </span>
                    <Layers className="w-5 h-5 text-zinc-500" />
                  </div>

                  <h3 className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">
                    {pkg.name}
                  </h3>

                  <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="pt-4 border-t border-zinc-800/80 space-y-2.5 text-xs text-zinc-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Welcome Drink & Gourmet Appetizers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Curated Main Course Curries & Dal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Signature Dum Biryani & Bread Basket</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Live Warm Mithai & Dessert Counter</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-800">
                  <Link
                    href={`/packages/${pkg.id}`}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-600/20 transition-all duration-200"
                  >
                    <span>View Package Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* Menu Catalog Teaser & Dietary Tabs */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block mb-2">
              Artisanal Menu Catalog
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              Culinary Signatures
            </h2>
          </div>

          {/* Dietary Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {[
              { id: "ALL", label: "All Delights" },
              { id: "VEG", label: "Pure Veg 🟢" },
              { id: "NON_VEG", label: "Non-Veg 🔴" },
              { id: "VEGAN", label: "Vegan 🌱" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDietFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  activeDietFilter === tab.id
                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/25"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dish Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              className="rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col group"
            >
              <div className="relative h-48 w-full overflow-hidden bg-zinc-800">
                <Image
                  src={dish.image_url || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80"}
                  alt={dish.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                      dish.dietary_type === "VEG"
                        ? "bg-emerald-500/90 text-white"
                        : dish.dietary_type === "NON_VEG"
                        ? "bg-red-500/90 text-white"
                        : "bg-teal-500/90 text-white"
                    }`}
                  >
                    {dish.dietary_type}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-base text-zinc-900 dark:text-white group-hover:text-orange-600 transition-colors">
                    {dish.name}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {dish.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Available in custom menu</span>
                  <Link
                    href={`/menu/${dish.id}`}
                    className="font-bold text-orange-600 hover:text-orange-500"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 font-bold text-sm shadow-lg transition-all duration-200"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Explore Complete 150+ Dish Menu Catalog</span>
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* How It Works 3-Step Process */}
      {/* ========================================================================= */}
      <section className="bg-orange-50/50 dark:bg-zinc-900/40 py-20 border-y border-orange-100 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block">
              Seamless Planning Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              From Catalog to Confirmed Booking
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              We make tailoring luxury catering effortless and completely transparent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-lg space-y-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-orange-600/30">
                1
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Explore & Choose Package
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Browse curated function menus or pick an all-inclusive catering package sized perfectly for your guest count.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-lg space-y-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-orange-600/30">
                2
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Customize Dishes & Addons
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Select your favorite starters, gravies, desserts, and live cooking counters with real-time budget visibility.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-lg space-y-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-orange-600/30">
                3
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Instant Quotation & Tasting
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Receive authoritative quotation breakdowns, schedule food tasting sessions, and lock in your event date seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* Bottom CTA Banner */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 p-8 sm:p-12 lg:p-16 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Ready to Craft an Unforgettable Dining Experience?
            </h2>
            <p className="text-base sm:text-lg text-orange-100 font-medium leading-relaxed">
              Explore our packages or speak with our executive banquet consultant for tailored event consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/packages"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-zinc-900 font-extrabold text-sm shadow-lg hover:bg-orange-50 transition-all duration-200"
              >
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>Explore Packages Now</span>
              </Link>
              <Link
                href="/menu"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-orange-950/40 hover:bg-orange-950/60 border border-white/20 text-white font-bold text-sm transition-all duration-200"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Browse Menu Dishes</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
