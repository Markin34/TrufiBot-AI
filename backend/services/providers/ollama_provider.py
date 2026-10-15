import ollama
from .base import AIProvider


class OllamaProvider(AIProvider):
    def __init__(self, model: str = "llama3.2", base_url: str = "http://localhost:11434"):
        self._model = model
        self._base_url = base_url

    @property
    def name(self) -> str:
        return f"ollama/{self._model}"

    async def chat(self, system: str, messages: list) -> str:
        client = ollama.AsyncClient(host=self._base_url)
        ollama_messages = [{"role": "system", "content": system}] + messages
        response = await client.chat(
            model=self._model,
            messages=ollama_messages,
        )
        msg = response.message if hasattr(response, "message") else response["message"]
        return msg.content if hasattr(msg, "content") else msg["content"]
