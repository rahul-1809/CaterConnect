export type UserRole = "CUSTOMER" | "ADMIN" | "STAFF";

export interface User {
  id: string;
  phone_number: string;
  phone_country_code: string;
  role: UserRole;
  is_active: boolean;
  last_login_at?: string | null;
}

export interface OTPRequestResult {
  challenge_id: string;
  expires_in_seconds: number;
  retry_after_seconds: number;
  dev_otp?: string | null;
}

export interface OTPVerifyResult {
  user: User;
  session_token?: string | null;
}
