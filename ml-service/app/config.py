"""
Configuration — Centralized settings for ML service.

Reads from environment variables with sensible defaults for local dev.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from env / .env file."""

    # ── Supabase ──────────────────────────────────────────────────────────────
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # ── API Security ──────────────────────────────────────────────────────────
    API_KEY: str = "default_test_key"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # ── Model Paths ───────────────────────────────────────────────────────────
    MODEL_DIR: str = "models"
    LEVEL_CLASSIFIER_PATH: str = "models/level_classifier.joblib"
    DIFFICULTY_RECOMMENDER_PATH: str = "models/difficulty_recommender.joblib"

    # ── Feature Engineering ───────────────────────────────────────────────────
    FEATURE_CACHE_TTL_SECONDS: int = 300  # 5 minutes
    MIN_ANSWERS_FOR_ML: int = 15  # Minimum answers before trusting ML over rules

    # ── Level Classification (rules baseline) ─────────────────────────────────
    MIN_ATTEMPTS: int = 5
    INTERMEDIATE_THRESHOLD: float = 0.5
    ADVANCED_THRESHOLD: float = 0.75
    SMOOTHING_ALPHA: float = 2.0

    # ── Server ────────────────────────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False
    LOG_LEVEL: str = "info"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
