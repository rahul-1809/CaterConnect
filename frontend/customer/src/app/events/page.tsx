"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { listCustomerEvents, getEventVersions } from "../../lib/api";
import { EventSummary } from "../../lib/types";

export default function MyEventsPage() {
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
      const res = await listCustomerEvents(undefined, statusFilter === "ALL" ? undefined : statusFilter);
      setEvents(res.items || []);
      setLoading(false);
    }
    loadEvents();
  }, [statusFilter]);

  const openHistory = async (eventId: string) => {
    setSelectedEventId(eventId);
    const res = await getEventVersions(eventId);
    setVersionList(res.versions || []);
    setShowHistoryModal(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-24">
      {/* Header Banner */}
      <div className="border-b border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md pt-10 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
              Phase 5 • Event Aggregate Workspace
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-white">My Events & Catering Drafts</h1>
            <p className="text-sm text-neutral-400 mt-1">
              Manage your saved event menus, resume incomplete drafts, and inspect audit version histories.
            </p>
          </div>

          <Link
            href="/plan"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition self-start md:self-auto"
          >
            <span>+ Plan New Event</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          {["ALL", "DRAFT", "SUBMITTED", "COMPLETED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition ${
                statusFilter === st
                  ? "bg-amber-500/15 border-amber-500 text-amber-400 font-bold"
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {st === "ALL" ? "All Events" : st}
            </button>
          ))}
        </div>

        {/* Event List / Grid */}
        {loading ? (
          <div className="p-12 text-center text-neutral-500 text-sm">Loading your saved events...</div>
        ) : events.length === 0 ? (
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-neutral-800 text-amber-400 text-2xl flex items-center justify-center mx-auto">
              📋
            </div>
            <h3 className="text-lg font-bold text-white">No Catering Plans Found</h3>
            <p className="text-xs text-neutral-400">
              You haven&apos;t created any catering drafts yet. Use our interactive event planner to configure dishes, packages, and guest headcount.
            </p>
            <Link
              href="/plan"
              className="inline-block px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs shadow-md transition"
            >
              Start Planning Now →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-neutral-700 transition"
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
                    <span className="text-xs font-mono text-neutral-500">v{ev.configuration_version}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">
                      {ev.function_name || "Custom Catering Event"}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {ev.package_name || "Custom Menu Builder"}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs">
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Date</span>
                      <span className="font-medium text-neutral-200">{ev.event_date || "Not set"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Guests</span>
                      <span className="font-semibold text-amber-400">{ev.guest_count || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Venue</span>
                      <span className="font-medium text-neutral-200 truncate block">{ev.venue_name || "TBD"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Items</span>
                      <span className="font-medium text-neutral-200">{ev.items_count} dishes</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openHistory(ev.id)}
                    className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition"
                  >
                    📜 History
                  </button>
                  <Link
                    href={`/plan?event_id=${ev.id}`}
                    className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition shadow-sm"
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
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="font-bold text-base text-white">📜 Version Trail</h3>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">ID: {selectedEventId}</p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-neutral-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {versionList.map((ver) => (
                <div
                  key={ver.id}
                  className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">Version {ver.version_number}</span>
                    <span className="text-neutral-500 text-[11px]">
                      {new Date(ver.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-neutral-300 font-medium">{ver.change_reason || "Updated configuration"}</div>
                  <div className="text-neutral-500 text-[11px]">
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
