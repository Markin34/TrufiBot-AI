from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── AI Provider ──────────────────────────────────────────────
    ai_provider: str = "ollama"          # "ollama" | "anthropic"

    # Anthropic (solo si ai_provider=anthropic)
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-6"

    # Ollama (solo si ai_provider=ollama)
    ollama_model: str = "llama3.2"
    ollama_base_url: str = "http://localhost:11434"

    # ── Supabase ─────────────────────────────────────────────────
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_anon_key: str = ""

    # ── Server ───────────────────────────────────────────────────
    cors_origins: str = "http://localhost:3000"
    port: int = 8000

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
