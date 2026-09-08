"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PackageCheck,
  ArrowLeft,
  Users,
  CheckCircle2,
  Sparkles,
  Layers,
  PlusCircle,
  UtensilsCrossed,
  ShieldCheck,
} from "lucide-react";
import { getPackageById } from "@/lib/api";
import { PackageDetail } from "@/lib/types";

export default function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getPackageById(resolvedParams.id);
      setPkg(data);
      setLoading(false);
    }
    load();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 animate-pulse space-y-8">
        <div className="h-12 w-80 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        <h1 className="text-3xl font-bold">Package Not Found</h1>
        <p className="text-zinc-500">The selected catering package is not available.</p>
        <Link
          href="/packages"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 text-white font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Packages
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Back button */}
      <div>
        <Link
          href="/packages"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Packages
        </Link>
      </div>

      {/* Package Hero Card */}
      <div className="rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full bg-zinc-800">
          <Image
            src={
              pkg.image_url ||
              "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=80"
            }
            alt={pkg.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 text-xs font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {pkg.min_guests ? `${pkg.min_guests} - ${pkg.max_guests} Guests` : "All Guest Counts"}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> FSSAI Certified
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              {pkg.name}
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {pkg.description}
            </p>
          </div>

          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider block">
                Full Banquet Experience
              </span>
              <span className="text-lg font-black text-orange-600 dark:text-orange-400">
                Customizable Menu Plan
              </span>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-md shadow-orange-600/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Menu Items</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Package Structure & Inclusions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Included Items */}
        <div className="lg:col-span-2 space-y-8">
          {/* Selection Groups */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-600" />
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Choice & Selection Groups
              </h2>
            </div>

            {pkg.selection_groups && pkg.selection_groups.length > 0 ? (
              <div className="space-y-6">
                {pkg.selection_groups.map((group) => (
                  <div
                    key={group.id}
                    className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-md space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                        {group.name}
                      </h3>
                      <span className="px-3 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 text-xs font-bold">
                        Choose {group.max_selections} item{group.max_selections > 1 ? "s" : ""}
                      </span>
                    </div>
                    {group.description && (
                      <p className="text-xs text-zinc-500">{group.description}</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {group.items &&
                        group.items.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700 flex items-center justify-between"
                          >
                            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                              {item.menu_item?.name || "Premium Dish Option"}
                            </span>
                            {item.menu_item?.dietary_type && (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.menu_item.dietary_type === "VEG"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                                }`}
                              >
                                {item.menu_item.dietary_type}
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500">
                This package includes full fixed courses selected by executive chefs.
              </div>
            )}
          </div>

          {/* Included Core Dishes */}
          {pkg.package_items && pkg.package_items.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Guaranteed Signature Inclusions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pkg.package_items.map((pi) => (
                  <div
                    key={pi.id}
                    className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-3 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {pi.menu_item?.name || "Curated Signature Course"}
                      </h4>
                      <span className="text-[10px] text-zinc-400">Included with all tiers</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Add-ons & Fast Plan CTA */}
        <div className="space-y-6">
          {/* Optional Add-ons */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-md space-y-4">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-orange-600" />
              Available Add-ons
            </h3>
            <p className="text-xs text-zinc-500">
              Enhance your banquet package with live counters and specialty bars.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold">Live Chaat & Pani Puri Counter</div>
                  <div className="text-[10px] text-zinc-400">Fresh artisanal preparations</div>
                </div>
                <span className="font-extrabold text-orange-600">+ Addon</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold">Gourmet Kulfi & Falooda Studio</div>
                  <div className="text-[10px] text-zinc-400">4 varieties with toppings</div>
                </div>
                <span className="font-extrabold text-orange-600">+ Addon</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold">Wood-fired Neapolitan Pizza Oven</div>
                  <div className="text-[10px] text-zinc-400">Chef live baking counter</div>
                </div>
                <span className="font-extrabold text-orange-600">+ Addon</span>
              </div>
            </div>
          </div>

          {/* Quick Menu Catalog CTA */}
          <div className="p-6 rounded-3xl bg-zinc-900 text-white space-y-4 shadow-xl">
            <UtensilsCrossed className="w-8 h-8 text-orange-500" />
            <h3 className="text-lg font-bold">Want to swap or customize individual dishes?</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Explore our comprehensive 150+ dish catalog and swap any item in your customized event quotation.
            </p>
            <Link
              href="/menu"
              className="block text-center py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md"
            >
              Browse A La Carte Dishes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
