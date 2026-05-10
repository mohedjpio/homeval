from pydantic_settings import BaseSettings
from typing import List
import json, secrets

class Settings(BaseSettings):
    # Supabase (new project)
    SUPABASE_URL:         str = "https://ekvoujikbybjvfinsack.supabase.co"
    SUPABASE_SERVICE_KEY: str = ""   # service_role key — fill in .env

    # Our own JWT (not Supabase Auth)
    JWT_SECRET:     str = secrets.token_hex(32)
    JWT_ALGORITHM:  str = "HS256"
    JWT_EXPIRE_DAYS: int = 7

    # Groq
    GROQ_API_KEY: str = ""

    # CORS
    ALLOWED_ORIGINS_RAW: str = "http://localhost:3000"

    # ML
    ML_MODEL_PATH: str = "ml/housing_model.pkl"

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        raw = self.ALLOWED_ORIGINS_RAW.strip()
        if raw.startswith("["): 
            try: return json.loads(raw)
            except: pass
        return [o.strip() for o in raw.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
