"""
CaterConnect Backend — Common API Response Schemas
"""

from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class APIErrorDetails(BaseModel):
    code: str
    message: str
    details: dict[str, Any] | None = None


class APIErrorResponse(BaseModel):
    error: APIErrorDetails
    request_id: str | None = None


class StandardResponse(BaseModel, Generic[T]):
    data: T
    message: str | None = None
