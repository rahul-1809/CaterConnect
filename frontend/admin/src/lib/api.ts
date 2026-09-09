import { OTPRequestResult, OTPVerifyResult, User } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function requestAdminOTP(
  phoneNumber: string,
  countryCode: string = "+91"
): Promise<{ data: OTPRequestResult | null; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/otp/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone_number: phoneNumber,
        country_code: countryCode,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      return {
        data: null,
        error: json.detail?.message || json.message || "Failed to send OTP",
      };
    }
    return { data: json.data };
  } catch (err: any) {
    return { data: null, error: err.message || "Network error" };
  }
}

export async function verifyAdminOTP(
  challengeId: string,
  otpCode: string
): Promise<{ data: OTPVerifyResult | null; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        challenge_id: challengeId,
        otp: otpCode,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      return {
        data: null,
        error: json.detail?.message || json.message || "Invalid or expired OTP",
      };
    }
    return { data: json.data };
  } catch (err: any) {
    return { data: null, error: err.message || "Network error" };
  }
}

export async function getCurrentAdmin(
  token?: string
): Promise<{ data: User | null; error?: string }> {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers,
      credentials: "include",
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { data: null, error: json.detail?.message || "Not authenticated" };
    }
    const json = await res.json();
    return { data: json.data };
  } catch (err: any) {
    return { data: null, error: err.message || "Network error" };
  }
}

export async function logoutAdmin(token?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers,
      credentials: "include",
    });
    if (res.ok || res.status === 204) {
      return { success: true };
    }
    return { success: false, error: "Failed to logout" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}

export async function getPricingVersions(token?: string): Promise<{ data: any[] | null; error?: string }> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/admin/pricing/versions`, { headers });
    if (res.ok) {
      const json = await res.json();
      return { data: json.data || [] };
    }
    return { data: [] };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}
