"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  ArrowRight,
  Sparkles,
  Utensils,
  Layers,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import {
  getFunctionTypeById,
  getOfferingsForFunction,
  getPackages,
} from "@/lib/api";
import { CateringOffering, FunctionType, Package } from "@/lib/types";

export default function FunctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [fn, setFn] = useState<FunctionType | null>(null);
  const [offerings, setOfferings] = useState<CateringOffering[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [fData, offData, pkgData] = await Promise.all([
        getFunctionTypeById(resolvedParams.id),
        getOfferingsForFunction(resolvedParams.id),
        getPackages(),
      ]);
      setFn(fData);
      setOfferings(offData);
      setPackages(pkgData);
      setLoading(false);
    }
    load();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-xl mx-auto mb-4" />
        <div className="h-6 w-96 bg-zinc-200 dark:bg-zinc-800 rounded-xl mx-auto" />
      </div>
    );
  }

  if (!fn) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        <h1 className="text-3xl font-bold">Function Type Not Found</h1>
        <p className="text-zinc-500">The requested event category could not be found.</p>
        <Link
          href="/functions"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 text-white font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Event Types
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-24">
      {/* Hero Header */}
      <section className="relative h-96 w-full overflow-hidden bg-zinc-900">
        <Image
          src={
            fn.image_url ||
            "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80"
          }
          alt={fn.name}
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-between py-8">
          <div>
            <Link
              href="/functions"
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-300 hover:text-white bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-md transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All Event Types
            </Link>
          </div>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-600 text-white text-[11px] font-bold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" /> Event Category
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {fn.name}
            </h1>
            <p className="text-base text-zinc-300 max-w-3xl leading-relaxed">
              {fn.description}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Service Offerings */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block mb-1">
                Dining Styles & Service Formats
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
                Catering Offerings for {fn.name}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offerings.map((off) => (
              <div
                key={off.id}
                className="rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-md flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-40 w-full overflow-hidden bg-zinc-800">
                    <Image
                      src={
                        off.image_url ||
                        "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80"
                      }
                      alt={off.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                      {off.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {off.description || "Curated dining spread tailored for guest comfort and satisfaction."}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link
                    href={`/packages?function=${fn.id}&offering=${off.id}`}
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 text-xs font-bold hover:bg-orange-100 transition-colors"
                  >
                    <span>View Applicable Packages</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recommended Packages */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block mb-1">
                Ready-to-Choose Menus
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
                Recommended Catering Packages
              </h2>
            </div>
            <Link
              href="/packages"
              className="text-xs font-bold text-orange-600 hover:text-orange-500"
            >
              Browse All Packages →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-md p-6 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 text-xs font-bold">
                      {pkg.min_guests ? `${pkg.min_guests} - ${pkg.max_guests} Guests` : "All Sizes"}
                    </span>
                    <Layers className="w-5 h-5 text-zinc-400" />
                  </div>

                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="space-y-2 pt-2 text-xs text-zinc-600 dark:text-zinc-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Welcome Drink & Gourmet Appetizers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Curated Main Course Curries & Dal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Live Warm Mithai & Dessert Counter</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/packages/${pkg.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all duration-200"
                >
                  <span>Select & Inspect Package</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
