from functools import lru_cache
from app.config import settings

@lru_cache(maxsize=1)
def get_db():
    from supabase import create_client
    if not settings.SUPABASE_SERVICE_KEY:
        raise RuntimeError("SUPABASE_SERVICE_KEY not set in .env")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
