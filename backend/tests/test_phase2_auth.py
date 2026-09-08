"""
CaterConnect Backend — Phase 2 Authentication Test Suite
Covers OTP request, OTP verification, rate limiting, session cookies, and /auth/me.
"""

from datetime import UTC, datetime, timedelta

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_otp
from app.models.user import CustomerProfile, OTPChallenge, User, UserRole


@pytest.mark.asyncio
async def test_otp_request_valid_phone(client: AsyncClient):
    """Test requesting an OTP with a valid 10-digit Indian phone number."""
    response = await client.post(
        "/api/v1/auth/otp/request",
        json={"phone_number": "9876543210", "country_code": "+91"},
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert "challenge_id" in data
    assert data["expires_in_seconds"] == 300
    assert data["retry_after_seconds"] == 30
    assert data["dev_otp"] is not None  # In dev mode, raw OTP is returned for testing


@pytest.mark.asyncio
async def test_otp_request_rate_limit_cooldown(client: AsyncClient):
    """Test that requesting another OTP within 30s triggers a 429 rate limit."""
    phone = "9876500001"
    # First request succeeds
    r1 = await client.post(
        "/api/v1/auth/otp/request",
        json={"phone_number": phone, "country_code": "+91"},
    )
    assert r1.status_code == 200

    # Immediate second request fails with 429
    r2 = await client.post(
        "/api/v1/auth/otp/request",
        json={"phone_number": phone, "country_code": "+91"},
    )
    assert r2.status_code == 429
    detail = r2.json()["detail"]
    assert detail["code"] == "AUTH_OTP_RATE_LIMITED"
    assert "retry_after_seconds" in detail


@pytest.mark.asyncio
async def test_otp_request_invalid_phone(client: AsyncClient):
    """Test requesting an OTP with an invalid string phone number."""
    response = await client.post(
        "/api/v1/auth/otp/request",
        json={"phone_number": "invalid_phone", "country_code": "+91"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_otp_verify_new_customer(client: AsyncClient, db_session: AsyncSession):
    """Test that verifying OTP for a new phone creates both User and CustomerProfile."""
    phone = "9111122222"
    req_resp = await client.post(
        "/api/v1/auth/otp/request",
        json={"phone_number": phone, "country_code": "+91"},
    )
    challenge_id = req_resp.json()["data"]["challenge_id"]
    dev_otp = req_resp.json()["data"]["dev_otp"]

    verify_resp = await client.post(
        "/api/v1/auth/otp/verify",
        json={"challenge_id": challenge_id, "otp": dev_otp},
    )
    assert verify_resp.status_code == 200
    data = verify_resp.json()["data"]

    # Verify response body
    user_info = data["user"]
    assert user_info["phone_number"] == "+919111122222"
    assert user_info["role"] == "CUSTOMER"
    assert user_info["is_active"] is True
    assert "session_token" in data

    # Verify session cookie was set
    cookies = verify_resp.cookies
    assert "session_token" in cookies

    # Verify DB records
    user_stmt = select(User).where(User.phone_number == "+919111122222")
    user = (await db_session.execute(user_stmt)).scalar_one()
    assert user is not None
    assert user.customer_profile is not None


@pytest.mark.asyncio
async def test_otp_verify_existing_customer(client: AsyncClient, db_session: AsyncSession):
    """Test that verifying OTP for an existing phone logs in without duplicate user."""
    # Pre-create user with a profile name
    existing_user = User(
        phone_number="+919333344444",
        phone_country_code="+91",
        role=UserRole.CUSTOMER.value,
        is_active=True,
    )
    db_session.add(existing_user)
    await db_session.flush()
    profile = CustomerProfile(
        user_id=existing_user.id, full_name="Rahul Verma", email="rahul@example.com"
    )
    db_session.add(profile)
    await db_session.commit()

    # Request & verify OTP
    req_resp = await client.post(
        "/api/v1/auth/otp/request",
        json={"phone_number": "9333344444", "country_code": "+91"},
    )
    challenge_id = req_resp.json()["data"]["challenge_id"]
    dev_otp = req_resp.json()["data"]["dev_otp"]

    verify_resp = await client.post(
        "/api/v1/auth/otp/verify",
        json={"challenge_id": challenge_id, "otp": dev_otp},
    )
    assert verify_resp.status_code == 200
    user_data = verify_resp.json()["data"]["user"]
    assert user_data["id"] == existing_user.id
    assert user_data["customer_profile"]["full_name"] == "Rahul Verma"


@pytest.mark.asyncio
async def test_otp_verify_invalid_code(client: AsyncClient):
    """Test entering the wrong OTP code increments attempt count."""
    phone = "9444455555"
    req_resp = await client.post(
        "/api/v1/auth/otp/request",
        json={"phone_number": phone, "country_code": "+91"},
    )
    challenge_id = req_resp.json()["data"]["challenge_id"]

    verify_resp = await client.post(
        "/api/v1/auth/otp/verify",
        json={"challenge_id": challenge_id, "otp": "000000"},
    )
    assert verify_resp.status_code == 400
    detail = verify_resp.json()["detail"]
    assert detail["code"] == "AUTH_OTP_INVALID"
    assert detail["attempts_remaining"] == 4


@pytest.mark.asyncio
async def test_otp_verify_max_attempts_exceeded(client: AsyncClient, db_session: AsyncSession):
    """Test that exceeding max attempts (5) locks the challenge."""
    challenge = OTPChallenge(
        phone_number="+919555566666",
        country_code="+91",
        code_hash=hash_otp("123456"),
        expires_at=datetime.now(tz=UTC) + timedelta(minutes=5),
        attempt_count=5,
        max_attempts=5,
    )
    db_session.add(challenge)
    await db_session.commit()
    await db_session.refresh(challenge)

    verify_resp = await client.post(
        "/api/v1/auth/otp/verify",
        json={"challenge_id": challenge.id, "otp": "123456"},
    )
    assert verify_resp.status_code == 429
    detail = verify_resp.json()["detail"]
    assert detail["code"] == "AUTH_OTP_MAX_ATTEMPTS"


@pytest.mark.asyncio
async def test_otp_verify_expired_challenge(client: AsyncClient, db_session: AsyncSession):
    """Test that verifying an expired OTP challenge fails."""
    challenge = OTPChallenge(
        phone_number="+919666677777",
        country_code="+91",
        code_hash=hash_otp("123456"),
        expires_at=datetime.now(tz=UTC) - timedelta(minutes=1),  # Expired
        attempt_count=0,
        max_attempts=5,
    )
    db_session.add(challenge)
    await db_session.commit()
    await db_session.refresh(challenge)

    verify_resp = await client.post(
        "/api/v1/auth/otp/verify",
        json={"challenge_id": challenge.id, "otp": "123456"},
    )
    assert verify_resp.status_code == 400
    detail = verify_resp.json()["detail"]
    assert detail["code"] == "AUTH_OTP_EXPIRED"


@pytest.mark.asyncio
async def test_otp_verify_already_consumed(client: AsyncClient, db_session: AsyncSession):
    """Test that reusing an already consumed OTP challenge fails."""
    challenge = OTPChallenge(
        phone_number="+919777788888",
        country_code="+91",
        code_hash=hash_otp("123456"),
        expires_at=datetime.now(tz=UTC) + timedelta(minutes=5),
        attempt_count=0,
        max_attempts=5,
        consumed_at=datetime.now(tz=UTC),  # Already consumed
    )
    db_session.add(challenge)
    await db_session.commit()
    await db_session.refresh(challenge)

    verify_resp = await client.post(
        "/api/v1/auth/otp/verify",
        json={"challenge_id": challenge.id, "otp": "123456"},
    )
    assert verify_resp.status_code == 400
    detail = verify_resp.json()["detail"]
    assert detail["code"] == "AUTH_OTP_ALREADY_CONSUMED"


@pytest.mark.asyncio
async def test_get_me_flow(client: AsyncClient):
    """Test the complete flow: request -> verify -> /auth/me -> logout."""
    phone = "9888899999"
    # 1. Request OTP
    req_resp = await client.post(
        "/api/v1/auth/otp/request",
        json={"phone_number": phone, "country_code": "+91"},
    )
    challenge_id = req_resp.json()["data"]["challenge_id"]
    dev_otp = req_resp.json()["data"]["dev_otp"]

    # 2. Verify OTP
    verify_resp = await client.post(
        "/api/v1/auth/otp/verify",
        json={"challenge_id": challenge_id, "otp": dev_otp},
    )
    token = verify_resp.json()["data"]["session_token"]

    # 3. GET /auth/me with Bearer token
    me_resp = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_resp.status_code == 200
    me_data = me_resp.json()["data"]
    assert me_data["phone_number"] == "+919888899999"
    assert me_data["role"] == "CUSTOMER"

    # 4. GET /auth/me with Cookie
    cookie_resp = await client.get(
        "/api/v1/auth/me",
        cookies={"session_token": token},
    )
    assert cookie_resp.status_code == 200

    # 5. Logout
    logout_resp = await client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert logout_resp.status_code == 204

    # 6. Unauthenticated /auth/me should fail
    client.cookies.clear()
    unauth_resp = await client.get("/api/v1/auth/me")
    assert unauth_resp.status_code == 401
