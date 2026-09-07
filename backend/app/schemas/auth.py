"""
CaterConnect Backend — Authentication & User Schemas
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator
import phonenumbers


class OTPRequestIn(BaseModel):
    """Request payload for initiating OTP challenge."""

    phone_number: str = Field(..., description="Mobile phone number, e.g. 9876543210 or +919876543210")
    country_code: str = Field(default="+91", description="Country code prefix, e.g. +91")

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = v.strip().replace(" ", "").replace("-", "")
        if not cleaned:
            raise ValueError("Phone number cannot be empty")
        return cleaned


class OTPRequestData(BaseModel):
    challenge_id: str
    expires_in_seconds: int
    retry_after_seconds: int
    dev_otp: Optional[str] = Field(None, description="Only populated in development mode for easy testing")


class OTPVerifyIn(BaseModel):
    """Request payload for verifying OTP code."""

    challenge_id: str = Field(..., description="Challenge ID received from /auth/otp/request")
    otp: str = Field(..., min_length=4, max_length=10, description="The OTP code entered by user")


class CustomerProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None


class UserSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    phone_number: str
    phone_country_code: str
    role: str
    is_active: bool


class CurrentUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    phone_number: str
    phone_country_code: str
    role: str
    is_active: bool
    last_login_at: Optional[datetime] = None
    customer_profile: Optional[CustomerProfileOut] = None


class OTPVerifyData(BaseModel):
    user: CurrentUserOut
    session_token: Optional[str] = None  # Returned in payload for non-cookie / mobile clients
