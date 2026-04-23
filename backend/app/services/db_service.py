"""
Supabase DB service.
Client is created lazily on first use — never at import time.
This prevents startup crashes when env vars haven't loaded yet.
"""
import logging
from functools import lru_cache
from app.config import settings

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_db():
    from supabase import create_client
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_SERVICE_KEY
    if not url or not key:
        logger.error("SUPABASE_URL or SUPABASE_SERVICE_KEY not set!")
        raise RuntimeError("Database not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.")
    return create_client(url, key)
