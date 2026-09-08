"""
CaterConnect Backend — Authentication API Endpoints
Implements OTP request, OTP verification, session logout, and current user retrieval.
"""

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.core.config import get_settings
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import (
    CurrentUserOut,
    OTPRequestData,
    OTPRequestIn,
    OTPVerifyData,
    OTPVerifyIn,
)
from app.schemas.common import StandardResponse
from app.services.auth_service import create_otp_challenge, verify_otp_code

router = APIRouter()


@router.post(
    "/otp/request",
    response_model=StandardResponse[OTPRequestData],
    summary="Request a new OTP challenge for login/registration",
    status_code=status.HTTP_200_OK,
)
async def request_otp(
    payload: OTPRequestIn,
    db: AsyncSession = Depends(get_db),
):
    """
    Initiates an OTP authentication challenge for the provided mobile number.
    Rate-limited per phone number (cooldown of 30s, max 5 per hour).
    """
    settings = get_settings()
    challenge, raw_otp = await create_otp_challenge(
        db=db,
        phone_number_raw=payload.phone_number,
        country_code_hint=payload.country_code,
    )

    data = OTPRequestData(
        challenge_id=challenge.id,
        expires_in_seconds=settings.otp_expire_seconds,
        retry_after_seconds=30,
        dev_otp=raw_otp if settings.otp_dev_mode else None,
    )
    return StandardResponse(data=data, message="OTP sent successfully.")


@router.post(
    "/otp/verify",
    response_model=StandardResponse[OTPVerifyData],
    summary="Verify OTP code and create an authenticated session",
    status_code=status.HTTP_200_OK,
)
async def verify_otp(
    payload: OTPVerifyIn,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """
    Verifies the submitted OTP against the challenge.
    On success:
    - Sets an HTTP-only session cookie
    - Returns authenticated user details and bearer token
    """
    settings = get_settings()
    user, session_token = await verify_otp_code(
        db=db,
        challenge_id=payload.challenge_id,
        otp_code=payload.otp,
    )

    # Set secure HTTP-only cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=settings.session_expire_seconds,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/",
    )

    user_out = CurrentUserOut.model_validate(user)
    data = OTPVerifyData(user=user_out, session_token=session_token)
    return StandardResponse(data=data, message="Authentication successful.")


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Invalidate session and clear authentication cookie",
)
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
):
    """
    Logs out the authenticated user by clearing the HTTP-only session cookie.
    """
    settings = get_settings()
    response.delete_cookie(
        key="session_token",
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/",
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/me",
    response_model=StandardResponse[CurrentUserOut],
    summary="Retrieve profile and session details for currently logged-in user",
)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    """
    Returns the authenticated user's profile and contact details.
    """
    user_out = CurrentUserOut.model_validate(current_user)
    return StandardResponse(data=user_out)
