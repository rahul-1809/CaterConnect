"use client";

import React, { useState, useEffect, useRef } from "react";
import { User } from "@/lib/types";
import {
  getCurrentAdmin,
  logoutAdmin,
  requestAdminOTP,
  verifyAdminOTP,
  getPricingVersions,
} from "@/lib/api";
import {
  Utensils,
  ShieldCheck,
  Phone,
  ArrowRight,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  LogOut,
  Layers,
  Calculator,
  Sliders,
  TrendingUp,
} from "lucide-react";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Login form state
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [challengeId, setChallengeId] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pricingVersions, setPricingVersions] = useState<any[]>([]);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Restore session
  useEffect(() => {
    async function restore() {
      const storedToken = localStorage.getItem("caterconnect_admin_token");
      if (storedToken) {
        setToken(storedToken);
        const res = await getCurrentAdmin(storedToken);
        if (res.data) {
          setUser(res.data);
        } else {
          localStorage.removeItem("caterconnect_admin_token");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoadingAuth(false);
    }
    restore();
  }, []);

  // Load pricing info when authed
  useEffect(() => {
    if (user && token) {
      getPricingVersions(token).then((res) => {
        if (res.data) setPricingVersions(res.data);
      });
    }
  }, [user, token]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number");
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await requestAdminOTP(cleanPhone, countryCode);
      if (res.error || !res.data) {
        setErrorMsg(res.error || "Failed to send OTP.");
      } else {
        setChallengeId(res.data.challenge_id);
        setDevOtp(res.data.dev_otp || null);
        setStep("OTP");
        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 100);
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otpValue];
    if (val.length > 1) {
      const pastedChars = val.slice(0, 6).split("");
      pastedChars.forEach((c, idx) => {
        newOtp[idx] = c;
      });
      setOtpValue(newOtp);
      const nextIndex = Math.min(pastedChars.length, 5);
      otpInputsRef.current[nextIndex]?.focus();
      return;
    }
    newOtp[index] = val;
    setOtpValue(newOtp);
    if (val && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleVerifySubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpValue.join("");
    if (fullOtp.length < 6) {
      setErrorMsg("Please enter complete 6-digit code");
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await verifyAdminOTP(challengeId, fullOtp);
      if (res.error || !res.data) {
        setErrorMsg(res.error || "Verification failed");
      } else {
        setUser(res.data.user);
        if (res.data.session_token) {
          setToken(res.data.session_token);
          localStorage.setItem("caterconnect_admin_token", res.data.session_token);
        }
      }
    } catch {
      setErrorMsg("Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin(token || undefined);
    } catch {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("caterconnect_admin_token");
      setStep("PHONE");
      setPhoneNumber("");
      setOtpValue(["", "", "", "", "", ""]);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-orange-500" />
        Authenticating CaterConnect Admin...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Admin Navbar */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/20">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>CaterConnect</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-orange-950/80 text-orange-400 border border-orange-800/80 font-mono uppercase">
                Admin Console
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400">Operations, Catalog & Authoritative Pricing Control</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right text-xs">
              <p className="font-semibold text-zinc-200">{user.phone_country_code} {user.phone_number}</p>
              <span className="text-[10px] text-emerald-400 font-mono">Role: {user.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8">
        {!user ? (
          /* Login Box */
          <div className="max-w-md mx-auto my-12 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Caterer Portal Sign In</h2>
              <p className="text-xs text-zinc-400">
                Enter your authorized mobile number to access backend operations and pricing rules.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-900/60 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {step === "PHONE" ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Phone Number
                  </label>
                  <div className="flex rounded-xl border border-zinc-700 bg-zinc-800/60 overflow-hidden focus-within:ring-2 focus-within:ring-orange-500">
                    <span className="px-3.5 py-2.5 bg-zinc-800 border-r border-zinc-700 text-zinc-300 font-semibold text-sm">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98765 43210"
                      maxLength={10}
                      className="w-full px-3.5 py-2.5 bg-transparent text-white focus:outline-none text-sm font-medium"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-800/40 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <span>Staff / Admin Demo:</span>
                  <button
                    type="button"
                    onClick={() => setPhoneNumber("9876543210")}
                    className="font-mono text-orange-400 hover:underline px-2 py-0.5 rounded bg-zinc-800"
                  >
                    9876543210
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || phoneNumber.replace(/\D/g, "").length < 10}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-sm shadow-md shadow-orange-600/20 disabled:opacity-50 transition"
                >
                  {isSubmitting ? "Requesting OTP..." : "Get Verification Code →"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifySubmit} className="space-y-5">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Sent to {countryCode} {phoneNumber}</span>
                  <button
                    type="button"
                    onClick={() => setStep("PHONE")}
                    className="text-orange-400 hover:underline"
                  >
                    Change
                  </button>
                </div>

                {devOtp && (
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-center justify-between text-xs text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>Dev OTP: <strong>{devOtp}</strong></span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpValue(devOtp.split("").slice(0, 6))}
                      className="px-2 py-0.5 rounded bg-amber-600 text-white font-semibold text-[11px]"
                    >
                      Fill
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-6 gap-2">
                  {otpValue.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpInputsRef.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      className="w-full h-12 text-center text-lg font-bold rounded-xl border border-zinc-700 bg-zinc-800/80 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otpValue.join("").length < 6}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-sm shadow-md shadow-orange-600/20 disabled:opacity-50 transition"
                >
                  {isSubmitting ? "Verifying..." : "Verify & Sign In →"}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400 font-medium">Pricing Version</span>
                <p className="text-xl font-bold text-white font-mono">v1.0-2026-AUTUMN</p>
                <span className="text-[10px] text-emerald-400">● Live & Active</span>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400 font-medium">Curated Dishes</span>
                <p className="text-xl font-bold text-orange-400">45+ Authentic Items</p>
                <span className="text-[10px] text-zinc-500">Andhra & Telangana</span>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400 font-medium">Pricing Engine</span>
                <p className="text-xl font-bold text-amber-400">Authoritative</p>
                <span className="text-[10px] text-zinc-500">Base + Tier + Addon</span>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400 font-medium">Budget Engine</span>
                <p className="text-xl font-bold text-white">Rule & AI Powered</p>
                <span className="text-[10px] text-emerald-400">Auto Optimization</span>
              </div>
            </div>

            {/* Operations Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pricing Rules Overview */}
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-orange-400" />
                    <span>Active Pricing Rules</span>
                  </h3>
                  <span className="text-xs font-mono text-zinc-400">ID: pver-1</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between">
                    <div>
                      <p className="font-semibold text-white">Guest Tier Multipliers</p>
                      <p className="text-zinc-400">&lt;50: 1.15x | 50-149: 1.05x | 150-499: 1.00x | 500+: 0.92x</p>
                    </div>
                    <span className="text-emerald-400 font-bold">Enabled</span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between">
                    <div>
                      <p className="font-semibold text-white">Service Format Multipliers</p>
                      <p className="text-zinc-400">Plantain Leaf: 1.00x | Imperial Buffet: 1.08x | Live Stations: 1.20x</p>
                    </div>
                    <span className="text-emerald-400 font-bold">Enabled</span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between">
                    <div>
                      <p className="font-semibold text-white">Taxes & Service Charges</p>
                      <p className="text-zinc-400">GST: 5.0% | Operations & Staffing: 7.0%</p>
                    </div>
                    <span className="text-emerald-400 font-bold">Standard</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-zinc-800">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>Admin Actions</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href="http://localhost:3000/menu"
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-orange-500/50 transition group block"
                  >
                    <Utensils className="w-5 h-5 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="font-bold text-sm text-white">View Customer Menu</p>
                    <p className="text-[11px] text-zinc-400 mt-1">Preview authentic Telugu catalog live</p>
                  </a>

                  <a
                    href="http://localhost:3000/plan"
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-orange-500/50 transition group block"
                  >
                    <Calculator className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="font-bold text-sm text-white">Test Pricing Planner</p>
                    <p className="text-[11px] text-zinc-400 mt-1">Run estimate and budget engine</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
