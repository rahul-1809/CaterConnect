"use client";

import React, { Suspense, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getFunctionTypes,
  getOfferings,
  getPackages,
  getMenuItems,
  getMenuCategories,
  createEventDraft,
  getEventDetails,
  updateEventDetails,
  updateEventConfiguration,
  addEventMenuItem,
  removeEventMenuItem,
  getEventVersions,
} from "../../lib/api";
import {
  CateringOffering,
  FunctionType,
  MenuCategory,
  MenuItem,
  Package,
  PackageDetail,
} from "../../lib/types";

function PlanContent() {
  const searchParams = useSearchParams();
  const queryEventId = searchParams.get("event_id");
  const queryPackageId = searchParams.get("package_id");
  const queryFunctionId = searchParams.get("function_id");

  // Step state (1: Details, 2: Package & Selections, 3: Add-ons & Custom, 4: Review)
  const [step, setStep] = useState<number>(1);
  const [isPending, startTransition] = useTransition();

  // Catalog Data
  const [functions, setFunctions] = useState<FunctionType[]>([]);
  const [offerings, setOfferings] = useState<CateringOffering[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Event State
  const [eventId, setEventId] = useState<string | null>(queryEventId);
  const [version, setVersion] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [selectedFunctionId, setSelectedFunctionId] = useState<string>(queryFunctionId || "");
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>("");
  const [selectedPackageId, setSelectedPackageId] = useState<string>(queryPackageId || "");
  const [guestCount, setGuestCount] = useState<number>(150);
  const [eventDate, setEventDate] = useState<string>("");
  const [eventTime, setEventTime] = useState<string>("19:00");
  const [venueName, setVenueName] = useState<string>("");
  const [venueAddress, setVenueAddress] = useState<string>("");
  const [budgetMin, setBudgetMin] = useState<number>(100000);
  const [budgetMax, setBudgetMax] = useState<number>(200000);
  const [customerNotes, setCustomerNotes] = useState<string>("");

  // Selected Menu Items State
  // Map of group_id -> set of menu_item_ids selected for that group
  const [groupSelections, setGroupSelections] = useState<Record<string, string[]>>({});
  // List of extra custom/addon items selected: map of item_id -> quantity
  const [customItems, setCustomItems] = useState<Record<string, number>>({});
  // Server-confirmed event menu items
  const [serverMenuItems, setServerMenuItems] = useState<any[]>([]);

  // Version History Modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [versionList, setVersionList] = useState<any[]>([]);

  // Active category filter in Step 3
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [dietaryFilter, setDietaryFilter] = useState<string>("ALL");
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Load Initial Catalog Data
  useEffect(() => {
    async function loadCatalog() {
      const [fns, offs, pkgs, cats, dishes] = await Promise.all([
        getFunctionTypes(),
        getOfferings(),
        getPackages(),
        getMenuCategories(),
        getMenuItems(),
      ]);
      setFunctions(fns);
      setOfferings(offs);
      setPackages(pkgs);
      setCategories(cats);
      setMenuItems(dishes);

      if (queryFunctionId && !selectedFunctionId) {
        setSelectedFunctionId(queryFunctionId);
      }
      if (queryPackageId && !selectedPackageId) {
        setSelectedPackageId(queryPackageId);
      }
    }
    loadCatalog();
  }, [queryFunctionId, queryPackageId]);

  // Load Existing Event if eventId provided
  useEffect(() => {
    if (!eventId) return;
    async function loadEvent() {
      const res = await getEventDetails(eventId!);
      if (res.data) {
        const ev = res.data;
        setVersion(ev.configuration_version || 1);
        if (ev.function_type_id) setSelectedFunctionId(ev.function_type_id);
        if (ev.offering_id) setSelectedOfferingId(ev.offering_id);
        if (ev.package_id) setSelectedPackageId(ev.package_id);
        if (ev.guest_count) setGuestCount(ev.guest_count);
        if (ev.event_date) setEventDate(ev.event_date);
        if (ev.event_time) setEventTime(ev.event_time.slice(0, 5));
        if (ev.venue?.name) setVenueName(ev.venue.name);
        if (ev.venue?.address) setVenueAddress(ev.venue.address);
        if (ev.budget?.min) setBudgetMin(ev.budget.min);
        if (ev.budget?.max) setBudgetMax(ev.budget.max);
        if (ev.customer_notes) setCustomerNotes(ev.customer_notes);
        if (ev.menu_items) {
          setServerMenuItems(ev.menu_items);
          // Restore selections
          const groups: Record<string, string[]> = {};
          const custom: Record<string, number> = {};
          for (const item of ev.menu_items) {
            if (item.selection_group_id) {
              if (!groups[item.selection_group_id]) groups[item.selection_group_id] = [];
              groups[item.selection_group_id].push(item.menu_item_id);
            } else if (item.source_type === "CUSTOM" || item.source_type === "ADDON") {
              custom[item.menu_item_id] = item.quantity || 1;
            }
          }
          setGroupSelections(groups);
          setCustomItems(custom);
        }
      }
    }
    loadEvent();
  }, [eventId]);

  // Active selected package details
  const activePackage = packages.find((p) => p.id === selectedPackageId) as PackageDetail | undefined;

  // Handle Selection Group Toggle
  const toggleGroupSelection = (groupId: string, itemId: string, maxSelections: number) => {
    setGroupSelections((prev) => {
      const current = prev[groupId] || [];
      if (current.includes(itemId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== itemId) };
      }
      if (current.length >= maxSelections) {
        if (maxSelections === 1) {
          return { ...prev, [groupId]: [itemId] };
        }
        return prev;
      }
      return { ...prev, [groupId]: [...current, itemId] };
    });
  };

  // Handle Custom Item Add/Remove
  const modifyCustomItem = (itemId: string, delta: number) => {
    setCustomItems((prev) => {
      const currentQty = prev[itemId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      const updated = { ...prev };
      if (newQty === 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = newQty;
      }
      return updated;
    });
  };

  // Save Event Draft Action
  const handleSaveDraft = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      if (!eventId) {
        // Create new draft
        const createRes = await createEventDraft({
          function_type_id: selectedFunctionId || undefined,
          offering_id: selectedOfferingId || undefined,
          package_id: selectedPackageId || undefined,
          guest_count: guestCount,
          budget_min: budgetMin,
          budget_max: budgetMax,
          event_date: eventDate || undefined,
          event_time: eventTime ? `${eventTime}:00` : undefined,
          venue_name: venueName || undefined,
          venue_address: venueAddress || undefined,
          customer_notes: customerNotes || undefined,
        });

        if (createRes.error || !createRes.data) {
          setErrorMessage(createRes.error || "Failed to create draft");
          setIsSaving(false);
          return;
        }

        const newEvent = createRes.data;
        setEventId(newEvent.id);
        setVersion(newEvent.configuration_version);
        setStatusMessage("Event draft created successfully! (v1)");
      } else {
        // Update core details
        const updateRes = await updateEventDetails(
          eventId,
          {
            function_type_id: selectedFunctionId || undefined,
            offering_id: selectedOfferingId || undefined,
            package_id: selectedPackageId || undefined,
            guest_count: guestCount,
            budget_min: budgetMin,
            budget_max: budgetMax,
            event_date: eventDate || undefined,
            event_time: eventTime ? `${eventTime}:00` : undefined,
            venue_name: venueName || undefined,
            venue_address: venueAddress || undefined,
            customer_notes: customerNotes || undefined,
          },
          undefined,
          version
        );

        if (updateRes.error) {
          setErrorMessage(updateRes.error);
          setIsSaving(false);
          return;
        }

        let curVer = updateRes.data.configuration_version;
        setVersion(curVer);

        // Build configuration payload
        const menuPayload: Array<{
          menu_item_id: string;
          source_type: string;
          selection_group_id?: string | null;
          quantity?: number;
          is_included?: boolean;
        }> = [];

        // Add package selection group items
        for (const [grpId, itemIds] of Object.entries(groupSelections)) {
          for (const mId of itemIds) {
            menuPayload.push({
              menu_item_id: mId,
              source_type: "PACKAGE",
              selection_group_id: grpId,
              quantity: 1,
              is_included: true,
            });
          }
        }

        // Add custom / addon items
        for (const [mId, qty] of Object.entries(customItems)) {
          menuPayload.push({
            menu_item_id: mId,
            source_type: "CUSTOM",
            quantity: qty,
            is_included: true,
          });
        }

        if (menuPayload.length > 0 || selectedPackageId) {
          const cfgRes = await updateEventConfiguration(eventId, {
            base_version: curVer,
            package_id: selectedPackageId || undefined,
            menu_items: menuPayload,
          });

          if (cfgRes.error) {
            setErrorMessage(cfgRes.error);
            setIsSaving(false);
            return;
          }
          if (cfgRes.data) {
            setVersion(cfgRes.data.version);
            setServerMenuItems(cfgRes.data.menu_items || []);
          }
        }

        setStatusMessage(`Event configuration updated and saved! (v${curVer + (menuPayload.length > 0 ? 1 : 0)})`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Open Version History Modal
  const openHistory = async () => {
    if (!eventId) return;
    const res = await getEventVersions(eventId);
    setVersionList(res.versions || []);
    setShowHistoryModal(true);
  };

  // Filtered menu items for Step 3
  const filteredDishes = menuItems.filter((dish) => {
    if (activeCategory !== "ALL" && dish.category_id !== activeCategory) return false;
    if (dietaryFilter !== "ALL" && dish.dietary_type !== dietaryFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      if (!dish.name.toLowerCase().includes(q) && !dish.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Calculate total selected items count
  const totalSelectedCount =
    Object.values(groupSelections).reduce((acc, list) => acc + list.length, 0) +
    Object.keys(customItems).length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-24">
      {/* Header Banner */}
      <div className="border-b border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Phase 5 • Event Planner & Menu Builder
              </span>
              {eventId && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                  v{version} • {eventId.slice(0, 8)}...
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              Plan Your Catering Experience
            </h1>
            <p className="text-sm text-neutral-400 mt-0.5">
              Customize your menu, configure package selection rules, and save your draft with live version history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {eventId && (
              <button
                onClick={openHistory}
                className="px-3.5 py-2 text-xs font-medium rounded-lg border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 transition"
              >
                📜 Version History ({version})
              </button>
            )}
            <Link
              href="/events"
              className="px-3.5 py-2 text-xs font-medium rounded-lg border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 transition"
            >
              📂 My Saved Plans
            </Link>
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "💾 Save Draft"}
            </button>
          </div>
        </div>

        {/* Status / Alert Bar */}
        {(statusMessage || errorMessage) && (
          <div className="max-w-7xl mx-auto mt-4">
            {statusMessage && (
              <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                <span>✅ {statusMessage}</span>
                <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-white font-bold ml-2">✕</button>
              </div>
            )}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
                <span>⚠️ {errorMessage}</span>
                <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white font-bold ml-2">✕</button>
              </div>
            )}
          </div>
        )}

        {/* Step Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-6">
          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center text-xs font-medium">
            {[
              { id: 1, title: "1. Event Details", desc: "Date, Venue & Guests" },
              { id: 2, title: "2. Package & Choices", desc: "Base Menu & Selections" },
              { id: 3, title: "3. Add-on Dishes", desc: "Custom Items & Starters" },
              { id: 4, title: "4. Review & Summary", desc: "Finalize & Save" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`py-2.5 px-2 rounded-lg border transition text-left flex flex-col justify-center ${
                  step === s.id
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-400 font-semibold"
                    : step > s.id
                    ? "bg-neutral-900 border-neutral-800 text-neutral-300"
                    : "bg-neutral-950/40 border-neutral-900 text-neutral-500 hover:text-neutral-400"
                }`}
              >
                <span className="font-semibold text-xs">{s.title}</span>
                <span className="hidden sm:inline text-[11px] opacity-70 mt-0.5 truncate">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Step Workspace (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: EVENT DETAILS */}
          {step === 1 && (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Event Details & Specifications</h2>
                <p className="text-sm text-neutral-400 mt-1">
                  Tell us about your celebration occasion, venue coordinates, and expected guest headcount.
                </p>
              </div>

              {/* Function Type Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Select Function Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {functions.map((fn) => (
                    <button
                      key={fn.id}
                      type="button"
                      onClick={() => setSelectedFunctionId(fn.id)}
                      className={`p-3 rounded-xl border text-left transition ${
                        selectedFunctionId === fn.id
                          ? "bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/5"
                          : "bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      <div className="font-medium text-sm text-white">{fn.name}</div>
                      <div className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{fn.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Offering Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Service Offering Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {offerings.map((off) => (
                    <button
                      key={off.id}
                      type="button"
                      onClick={() => setSelectedOfferingId(off.id)}
                      className={`p-3 rounded-xl border text-left transition ${
                        selectedOfferingId === off.id
                          ? "bg-amber-500/10 border-amber-500 text-white"
                          : "bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      <div className="font-medium text-sm text-white">{off.name}</div>
                      <div className="text-xs text-neutral-500 mt-0.5">{off.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date, Time & Headcount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Guest Count: <span className="text-amber-400 font-bold">{guestCount}</span>
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={10000}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Venue Coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Venue Name / Hall
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Taj West End Grand Ballroom"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Venue Address
                  </label>
                  <input
                    type="text"
                    placeholder="City, Area, Landmark"
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Target Budget Range (₹)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-neutral-500 text-sm">₹</span>
                    <input
                      type="number"
                      placeholder="Min Budget"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-neutral-500 text-sm">₹</span>
                    <input
                      type="number"
                      placeholder="Max Budget"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation button */}
              <div className="pt-4 border-t border-neutral-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm transition"
                >
                  Continue to Package Selection →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PACKAGE & SELECTION GROUPS */}
          {step === 2 && (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white">Choose Package & Custom Selections</h2>
                <p className="text-sm text-neutral-400 mt-1">
                  Pick your curated foundation package and customize the specific dishes for each selection group.
                </p>
              </div>

              {/* Package Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                      selectedPackageId === pkg.id
                        ? "bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10"
                        : "bg-neutral-900/90 border-neutral-800 hover:border-neutral-700"
                    }`}
                  >
                    <div>
                      {selectedPackageId === pkg.id && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-neutral-950 mb-2">
                          Active Selection
                        </span>
                      )}
                      <h3 className="text-base font-bold text-white">{pkg.name}</h3>
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{pkg.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Min {pkg.min_guests || 50} guests</span>
                      {pkg.indicative_price && (
                        <span className="text-amber-400 font-semibold">₹{pkg.indicative_price}/person</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Active Package Selection Groups */}
              {activePackage && activePackage.selection_groups && activePackage.selection_groups.length > 0 && (
                <div className="space-y-6 pt-4 border-t border-neutral-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>🍲 Custom Dish Selection Rules</span>
                    <span className="text-xs font-normal text-neutral-400">
                      (Choose dishes according to package constraints)
                    </span>
                  </h3>

                  {activePackage.selection_groups.map((grp) => {
                    const selectedForGroup = groupSelections[grp.id] || [];
                    const isSatisfied =
                      selectedForGroup.length >= grp.min_selections &&
                      (grp.max_selections === undefined || selectedForGroup.length <= grp.max_selections);

                    return (
                      <div
                        key={grp.id}
                        className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-4 sm:p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-sm text-white">{grp.name}</h4>
                            <p className="text-xs text-neutral-400 mt-0.5">{grp.description}</p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                isSatisfied
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {selectedForGroup.length} / {grp.max_selections} selected
                            </span>
                          </div>
                        </div>

                        {/* Options in this group */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          {grp.items.map((gi) => {
                            const isSelected = selectedForGroup.includes(gi.menu_item_id);
                            return (
                              <button
                                key={gi.id}
                                type="button"
                                onClick={() =>
                                  toggleGroupSelection(grp.id, gi.menu_item_id, grp.max_selections || 1)
                                }
                                className={`p-3 rounded-lg border text-left flex items-center justify-between transition ${
                                  isSelected
                                    ? "bg-amber-500/15 border-amber-500 text-white"
                                    : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                                }`}
                              >
                                <div>
                                  <div className="text-xs font-semibold text-white">
                                    {gi.menu_item?.name || "Dish Item"}
                                  </div>
                                  <div className="text-[11px] text-neutral-400">
                                    {gi.menu_item?.dietary_type === "VEG" && "🟢 Vegetarian"}
                                    {gi.menu_item?.dietary_type === "NON_VEG" && "🔴 Non-Vegetarian"}
                                    {gi.menu_item?.dietary_type === "VEGAN" && "🌱 Vegan"}
                                  </div>
                                </div>
                                <span
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${
                                    isSelected
                                      ? "bg-amber-500 border-amber-500 text-neutral-950 font-bold"
                                      : "border-neutral-700 text-neutral-600"
                                  }`}
                                >
                                  {isSelected ? "✓" : "+"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Navigation buttons */}
              <div className="pt-4 border-t border-neutral-800 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 hover:bg-neutral-800 text-sm font-medium transition"
                >
                  ← Back to Details
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm transition"
                >
                  Continue to Add-on Dishes →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ADD-ON / CUSTOM ITEMS */}
          {step === 3 && (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Add-on Dishes & Extra Specialties</h2>
                <p className="text-sm text-neutral-400 mt-1">
                  Enhance your catering spread with supplementary starters, live counters, breads, and artisanal desserts.
                </p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Search dishes by name or ingredients..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />

                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={dietaryFilter}
                  onChange={(e) => setDietaryFilter(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Dietary</option>
                  <option value="VEG">Vegetarian Only</option>
                  <option value="NON_VEG">Non-Vegetarian</option>
                  <option value="VEGAN">Vegan Only</option>
                </select>
              </div>

              {/* Menu Item Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredDishes.map((dish) => {
                  const qty = customItems[dish.id] || 0;
                  return (
                    <div
                      key={dish.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                        qty > 0
                          ? "bg-amber-500/10 border-amber-500/40"
                          : "bg-neutral-950/80 border-neutral-800 hover:border-neutral-700"
                      }`}
                    >
                      <div className="pr-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              dish.dietary_type === "NON_VEG"
                                ? "bg-red-500"
                                : dish.dietary_type === "VEGAN"
                                ? "bg-emerald-400"
                                : "bg-emerald-500"
                            }`}
                          />
                          <span className="font-semibold text-xs text-white">{dish.name}</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">{dish.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {qty > 0 ? (
                          <div className="flex items-center border border-amber-500/50 bg-neutral-900 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => modifyCustomItem(dish.id, -1)}
                              className="px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800 font-bold"
                            >
                              -
                            </button>
                            <span className="px-2.5 text-xs text-amber-400 font-semibold">{qty}</span>
                            <button
                              type="button"
                              onClick={() => modifyCustomItem(dish.id, 1)}
                              className="px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800 font-bold"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => modifyCustomItem(dish.id, 1)}
                            className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 text-xs font-medium text-neutral-200 hover:border-amber-500 hover:text-amber-400 transition"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div className="pt-4 border-t border-neutral-800 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 hover:bg-neutral-800 text-sm font-medium transition"
                >
                  ← Back to Package
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm transition"
                >
                  Review Plan Summary →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & FINALIZE */}
          {step === 4 && (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Event Catering Plan Summary</h2>
                <p className="text-sm text-neutral-400 mt-1">
                  Review all event specifications and selected dishes before saving or submitting for pricing quotation.
                </p>
              </div>

              {/* Key Specs Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
                <div>
                  <span className="text-neutral-500 block">Function Type</span>
                  <span className="font-semibold text-neutral-200 mt-0.5 block">
                    {functions.find((f) => f.id === selectedFunctionId)?.name || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Guest Count</span>
                  <span className="font-semibold text-amber-400 mt-0.5 block">{guestCount} Guests</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Date & Time</span>
                  <span className="font-semibold text-neutral-200 mt-0.5 block">
                    {eventDate || "TBD"} {eventTime && `at ${eventTime}`}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Venue</span>
                  <span className="font-semibold text-neutral-200 mt-0.5 block truncate">
                    {venueName || "TBD"}
                  </span>
                </div>
              </div>

              {/* Selected Dishes Breakdown */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                  Included & Selected Dishes ({totalSelectedCount})
                </h3>

                {totalSelectedCount === 0 ? (
                  <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-950 text-center text-xs text-neutral-500">
                    No custom dishes or group options selected yet. Return to Step 2 or 3 to add items.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(groupSelections).map(([grpId, itemIds]) => {
                      const grp = activePackage?.selection_groups?.find((g) => g.id === grpId);
                      return (
                        <div key={grpId} className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                          <div className="text-xs font-bold text-amber-400 mb-2">
                            {grp?.name || "Package Group"}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {itemIds.map((itemId) => {
                              const dish = menuItems.find((d) => d.id === itemId);
                              return (
                                <div key={itemId} className="text-xs text-neutral-300 flex items-center gap-2">
                                  <span className="text-amber-500 font-bold">•</span>
                                  <span>{dish?.name || itemId}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {Object.entries(customItems).length > 0 && (
                      <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                        <div className="text-xs font-bold text-amber-400 mb-2">Additional Add-ons & Custom Dishes</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.entries(customItems).map(([itemId, qty]) => {
                            const dish = menuItems.find((d) => d.id === itemId);
                            return (
                              <div key={itemId} className="text-xs text-neutral-300 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-amber-500 font-bold">•</span>
                                  <span>{dish?.name || itemId}</span>
                                </div>
                                <span className="text-neutral-500 text-[11px]">Qty: {qty}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Special Customer Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Special Catering Instructions / Chef Notes
                </label>
                <textarea
                  rows={3}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g. Jain food counters required, mild spice level for starters, separate live chat stall..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row gap-3 justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 hover:bg-neutral-800 text-sm font-medium transition"
                >
                  ← Back to Add-ons
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "💾 Save Plan Draft"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Sidebar (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 sticky top-24 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h3 className="font-bold text-sm text-white">Event Summary Card</h3>
              <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
                v{version}
              </span>
            </div>

            {/* Selected Package Badge */}
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-neutral-500">Base Package</span>
              <div className="font-semibold text-sm text-amber-400">
                {activePackage?.name || "Custom Menu Build"}
              </div>
            </div>

            {/* Headcount & Budget */}
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-neutral-800/80 text-xs">
              <div>
                <span className="text-neutral-500 block">Guests</span>
                <span className="font-bold text-white text-sm">{guestCount}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Budget Range</span>
                <span className="font-bold text-white text-sm">
                  ₹{Math.round(budgetMin / 1000)}k - ₹{Math.round(budgetMax / 1000)}k
                </span>
              </div>
            </div>

            {/* Selected Count Metrics */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-neutral-300">
                <span>Selection Group Items:</span>
                <span className="font-bold text-white">
                  {Object.values(groupSelections).reduce((a, b) => a + b.length, 0)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Extra Custom Add-ons:</span>
                <span className="font-bold text-white">{Object.keys(customItems).length}</span>
              </div>
              <div className="flex justify-between text-neutral-300 pt-2 border-t border-neutral-800/60 font-semibold text-amber-400">
                <span>Total Planned Items:</span>
                <span>{totalSelectedCount} items</span>
              </div>
            </div>

            {/* Save Draft Action */}
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "💾 Save Plan Draft"}
            </button>

            {eventId && (
              <p className="text-center text-[11px] text-neutral-500">
                Draft ID: <span className="font-mono">{eventId.slice(0, 13)}...</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Version History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-bold text-base text-white">📜 Event Version History Snapshots</h3>
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

export default function PlanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-neutral-400 p-12">Loading Event Planner...</div>}>
      <PlanContent />
    </Suspense>
  );
}
