"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Utensils, Calendar, PackageCheck, Sparkles, Menu, X, PhoneCall } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/functions", label: "Event Types", icon: Calendar },
    { href: "/packages", label: "Packages", icon: PackageCheck },
    { href: "/menu", label: "Menu Catalog", icon: Utensils },
    { href: "/plan", label: "Plan Event", icon: Sparkles },
    { href: "/events", label: "My Events", icon: Calendar },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform duration-300">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 dark:from-white dark:via-zinc-200 dark:to-white bg-clip-text">
                Cater<span className="text-orange-600 dark:text-orange-500">Connect</span>
              </span>
              <span className="block text-[10px] tracking-widest font-semibold uppercase text-zinc-600 dark:text-zinc-300">
                Bespoke Event Catering
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-900/70"
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-80" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-sm font-semibold shadow-md shadow-orange-600/20 hover:shadow-orange-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Sparkles className="w-4 h-4" />
              Plan Your Event
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive
                    ? "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-semibold"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <Icon className="w-5 h-5 text-orange-600" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/plan"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold shadow-md shadow-orange-600/20"
            >
              <Sparkles className="w-4 h-4" />
              Plan Your Event
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
