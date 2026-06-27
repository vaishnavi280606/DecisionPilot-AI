from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Load from environment variables only
    # (Removed explicit env_file configuration to avoid parsing issues)

    app_name: str = "DecisionPilot AI API"
    google_api_key: str = ""
    model_name: str = "gemini-2.5-flash"
    database_url: str = "sqlite:///./decisionpilot.db"
    chroma_dir: str = "./chroma_data"
    cors_origins: List[str] = ["http://localhost:5173"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_origins(cls, value: str | List[str]) -> List[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
