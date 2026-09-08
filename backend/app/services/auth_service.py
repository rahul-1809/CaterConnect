"""
CaterConnect Backend — Authentication Service
Handles phone normalization, OTP generation/verification, user creation, and session management.
"""

from datetime import UTC, datetime, timedelta

import phonenumbers
from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.core.logging import get_logger
from app.core.security import (
    create_session_token,
    generate_otp,
    hash_otp,
    verify_otp_hash,
)
from app.models.user import CustomerProfile, OTPChallenge, User, UserRole

logger = get_logger(__name__)


def normalize_phone_number(phone_raw: str, default_region: str = "IN") -> tuple[str, str]:
    """
    Parse and normalize a phone number into (E.164 full number, country code).
    Examples:
      '9876543210' -> ('+919876543210', '+91')
      '+919876543210' -> ('+919876543210', '+91')
    """
    try:
        parsed = phonenumbers.parse(phone_raw, default_region)
        if not phonenumbers.is_valid_number(parsed):
            raise ValueError("Invalid phone number")
        e164 = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
        country_code = f"+{parsed.country_code}"
        return e164, country_code
    except Exception:
        # Fallback for simple 10-digit Indian numbers if phonenumbers fails
        digits = "".join(filter(str.isdigit, phone_raw))
        if len(digits) == 10:
            return f"+91{digits}", "+91"
        elif len(digits) == 12 and digits.startswith("91"):
            return f"+{digits}", "+91"
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "code": "AUTH_INVALID_PHONE_NUMBER",
                "message": f"'{phone_raw}' is not a valid mobile phone number.",
            },
        )


async def check_otp_rate_limit(db: AsyncSession, phone_number: str) -> None:
    """
    Enforce rate limits on OTP generation:
    1. Cooldown period (30s) between successive requests.
    2. Hourly limit (e.g. max 5 OTPs per hour).
    """
    settings = get_settings()
    now = datetime.now(tz=UTC)
    window_start = now - timedelta(seconds=settings.otp_rate_limit_window_seconds)
    cooldown_cutoff = now - timedelta(seconds=30)

    # Check cooldown (most recent challenge)
    recent_stmt = (
        select(OTPChallenge)
        .where(
            OTPChallenge.phone_number == phone_number,
            OTPChallenge.created_at >= cooldown_cutoff,
        )
        .order_by(OTPChallenge.created_at.desc())
        .limit(1)
    )
    recent_res = await db.execute(recent_stmt)
    recent_challenge = recent_res.scalar_one_or_none()
    if recent_challenge:
        created_at = recent_challenge.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=UTC)
        seconds_passed = int((now - created_at).total_seconds())
        retry_after = max(1, 30 - seconds_passed)
        if retry_after > 0:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "code": "AUTH_OTP_RATE_LIMITED",
                    "message": f"Please wait {retry_after} seconds before requesting another OTP.",
                    "retry_after_seconds": retry_after,
                },
            )

    # Check hourly limit count
    count_stmt = select(func.count(OTPChallenge.id)).where(
        OTPChallenge.phone_number == phone_number,
        OTPChallenge.created_at >= window_start,
    )
    count_res = await db.execute(count_stmt)
    total_in_window = count_res.scalar() or 0
    if total_in_window >= settings.otp_rate_limit_requests:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "code": "AUTH_OTP_HOURLY_LIMIT_EXCEEDED",
                "message": (
                    f"Too many OTP requests. Maximum "
                    f"{settings.otp_rate_limit_requests} attempts per hour."
                ),
                "retry_after_seconds": settings.otp_rate_limit_window_seconds,
            },
        )


async def create_otp_challenge(
    db: AsyncSession,
    phone_number_raw: str,
    country_code_hint: str = "+91",
) -> tuple[OTPChallenge, str]:
    """
    Normalize phone number, verify rate limits, generate OTP code and persist hashed challenge.
    Returns (OTPChallenge, raw_otp_code).
    """
    settings = get_settings()
    e164_phone, country_code = normalize_phone_number(phone_number_raw)

    await check_otp_rate_limit(db, e164_phone)

    raw_otp = generate_otp(6)
    code_hash = hash_otp(raw_otp)
    expires_at = datetime.now(tz=UTC) + timedelta(seconds=settings.otp_expire_seconds)

    challenge = OTPChallenge(
        phone_number=e164_phone,
        country_code=country_code,
        code_hash=code_hash,
        expires_at=expires_at,
        attempt_count=0,
        max_attempts=settings.otp_max_attempts,
        provider="dev" if settings.otp_dev_mode else "sms",
    )
    db.add(challenge)
    await db.commit()
    await db.refresh(challenge)

    logger.info(
        "otp_challenge_created",
        challenge_id=challenge.id,
        phone=e164_phone,
        expires_at=expires_at.isoformat(),
    )

    return challenge, raw_otp


async def verify_otp_code(
    db: AsyncSession,
    challenge_id: str,
    otp_code: str,
) -> tuple[User, str]:
    """
    Validate challenge and OTP.
    On success, create or fetch user, establish session, and return (user, token).
    """
    stmt = select(OTPChallenge).where(OTPChallenge.id == challenge_id)
    res = await db.execute(stmt)
    challenge = res.scalar_one_or_none()

    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "AUTH_OTP_CHALLENGE_NOT_FOUND",
                "message": "OTP challenge not found or has expired.",
            },
        )

    if challenge.is_consumed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "AUTH_OTP_ALREADY_CONSUMED",
                "message": "This OTP has already been used. Please request a new one.",
            },
        )

    if challenge.is_expired:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "AUTH_OTP_EXPIRED",
                "message": "This OTP has expired. Please request a new one.",
            },
        )

    if challenge.is_max_attempts_exceeded:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "code": "AUTH_OTP_MAX_ATTEMPTS",
                "message": "Maximum OTP verification attempts exceeded. Please request a new code.",
            },
        )

    if not verify_otp_hash(otp_code, challenge.code_hash):
        challenge.attempt_count += 1
        await db.commit()
        remaining = max(0, challenge.max_attempts - challenge.attempt_count)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "AUTH_OTP_INVALID",
                "message": f"Invalid OTP code. {remaining} attempt(s) remaining.",
                "attempts_remaining": remaining,
            },
        )

    # Valid OTP -> Consume challenge
    now = datetime.now(tz=UTC)
    challenge.consumed_at = now

    # Find or create User
    user_stmt = (
        select(User)
        .options(selectinload(User.customer_profile))
        .where(User.phone_number == challenge.phone_number)
    )
    user_res = await db.execute(user_stmt)
    user = user_res.scalar_one_or_none()

    if not user:
        user = User(
            phone_number=challenge.phone_number,
            phone_country_code=challenge.country_code,
            role=UserRole.CUSTOMER.value,
            is_active=True,
            last_login_at=now,
        )
        db.add(user)
        await db.flush()

        # Create linked customer profile
        profile = CustomerProfile(user_id=user.id)
        db.add(profile)
        logger.info("new_customer_registered", user_id=user.id, phone=user.phone_number)
    else:
        user.last_login_at = now
        logger.info("customer_logged_in", user_id=user.id, phone=user.phone_number)

    await db.commit()
    await db.refresh(user)

    # Re-fetch with customer_profile loaded
    user_stmt = select(User).options(selectinload(User.customer_profile)).where(User.id == user.id)
    user_res = await db.execute(user_stmt)
    user = user_res.scalar_one()

    # Generate JWT session token
    session_token = create_session_token(user_id=user.id, role=user.role)
    return user, session_token


async def get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
    """Retrieve user with profile by UUID."""
    stmt = (
        select(User)
        .options(selectinload(User.customer_profile))
        .where(User.id == user_id, User.is_active == True)  # noqa: E712
    )
    res = await db.execute(stmt)
    return res.scalar_one_or_none()
