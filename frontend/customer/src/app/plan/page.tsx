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
  getEventVersions,
  getEventEstimate,
  calculateEventEstimate,
  getBudgetOptimizations,
  applyBudgetRecommendation,
} from "../../lib/api";
import {
  BudgetRecommendationItem,
  CateringOffering,
  EstimateData,
  FunctionType,
  MenuCategory,
  MenuItem,
  Package,
  PackageDetail,
} from "../../lib/types";
import { useAuth } from "@/context/AuthContext";

function PlanContent() {
  const { token, isAuthenticated, openAuthModal } = useAuth();
  const searchParams = useSearchParams();
  const queryEventId = searchParams.get("event_id");
  const queryPackageId = searchParams.get("package_id");
  const queryFunctionId = searchParams.get("function_id");

  // Step state (1: Details, 2: Package & Selections, 3: Add-ons & Custom, 4: Review & Estimate)
  const [step, setStep] = useState<number>(1);
  const [, startTransition] = useTransition();

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
  const [groupSelections, setGroupSelections] = useState<Record<string, string[]>>({});
  const [customItems, setCustomItems] = useState<Record<string, number>>({});
  const [, setServerMenuItems] = useState<any[]>([]);

  // Version History Modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [versionList, setVersionList] = useState<any[]>([]);

  // Phase 6: Pricing & Estimate State
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [isEstimateStale, setIsEstimateStale] = useState<boolean>(false);
  const [isLoadingEstimate, setIsLoadingEstimate] = useState<boolean>(false);

  // Phase 7: Budget Recommendation State
  const [recommendations, setRecommendations] = useState<BudgetRecommendationItem[]>([]);
  const [showRecommendationModal, setShowRecommendationModal] = useState<boolean>(false);
  const [isOptimizingBudget, setIsOptimizingBudget] = useState<boolean>(false);
  const [appliedRecMessage, setAppliedRecMessage] = useState<string | null>(null);

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

  // Fetch / Refresh Estimate for Event
  const refreshEstimate = async (targetEventId: string) => {
    setIsLoadingEstimate(true);
    const res = await getEventEstimate(targetEventId, token || undefined);
    if (res.data) {
      setEstimate(res.data);
      setIsEstimateStale(res.isStale);
    }
    setIsLoadingEstimate(false);
  };

  // Recalculate authoritative estimate
  const handleRecalculateEstimate = async () => {
    if (!eventId) return;
    setIsLoadingEstimate(true);
    const res = await calculateEventEstimate(eventId, version, token || undefined);
    if (res.data) {
      setEstimate(res.data);
      setIsEstimateStale(false);
      setStatusMessage("Fresh estimate calculated and verified!");
    } else if (res.error) {
      setErrorMessage(res.error);
    }
    setIsLoadingEstimate(false);
  };

  // Load Existing Event if eventId provided
  useEffect(() => {
    if (!eventId) return;
    async function loadEvent() {
      const res = await getEventDetails(eventId!, token || undefined);
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
        await refreshEstimate(ev.id);
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
    setIsEstimateStale(true);
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
    setIsEstimateStale(true);
  };

  // Save Plan Draft Handler
  const handleSaveDraft = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      if (!eventId) {
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
        }, token || undefined);

        if (createRes.error || !createRes.data) {
          setErrorMessage(createRes.error || "Failed to create draft");
          setIsSaving(false);
          return;
        }

        const newEvent = createRes.data;
        setEventId(newEvent.id);
        setVersion(newEvent.configuration_version);
        setStatusMessage("Event draft created successfully! (v1)");
        await refreshEstimate(newEvent.id);
      } else {
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
          token || undefined,
          version
        );

        if (updateRes.error) {
          setErrorMessage(updateRes.error);
          setIsSaving(false);
          return;
        }

        const curVer = updateRes.data.configuration_version;
        setVersion(curVer);

        const menuPayload: Array<{
          menu_item_id: string;
          source_type: string;
          selection_group_id?: string | null;
          quantity?: number;
          is_included?: boolean;
        }> = [];

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

        for (const [mId, qty] of Object.entries(customItems)) {
          menuPayload.push({
            menu_item_id: mId,
            source_type: "CUSTOM",
            quantity: qty,
            is_included: true,
          });
        }

        if (menuPayload.length > 0 || selectedPackageId) {
          const cfgRes = await updateEventConfiguration(
            eventId,
            {
              base_version: curVer,
              package_id: selectedPackageId || undefined,
              menu_items: menuPayload,
            },
            token || undefined
          );

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
        await refreshEstimate(eventId);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger Budget Optimization Analysis
  const handleOptimizeBudget = async () => {
    if (!eventId) {
      await handleSaveDraft();
    }
    if (!eventId) return;

    setIsOptimizingBudget(true);
    setErrorMessage(null);
    const res = await getBudgetOptimizations(eventId, budgetMax, token || undefined);
    if (res.data?.recommendations) {
      setRecommendations(res.data.recommendations);
      setShowRecommendationModal(true);
    } else if (res.error) {
      setErrorMessage(res.error);
    }
    setIsOptimizingBudget(false);
  };

  // Apply a Budget Suggestion Atomically
  const handleApplyRecommendation = async (recItem: BudgetRecommendationItem) => {
    if (!eventId) return;
    setIsOptimizingBudget(true);
    setErrorMessage(null);
    setAppliedRecMessage(null);

    const res = await applyBudgetRecommendation(eventId, recItem.id, version, token || undefined);
    if (res.data) {
      setEstimate(res.data);
      setVersion(res.data.event_version);
      setIsEstimateStale(false);
      setAppliedRecMessage(`Applied recommendation: "${recItem.title}". Estimate refreshed!`);
      setShowRecommendationModal(false);

      // Refresh event details
      const evRes = await getEventDetails(eventId, token || undefined);
      if (evRes.data) {
        setServerMenuItems(evRes.data.menu_items || []);
        const custom: Record<string, number> = {};
        for (const it of evRes.data.menu_items) {
          if (it.source_type === "CUSTOM" || it.source_type === "ADDON") {
            custom[it.menu_item_id] = it.quantity || 1;
          }
        }
        setCustomItems(custom);
      }
    } else if (res.error) {
      setErrorMessage(res.error);
    }
    setIsOptimizingBudget(false);
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

  // Fallback client estimated range for instant feedback
  const clientPerPersonRate = activePackage?.indicative_price || (activePackage?.slug?.includes("royal") ? 750 : activePackage?.slug?.includes("deluxe") ? 550 : 450);
  const clientBaseTotal = clientPerPersonRate * guestCount;
  const clientAddonsTotal = Object.entries(customItems).reduce((sum, [itemId, qty]) => {
    const dish = menuItems.find((d) => d.id === itemId);
    const p = dish?.extra_metadata?.addon_price || 85;
    return sum + p * guestCount * qty;
  }, 0);
  const clientEstimatedTotal = (clientBaseTotal + clientAddonsTotal) * 1.10; // includes 5% service + 5% GST
  const displayLower = estimate ? estimate.lower_amount : Math.round(clientEstimatedTotal / 500) * 500;
  const displayUpper = estimate ? estimate.upper_amount : Math.round((clientEstimatedTotal * 1.12) / 500) * 500;
  const displayBudgetStatus = estimate?.budget?.status || (displayUpper <= budgetMax ? "WITHIN_BUDGET" : displayUpper <= budgetMax * 1.15 ? "SLIGHTLY_ABOVE" : "ABOVE_BUDGET");

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-24">
      {/* Header Banner */}
      <div className="border-b border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Phase 6 • Authoritative Pricing & Estimate Engine
              </span>
              {eventId && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                  v{version} • {eventId.slice(0, 8)}...
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              Plan & Estimate Your Catering
            </h1>
            <p className="text-sm text-neutral-400 mt-0.5">
              Customize authentic menus, check real-time estimated pricing ranges, and optimize toward your budget.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {eventId && (
              <button
                type="button"
                onClick={openHistory}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-medium transition"
              >
                📜 Version History (v{version})
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              {isSaving ? "Saving Draft..." : "💾 Save Plan Draft"}
            </button>
          </div>
        </div>

        {/* Notifications */}
        {statusMessage && (
          <div className="max-w-7xl mx-auto mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <span>✅ {statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-emerald-200">✕</button>
          </div>
        )}
        {appliedRecMessage && (
          <div className="max-w-7xl mx-auto mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center justify-between">
            <span>💡 {appliedRecMessage}</span>
            <button onClick={() => setAppliedRecMessage(null)} className="text-blue-400 hover:text-blue-200">✕</button>
          </div>
        )}
        {errorMessage && (
          <div className="max-w-7xl mx-auto mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
            <span>⚠️ {errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-200">✕</button>
          </div>
        )}

        {/* Step Progression Bar */}
        <div className="max-w-7xl mx-auto mt-6">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-medium">
            <button
              onClick={() => setStep(1)}
              className={`py-2.5 px-2 rounded-xl transition border ${
                step === 1
                  ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                  : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:bg-neutral-800"
              }`}
            >
              1. Event & Budget
            </button>
            <button
              onClick={() => setStep(2)}
              className={`py-2.5 px-2 rounded-xl transition border ${
                step === 2
                  ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                  : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:bg-neutral-800"
              }`}
            >
              2. Package & Selection
            </button>
            <button
              onClick={() => setStep(3)}
              className={`py-2.5 px-2 rounded-xl transition border ${
                step === 3
                  ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                  : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:bg-neutral-800"
              }`}
            >
              3. Add-ons & Custom Menu
            </button>
            <button
              onClick={() => setStep(4)}
              className={`py-2.5 px-2 rounded-xl transition border ${
                step === 4
                  ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                  : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:bg-neutral-800"
              }`}
            >
              4. Review & Price Estimate
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Interactive Wizard (Col 8) */}
        <div className="lg:col-span-8 space-y-8">
          {/* STEP 1: Details & Budget */}
          {step === 1 && (
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🗓️</span> Step 1: Event Information & Budget Target
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Function Type *
                  </label>
                  <select
                    value={selectedFunctionId}
                    onChange={(e) => setSelectedFunctionId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select Function Type</option>
                    {functions.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Service Style / Offering
                  </label>
                  <select
                    value={selectedOfferingId}
                    onChange={(e) => setSelectedOfferingId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select Catering Offering</option>
                    {offerings.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Expected Guest Count *
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Target Budget (₹ Max)
                  </label>
                  <input
                    type="number"
                    step={5000}
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Event Time
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Venue Name & City
                  </label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="e.g. N Convention Center, Madhapur, Hyderabad"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition"
                >
                  Continue to Packages →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Package & Selection Groups */}
          {step === 2 && (
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🍽️</span> Step 2: Choose Curated Package & Selection Groups
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {packages.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => {
                        setSelectedPackageId(pkg.id);
                        setIsEstimateStale(true);
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10"
                          : "bg-neutral-950/60 border-neutral-800 hover:border-neutral-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-white text-sm">{pkg.name}</h3>
                          {isSelected && <span className="text-xs text-amber-400 font-bold">✓ Selected</span>}
                        </div>
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{pkg.description}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                        <span>👥 {pkg.min_guests || 50} - {pkg.max_guests || 1000} guests</span>
                        <span className="font-bold text-amber-400">₹{pkg.indicative_price || 550}/plate</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selection Groups */}
              {activePackage?.selection_groups && activePackage.selection_groups.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-neutral-800">
                  <h3 className="font-bold text-sm text-white">
                    Selection Rules for {activePackage.name}
                  </h3>
                  {activePackage.selection_groups.map((grp) => {
                    const selectedForGroup = groupSelections[grp.id] || [];
                    const isMet = selectedForGroup.length >= grp.min_selections;
                    return (
                      <div key={grp.id} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-white text-sm block">{grp.name}</span>
                            <span className="text-neutral-400">
                              Choose {grp.min_selections} to {grp.max_selections} dishes
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              isMet
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            Selected: {selectedForGroup.length}/{grp.max_selections}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          {grp.items?.map((gItem) => {
                            const isPicked = selectedForGroup.includes(gItem.menu_item_id);
                            const dish = gItem.menu_item || menuItems.find((m) => m.id === gItem.menu_item_id);
                            return (
                              <button
                                key={gItem.id}
                                type="button"
                                onClick={() => toggleGroupSelection(grp.id, gItem.menu_item_id, grp.max_selections)}
                                className={`p-2.5 rounded-lg text-left text-xs border transition flex items-center justify-between ${
                                  isPicked
                                    ? "bg-amber-500/15 border-amber-500 text-white font-medium"
                                    : "bg-neutral-900 border-neutral-800/80 text-neutral-300 hover:border-neutral-700"
                                }`}
                              >
                                <span>{dish?.name || "Dish"}</span>
                                <span>{isPicked ? "✓" : "+"}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-4 border-t border-neutral-800 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 hover:bg-neutral-800 text-sm font-medium transition"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition"
                >
                  Continue to Add-ons →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Add-ons & Custom Menu Builder */}
          {step === 3 && (
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🍛</span> Step 3: Browse Authentic Catalog & Add Custom Dishes
              </h2>

              {/* Category Pills & Filters */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setActiveCategory("ALL")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      activeCategory === "ALL"
                        ? "bg-amber-500 text-neutral-950 font-bold"
                        : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                  >
                    All Categories ({menuItems.length})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        activeCategory === cat.id
                          ? "bg-amber-500 text-neutral-950 font-bold"
                          : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search dishes (e.g. Biryani, Gongura, Pootharekulu)..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <select
                    value={dietaryFilter}
                    onChange={(e) => setDietaryFilter(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ALL">All Diets</option>
                    <option value="VEG">Vegetarian</option>
                    <option value="NON_VEG">Non-Veg</option>
                    <option value="VEGAN">Vegan</option>
                  </select>
                </div>
              </div>

              {/* Dish Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                {filteredDishes.map((dish) => {
                  const qty = customItems[dish.id] || 0;
                  const addonPrice = dish.extra_metadata?.addon_price || 85;
                  return (
                    <div
                      key={dish.id}
                      className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/90 flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-white text-xs leading-snug">{dish.name}</h4>
                          <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">{dish.description}</p>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono whitespace-nowrap">
                          +₹{addonPrice}/guest
                        </span>
                      </div>

                      <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-xs">
                        <span className="text-neutral-500 text-[11px] uppercase">
                          {dish.dietary_type || "VEG"}
                        </span>
                        <div className="flex items-center gap-2">
                          {qty > 0 && (
                            <>
                              <button
                                onClick={() => modifyCustomItem(dish.id, -1)}
                                className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-bold flex items-center justify-center text-xs"
                              >
                                -
                              </button>
                              <span className="font-bold text-amber-400 text-xs px-1">{qty}</span>
                            </>
                          )}
                          <button
                            onClick={() => modifyCustomItem(dish.id, 1)}
                            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium text-xs transition"
                          >
                            + Add Dish
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 hover:bg-neutral-800 text-sm font-medium transition"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition"
                >
                  Review Price Estimate →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Authoritative Estimate Breakdown */}
          {step === 4 && (
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>📊</span> Step 4: Plan Review & Estimated Price Range
                </h2>
                <button
                  onClick={handleRecalculateEstimate}
                  disabled={isLoadingEstimate || !eventId}
                  className="text-xs px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-semibold transition"
                >
                  {isLoadingEstimate ? "Calculating..." : "🔄 Refresh Estimate"}
                </button>
              </div>

              {/* Estimate Highlights Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-neutral-900 to-neutral-950 border border-amber-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold">
                      Authoritative Estimated Range
                    </span>
                    <div className="text-3xl font-extrabold text-white tracking-tight mt-0.5 font-mono">
                      ₹{displayLower.toLocaleString()} – ₹{displayUpper.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        displayBudgetStatus === "WITHIN_BUDGET"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : displayBudgetStatus === "SLIGHTLY_ABOVE"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : displayBudgetStatus === "ABOVE_BUDGET"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-neutral-800 text-neutral-300"
                      }`}
                    >
                      {displayBudgetStatus.replace("_", " ")}
                    </span>
                    <div className="text-[11px] text-neutral-400 mt-1">
                      Target Budget: ₹{budgetMax.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Overrun action button */}
                {displayBudgetStatus !== "WITHIN_BUDGET" && (
                  <div className="pt-3 border-t border-amber-500/20 flex items-center justify-between">
                    <span className="text-xs text-amber-300">
                      Estimate exceeds target budget. Would you like AI/rule recommendations?
                    </span>
                    <button
                      onClick={handleOptimizeBudget}
                      disabled={isOptimizingBudget}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow transition"
                    >
                      {isOptimizingBudget ? "Analyzing..." : "💡 Optimize Budget"}
                    </button>
                  </div>
                )}
              </div>

              {/* Explainable Line Item Breakdown Table */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-white">Itemized Estimate Breakdown</h3>
                <div className="rounded-xl border border-neutral-800 overflow-hidden bg-neutral-950">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Component</th>
                        <th className="p-3 text-right">Rate / Unit</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900 text-neutral-200">
                      {estimate?.breakdown ? (
                        estimate.breakdown.map((item, idx) => (
                          <tr key={idx} className="hover:bg-neutral-900/30">
                            <td className="p-3 font-medium">{item.description}</td>
                            <td className="p-3 text-right text-neutral-400">
                              {item.rate ? `₹${item.rate}` : "—"}
                            </td>
                            <td className="p-3 text-right font-bold text-white font-mono">
                              ₹{Math.round(item.amount).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <>
                          <tr>
                            <td className="p-3 font-medium">Base Package ({activePackage?.name || "Curated Menu"})</td>
                            <td className="p-3 text-right text-neutral-400">₹{clientPerPersonRate}/guest</td>
                            <td className="p-3 text-right font-bold text-white font-mono">₹{clientBaseTotal.toLocaleString()}</td>
                          </tr>
                          {clientAddonsTotal > 0 && (
                            <tr>
                              <td className="p-3 font-medium">Custom Add-on Dishes ({Object.keys(customItems).length} items)</td>
                              <td className="p-3 text-right text-neutral-400">Variable</td>
                              <td className="p-3 text-right font-bold text-white font-mono">₹{clientAddonsTotal.toLocaleString()}</td>
                            </tr>
                          )}
                          <tr>
                            <td className="p-3 font-medium">Service, Staffing & Live Counter Charge (5%)</td>
                            <td className="p-3 text-right text-neutral-400">5.0%</td>
                            <td className="p-3 text-right font-bold text-white font-mono">
                              ₹{Math.round((clientBaseTotal + clientAddonsTotal) * 0.05).toLocaleString()}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-3 font-medium">Estimated Catering GST (5%)</td>
                            <td className="p-3 text-right text-neutral-400">5.0%</td>
                            <td className="p-3 text-right font-bold text-white font-mono">
                              ₹{Math.round((clientBaseTotal + clientAddonsTotal) * 1.05 * 0.05).toLocaleString()}
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Customer Disclaimer (FR-EST-002) */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 space-y-1">
                <span className="font-bold text-amber-400 block">⚠️ Official Estimation Disclaimer</span>
                <p>
                  {estimate?.disclaimer ||
                    "Estimated price only. Final quotation is subject to caterer confirmation."}
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Special Catering Instructions / Chef Notes
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g. Jain food counters required, mild spice level for starters..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Step 4 Actions */}
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
              <h3 className="font-bold text-sm text-white">Live Estimate Summary</h3>
              <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
                v{version}
              </span>
            </div>

            {/* Estimated Price Range Card */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Estimated Range</span>
                {isEstimateStale && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold">
                    Stale (Save to update)
                  </span>
                )}
              </div>
              <div className="text-xl font-bold text-amber-400 font-mono">
                ₹{displayLower.toLocaleString()} – ₹{displayUpper.toLocaleString()}
              </div>

              {/* Budget Meter */}
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Target: ₹{budgetMax.toLocaleString()}</span>
                  <span
                    className={`font-semibold ${
                      displayBudgetStatus === "WITHIN_BUDGET"
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {displayBudgetStatus.replace("_", " ")}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      displayBudgetStatus === "WITHIN_BUDGET"
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((displayUpper / budgetMax) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Optimize Budget Button */}
            {displayBudgetStatus !== "WITHIN_BUDGET" && (
              <button
                type="button"
                onClick={handleOptimizeBudget}
                disabled={isOptimizingBudget}
                className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <span>💡</span> Optimize Budget Suggestions
              </button>
            )}

            {/* Event Metrics */}
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-neutral-800/80 text-xs">
              <div>
                <span className="text-neutral-500 block">Guests</span>
                <span className="font-bold text-white text-sm">{guestCount}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Package</span>
                <span className="font-bold text-white text-xs truncate block">
                  {activePackage?.name || "Custom Menu"}
                </span>
              </div>
            </div>

            {/* Planned Items */}
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
          </div>
        </div>
      </div>

      {/* Budget Optimization Modal */}
      {showRecommendationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-lg">💡</span>
                <h3 className="font-bold text-base text-white">Budget Optimization Suggestions</h3>
              </div>
              <button
                onClick={() => setShowRecommendationModal(false)}
                className="text-neutral-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Non-destructive proposals calculated to bring your catering configuration within your target ₹
              {budgetMax.toLocaleString()} budget.
            </p>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {recommendations.length === 0 ? (
                <div className="text-center py-6 text-xs text-neutral-400">
                  No automated reduction suggestions found. Your configuration is near optimum!
                </div>
              ) : (
                recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-white">{rec.title}</h4>
                        <p className="text-xs text-neutral-400 mt-1">{rec.explanation}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold whitespace-nowrap">
                        Save ~₹{Math.round(rec.estimated_savings).toLocaleString()}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-xs">
                      <span className="text-neutral-400">
                        Projected: ₹{rec.projected_range.lower.toLocaleString()} – ₹
                        {rec.projected_range.upper.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleApplyRecommendation(rec)}
                        disabled={isOptimizingBudget}
                        className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition"
                      >
                        Apply Suggestion
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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
                  <div className="text-neutral-300 font-medium">
                    {ver.change_reason || "Updated configuration"}
                  </div>
                  <div className="text-neutral-500 text-[11px]">
                    Guest Count: {ver.snapshot?.guest_count || "N/A"} • Items:{" "}
                    {ver.snapshot?.menu_items?.length || 0}
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
