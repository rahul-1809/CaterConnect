"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, Sparkles, ChefHat, HeartHandshake } from "lucide-react";
import { getFunctionTypes } from "@/lib/api";
import { FunctionType } from "@/lib/types";

export default function FunctionsPage() {
  const [functions, setFunctions] = useState<FunctionType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getFunctionTypes();
      setFunctions(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" /> Event & Function Types
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
          Crafted for Every Occasion
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Whether hosting a 1,000-guest royal wedding reception or an intimate boardroom dinner, choose your event type below to discover specialized catering formats and offerings.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-96 rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {functions.map((fn) => (
            <Link
              key={fn.id}
              href={`/functions/${fn.id}`}
              className="group rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-60 w-full overflow-hidden bg-zinc-800">
                  <Image
                    src={
                      fn.image_url ||
                      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={fn.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400 block mb-1">
                      Catering Specialty
                    </span>
                    <h2 className="text-2xl font-bold">{fn.name}</h2>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {fn.description ||
                      "Customized dining formats, dedicated buffet setups, and live culinary counters curated for this event."}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-orange-600 dark:text-orange-400">
                  <span>Explore Offerings & Packages</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Info Callout */}
      <div className="p-8 rounded-3xl bg-zinc-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-600/20 text-orange-400 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Have a Custom Event or Unique Requirement?</h3>
            <p className="text-xs text-zinc-400">
              We cater bespoke themes, private yacht parties, destination retreats, and multi-day ceremonies.
            </p>
          </div>
        </div>
        <Link
          href="/packages"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold shadow-md shadow-orange-600/20 whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" />
          <span>Explore All Packages</span>
        </Link>
      </div>
    </div>
  );
}
