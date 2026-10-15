from .base import AIProvider
from .anthropic_provider import AnthropicProvider
from .ollama_provider import OllamaProvider


def get_provider(settings) -> AIProvider:
    provider = settings.ai_provider.lower()

    if provider == "anthropic":
        if not settings.anthropic_api_key:
            raise ValueError("ANTHROPIC_API_KEY is required when AI_PROVIDER=anthropic")
        return AnthropicProvider(
            api_key=settings.anthropic_api_key,
            model=settings.anthropic_model,
        )

    if provider == "ollama":
        return OllamaProvider(
            model=settings.ollama_model,
            base_url=settings.ollama_base_url,
        )

    raise ValueError(
        f"Unknown AI_PROVIDER='{settings.ai_provider}'. Valid options: anthropic, ollama"
    )
