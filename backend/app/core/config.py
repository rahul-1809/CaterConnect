"""
CaterConnect Backend — Core Configuration
Loads all settings from environment variables / .env file.
"""
from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_env: str = "development"
    app_name: str = "CaterConnect"
    app_version: str = "0.1.0"
    debug: bool = False

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Database
    database_url: str = "postgresql+asyncpg://caterconnect:caterconnect@localhost:5432/caterconnect"
    database_pool_size: int = 10
    database_max_overflow: int = 20

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Security
    secret_key: str = "insecure-dev-secret-change-in-production"
    session_expire_seconds: int = 86400
    cookie_secure: bool = False
    cookie_samesite: str = "lax"

    # OTP
    otp_expire_seconds: int = 300
    otp_max_attempts: int = 5
    otp_rate_limit_requests: int = 5
    otp_rate_limit_window_seconds: int = 3600
    otp_dev_mode: bool = True

    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:3001"]

    # Logging
    log_level: str = "INFO"

    # Storage
    storage_bucket: str = "caterconnect-assets"
    storage_endpoint: str = ""
    storage_access_key: str = ""
    storage_secret_key: str = ""

    @field_validator("app_env")
    @classmethod
    def validate_env(cls, v: str) -> str:
        allowed = {"development", "staging", "production", "test"}
        if v not in allowed:
            raise ValueError(f"app_env must be one of {allowed}")
        return v

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def is_test(self) -> bool:
        return self.app_env == "test"


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()
