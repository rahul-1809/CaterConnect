"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Phone,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Utensils,
} from "lucide-react";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, requestOtp, verifyOtp } = useAuth();

  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [challengeId, setChallengeId] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state on open/close
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep("PHONE");
      setOtpValue(["", "", "", "", "", ""]);
      setErrorMsg(null);
      setIsLoading(false);
      setDevOtp(null);
    }
  }, [isAuthModalOpen]);

  // Countdown timer for resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "OTP" && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      setCanResend(false);
    } else if (step === "OTP" && countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isAuthModalOpen) return null;

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await requestOtp(cleanPhone, countryCode);
      if (res.error || !res.challengeId) {
        setErrorMsg(res.error || "Failed to send OTP. Please try again.");
      } else {
        setChallengeId(res.challengeId);
        setDevOtp(res.devOtp || null);
        setStep("OTP");
        setCountdown(30);
        setCanResend(false);
        // Focus first OTP field
        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 100);
      }
    } catch {
      setErrorMsg("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otpValue];
    // Handle paste or multi-character
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

    // Auto move to next input
    if (val && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValue[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifySubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpValue.join("");
    if (fullOtp.length < 6) {
      setErrorMsg("Please enter complete 6-digit verification code");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await verifyOtp(challengeId, fullOtp);
      if (!res.success) {
        setErrorMsg(res.error || "Invalid OTP code. Please try again.");
      }
    } catch {
      setErrorMsg("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoFillDevOtp = () => {
    if (!devOtp) return;
    const digits = devOtp.split("").slice(0, 6);
    setOtpValue(digits);
    setErrorMsg(null);
  };

  const handleResendOtp = async () => {
    if (!canResend || isLoading) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      const res = await requestOtp(cleanPhone, countryCode);
      if (res.error || !res.challengeId) {
        setErrorMsg(res.error || "Failed to resend OTP.");
      } else {
        setChallengeId(res.challengeId);
        setDevOtp(res.devOtp || null);
        setCountdown(30);
        setCanResend(false);
        setOtpValue(["", "", "", "", "", ""]);
        otpInputsRef.current[0]?.focus();
      }
    } catch {
      setErrorMsg("Failed to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl shadow-orange-950/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Background Graphic */}
        <div className="relative bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-6 text-white">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">CaterConnect</h2>
              <p className="text-xs text-orange-100 font-medium tracking-wide">
                Bespoke Andhra & Hyderabadi Feasts
              </p>
            </div>
          </div>

          <p className="text-sm text-orange-50 font-normal mt-2">
            {step === "PHONE"
              ? "Sign in with your mobile number to personalize your menus and save event estimates."
              : `Enter the 6-digit OTP code sent to ${countryCode} ${phoneNumber}`}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-sm animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="leading-snug">{errorMsg}</p>
            </div>
          )}

          {step === "PHONE" ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                  Mobile Number
                </label>
                <div className="flex rounded-2xl border border-zinc-300 dark:border-zinc-700 overflow-hidden focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 bg-zinc-50 dark:bg-zinc-800/60 transition-all">
                  <div className="flex items-center gap-1.5 px-3.5 bg-zinc-100 dark:bg-zinc-800 border-r border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-sm">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="98765 43210"
                    maxLength={10}
                    autoFocus
                    className="w-full px-4 py-3 bg-transparent text-zinc-900 dark:text-white font-medium text-base placeholder:text-zinc-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick Dev / Demo Phone Preset */}
              <div className="bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-orange-950 dark:text-orange-200">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span>Demo Account:</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPhoneNumber("9876543210")}
                  className="text-xs font-semibold text-orange-700 dark:text-orange-400 hover:underline px-2 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-orange-200 dark:border-orange-800"
                >
                  9876543210
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || phoneNumber.replace(/\D/g, "").length < 10}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold shadow-lg shadow-orange-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <span>Get Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Secure SMS login. No password required.</span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pb-1">
                <span>Code sent to {countryCode} {phoneNumber}</span>
                <button
                  type="button"
                  onClick={() => {
                    setStep("PHONE");
                    setErrorMsg(null);
                  }}
                  className="font-semibold text-orange-600 dark:text-orange-400 hover:underline"
                >
                  Change Number
                </button>
              </div>

              {/* Dev Mode OTP auto-fill banner */}
              {devOtp && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    <span>Dev OTP: <strong>{devOtp}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillDevOtp}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-colors"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {/* 6-Digit OTP Box Grid */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2.5">
                  Enter 6-Digit Code
                </label>
                <div className="grid grid-cols-6 gap-2 sm:gap-3">
                  {otpValue.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputsRef.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-full h-12 sm:h-14 text-center text-xl font-bold rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpValue.join("").length < 6}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold shadow-lg shadow-orange-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Sign In</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                <span>Didn't receive the SMS?</span>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Resend Code
                  </button>
                ) : (
                  <span className="text-zinc-400 dark:text-zinc-500 font-medium">
                    Resend in {countdown}s
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
