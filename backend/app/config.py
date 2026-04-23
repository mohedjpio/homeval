from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    SUPABASE_URL:        str = ""
    SUPABASE_SERVICE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    GROQ_API_KEY:        str = ""

    # Railway sets env vars as plain strings — parse JSON list or comma-separated
    ALLOWED_ORIGINS_RAW: str = "http://localhost:3000"

    FREE_DAILY_PREDICTIONS: int = 10
    PRO_DAILY_PREDICTIONS:  int = 200
    REDIS_URL:    str = ""
    ML_MODEL_PATH: str = "ml/model.pkl"

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        raw = self.ALLOWED_ORIGINS_RAW.strip()
        # Accept JSON array: ["https://x.vercel.app","http://localhost:3000"]
        if raw.startswith("["):
            try:
                return json.loads(raw)
            except Exception:
                pass
        # Accept comma-separated: https://x.vercel.app,http://localhost:3000
        return [o.strip() for o in raw.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
