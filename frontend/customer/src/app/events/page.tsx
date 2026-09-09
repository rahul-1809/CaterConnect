"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { listCustomerEvents, getEventVersions } from "@/lib/api";
import { EventSummary } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { Calendar, Sparkles, User, ShieldCheck, History, ArrowRight } from "lucide-react";

export default function MyEventsPage() {
  const { user, token, isAuthenticated, openAuthModal } = useAuth();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Version History Modal
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [versionList, setVersionList] = useState<any[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      const res = await listCustomerEvents(token || undefined, statusFilter === "ALL" ? undefined : statusFilter);
      setEvents(res.items || []);
      setLoading(false);
    }
    loadEvents();
  }, [statusFilter, token]);

  const openHistory = async (eventId: string) => {
    setSelectedEventId(eventId);
    const res = await getEventVersions(eventId, token || undefined);
    setVersionList(res.versions || []);
    setShowHistoryModal(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
      {/* Header Banner */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md pt-10 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                Phase 5 • Event Aggregate Workspace
              </span>
              {isAuthenticated && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  Synced with {user?.phone_country_code} {user?.phone_number}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">My Events & Catering Drafts</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Manage your saved event menus, resume incomplete drafts, and inspect audit version histories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <button
                onClick={() => openAuthModal()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-orange-500/40 bg-orange-950/30 hover:bg-orange-900/40 text-orange-300 font-semibold text-sm transition"
              >
                <User className="w-4 h-4" />
                Sign In to Save
              </button>
            )}
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-600/20 transition self-start md:self-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>+ Plan New Event</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Unauthenticated Alert Prompt */}
        {!isAuthenticated && (
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100">Want to save your custom menus across devices?</p>
                <p className="text-xs text-zinc-400">Sign in with your mobile number to keep your wedding and party estimates safe.</p>
              </div>
            </div>
            <button
              onClick={() => openAuthModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shrink-0 shadow-md shadow-orange-600/20"
            >
              <span>Sign In with OTP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          {["ALL", "DRAFT", "SUBMITTED", "COMPLETED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition ${
                statusFilter === st
                  ? "bg-orange-500/15 border-orange-500 text-orange-400 font-bold"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {st === "ALL" ? "All Events" : st}
            </button>
          ))}
        </div>

        {/* Event List / Grid */}
        {loading ? (
          <div className="p-12 text-center text-zinc-500 text-sm">Loading your saved events...</div>
        ) : events.length === 0 ? (
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-zinc-800 text-orange-400 text-2xl flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No Catering Plans Found</h3>
            <p className="text-xs text-zinc-400">
              You haven&apos;t created any catering drafts yet. Use our interactive event planner to configure authentic Andhra & Hyderabadi dishes, packages, and guest headcounts.
            </p>
            <Link
              href="/plan"
              className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs shadow-md transition"
            >
              Start Planning Now →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        ev.status === "DRAFT"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {ev.status}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">v{ev.configuration_version}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">
                      {ev.function_name || "Custom Catering Event"}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {ev.package_name || "Custom Menu Builder"}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs">
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Date</span>
                      <span className="font-medium text-zinc-200">{ev.event_date || "Not set"}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Guests</span>
                      <span className="font-semibold text-orange-400">{ev.guest_count || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Venue</span>
                      <span className="font-medium text-zinc-200 truncate block">{ev.venue_name || "TBD"}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Items</span>
                      <span className="font-medium text-zinc-200">{ev.items_count} dishes</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openHistory(ev.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition"
                  >
                    <History className="w-3.5 h-3.5 text-zinc-400" />
                    <span>History</span>
                  </button>
                  <Link
                    href={`/plan?event_id=${ev.id}`}
                    className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition shadow-sm"
                  >
                    Resume Editing →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Version History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="font-bold text-base text-white">📜 Version Trail</h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">ID: {selectedEventId}</p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-zinc-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {versionList.map((ver) => (
                <div
                  key={ver.id}
                  className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-orange-400">Version {ver.version_number}</span>
                    <span className="text-zinc-500 text-[11px]">
                      {new Date(ver.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-zinc-300 font-medium">{ver.change_reason || "Updated configuration"}</div>
                  <div className="text-zinc-500 text-[11px]">
                    Guest Count: {ver.snapshot?.guest_count || "N/A"} • Items: {ver.snapshot?.menu_items?.length || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
