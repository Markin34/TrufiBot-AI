from abc import ABC, abstractmethod


class AIProvider(ABC):
    @abstractmethod
    async def chat(self, system: str, messages: list) -> str:
        """Send messages to the AI and return the response text."""
        pass

    @property
    @abstractmethod
    def name(self) -> str:
        pass
