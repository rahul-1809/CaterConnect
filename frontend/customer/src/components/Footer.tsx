import React from "react";
import Link from "next/link";
import { Utensils, Award, ShieldCheck, Clock, MapPin, Phone, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-800/80">
      {/* Top Highlights Strip */}
      <div className="border-b border-zinc-800/60 bg-zinc-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/50">
              <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Master Chef Craftsmanship</h4>
                <p className="text-xs text-zinc-400">Over 15+ years of culinary artistry & fine dining</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/50">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">100% Food Safety & Hygiene</h4>
                <p className="text-xs text-zinc-400">FSSAI certified kitchens & temperature-monitored fleet</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/50">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Punctual & Flawless Service</h4>
                <p className="text-xs text-zinc-400">Dedicated banquet supervisors for zero-delay delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white">
                Cater<span className="text-orange-500">Connect</span>
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Transforming grand weddings, corporate summits, and intimate celebrations with unforgettable culinary dining experiences and tailored hospitality.
            </p>
          </div>

          {/* Catalog Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Explore Catalog
            </h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li>
                <Link href="/functions" className="hover:text-orange-400 transition-colors">
                  Wedding Feasts & Receptions
                </Link>
              </li>
              <li>
                <Link href="/functions" className="hover:text-orange-400 transition-colors">
                  Corporate Galas & Lunches
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-orange-400 transition-colors">
                  Signature Catering Packages
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-orange-400 transition-colors">
                  A La Carte Menu Catalog
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-orange-400 transition-colors">
                  Live Cooking & Dessert Stations
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Dietary Filters */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Specialized Menus
            </h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li>
                <Link href="/menu" className="hover:text-orange-400 transition-colors">
                  Pure Vegetarian Delicacies
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-orange-400 transition-colors">
                  Royal Mughlai & Coastal Non-Veg
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-orange-400 transition-colors">
                  Jain & Sattvic Ceremonial Menus
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-orange-400 transition-colors">
                  Contemporary Vegan Offerings
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Concierge & Tastings
            </h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <span>123 Celebration Plaza, Bandra West, Mumbai, Maharashtra 400050</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span>concierge@caterconnect.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-zinc-800 text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} CaterConnect. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-current" /> for unforgettable celebrations
          </p>
        </div>
      </div>
    </footer>
  );
}
