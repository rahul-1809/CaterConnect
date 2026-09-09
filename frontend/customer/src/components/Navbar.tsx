"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Utensils,
  Calendar,
  PackageCheck,
  Sparkles,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  const navLinks = [
    { href: "/functions", label: "Event Types", icon: Calendar },
    { href: "/packages", label: "Packages", icon: PackageCheck },
    { href: "/menu", label: "Menu Catalog", icon: Utensils },
    { href: "/plan", label: "Plan Event", icon: Sparkles },
    { href: "/events", label: "My Events", icon: Calendar },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatPhoneNumber = (phone: string, countryCode: string = "+91") => {
    if (!phone) return "";
    const clean = phone.replace(/\D/g, "");
    if (clean.length === 10) {
      return `${countryCode} ${clean.slice(0, 5)} ${clean.slice(5)}`;
    }
    return phone;
  };

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

          {/* Right Action CTA & Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700/80 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {user.customer_profile?.full_name
                      ? user.customer_profile.full_name.charAt(0).toUpperCase()
                      : user.phone_number.slice(-2)}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold leading-tight text-zinc-900 dark:text-white">
                      {user.customer_profile?.full_name || "Guest Host"}
                    </p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      {formatPhoneNumber(user.phone_number, user.phone_country_code)}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-950/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Signed In As
                      </p>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                        {formatPhoneNumber(user.phone_number, user.phone_country_code)}
                      </p>
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Account
                      </span>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <Link
                        href="/events"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-orange-600" />
                        My Planned Events
                      </Link>
                      <Link
                        href="/plan"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        Plan New Event
                      </Link>
                    </div>

                    <div className="pt-1 mt-1 border-t border-zinc-100 dark:border-zinc-800 p-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-100/60 dark:bg-zinc-800/60 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70 text-zinc-800 dark:text-zinc-200 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <UserIcon className="w-4 h-4 text-orange-600" />
                Sign In
              </button>
            )}

            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-sm font-semibold shadow-md shadow-orange-600/20 hover:shadow-orange-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Sparkles className="w-4 h-4" />
              Plan Your Event
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {!isAuthenticated && (
              <button
                onClick={() => openAuthModal()}
                className="px-3 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-xs font-semibold"
              >
                Sign In
              </button>
            )}
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
          {isAuthenticated && user && (
            <div className="p-3 mb-3 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
                  {user.phone_number.slice(-2)}
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">
                    {formatPhoneNumber(user.phone_number, user.phone_country_code)}
                  </p>
                  <p className="text-[10px] text-zinc-500">Verified Account</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="p-2 text-red-600 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl"
              >
                Sign Out
              </button>
            </div>
          )}

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

          <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
            {!isAuthenticated && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold shadow-sm"
              >
                <UserIcon className="w-4 h-4 text-orange-600" />
                Sign In with OTP
              </button>
            )}

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
