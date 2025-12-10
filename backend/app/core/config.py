from pydantic_settings import BaseSettings
from typing import List
import json
import os


class Settings(BaseSettings):
    APP_NAME: str = "AI Command Center"
    DEBUG: bool = True

    # API Keys
    ANTHROPIC_API_KEY: str = ""

    # Database
    DATABASE_URL: str = "sqlite:///./app.db"

    # CORS - supports JSON array or comma-separated string
    CORS_ORIGINS: str = '["http://localhost:5173","http://localhost:3000"]'

    @property
    def cors_origins_list(self) -> List[str]:
        origins = self.CORS_ORIGINS.strip()
        # Handle JSON array format
        if origins.startswith("["):
            return json.loads(origins)
        # Handle comma-separated format
        return [o.strip() for o in origins.split(",") if o.strip()]

    # n8n
    N8N_URL: str = "http://localhost:5678"

    # Render-specific: detect if running on Render
    @property
    def is_production(self) -> bool:
        return os.getenv("RENDER", "").lower() == "true" or not self.DEBUG

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
