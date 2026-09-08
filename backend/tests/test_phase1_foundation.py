"""
Phase 1 Tests — Project Foundation
Exit criteria: backend starts, DB connectivity works, health API responds.
"""

import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    """GET /api/v1/health returns 200 with app info."""
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "CaterConnect"
    assert "version" in data
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_request_id_header(client):
    """Every response includes an X-Request-ID header."""
    response = await client.get("/api/v1/health")
    assert "x-request-id" in response.headers


@pytest.mark.asyncio
async def test_custom_request_id_propagated(client):
    """Client-provided X-Request-ID is echoed back."""
    response = await client.get(
        "/api/v1/health",
        headers={"X-Request-ID": "req_test_custom_id"},
    )
    assert response.headers.get("x-request-id") == "req_test_custom_id"


@pytest.mark.asyncio
async def test_process_time_header(client):
    """Every response includes X-Process-Time-Ms header."""
    response = await client.get("/api/v1/health")
    assert "x-process-time-ms" in response.headers


@pytest.mark.asyncio
async def test_404_unknown_route(client):
    """Unknown routes return 404."""
    response = await client.get("/api/v1/nonexistent")
    assert response.status_code == 404


def test_settings_load():
    """Settings load without raising exceptions."""
    from app.core.config import get_settings

    settings = get_settings()
    assert settings.app_name == "CaterConnect"
    assert settings.app_version == "0.1.0"


def test_security_otp_generation():
    """OTP generation produces 6-digit numeric codes."""
    from app.core.security import generate_otp

    otp = generate_otp()
    assert len(otp) == 6
    assert otp.isdigit()


def test_security_otp_hash_verify():
    """OTP hash verification works correctly."""
    from app.core.security import generate_otp, hash_otp, verify_otp_hash

    otp = generate_otp()
    hashed = hash_otp(otp)
    assert verify_otp_hash(otp, hashed)
    assert not verify_otp_hash("000000", hashed)


def test_security_session_token():
    """Session token can be created and decoded."""
    from app.core.security import create_session_token, decode_session_token

    token = create_session_token("user-123", "CUSTOMER")
    payload = decode_session_token(token)
    assert payload["sub"] == "user-123"
    assert payload["role"] == "CUSTOMER"


def test_human_readable_id_format():
    """Human-readable IDs are correctly formatted."""
    from app.core.security import generate_human_readable_id

    id_ = generate_human_readable_id("CR", 2026, 125)
    assert id_ == "CR-2026-00125"
    id2 = generate_human_readable_id("QT", 2026, 1)
    assert id2 == "QT-2026-00001"
