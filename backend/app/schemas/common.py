"""
CaterConnect Backend — Common API Response Schemas
"""
from typing import Any, Dict, Generic, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class APIErrorDetails(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None


class APIErrorResponse(BaseModel):
    error: APIErrorDetails
    request_id: Optional[str] = None


class StandardResponse(BaseModel, Generic[T]):
    data: T
    message: Optional[str] = None
