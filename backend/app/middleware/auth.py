import logging
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
from app.config import get_settings

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)

# Simple in-memory token cache (replace with Redis in production)
_token_cache: dict[str, dict] = {}


async def verify_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> dict:
    """Verify Supabase JWT and return user payload"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
        )

    token = credentials.credentials

    # Check cache first
    if token in _token_cache:
        return _token_cache[token]

    settings = get_settings()

    # Verify with Supabase
    if settings.supabase_url and settings.supabase_anon_key:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(
                    f"{settings.supabase_url}/auth/v1/user",
                    headers={"Authorization": f"Bearer {token}"},
                )
                if resp.status_code == 200:
                    user_data = resp.json()
                    payload = {
                        "sub": user_data["id"],
                        "email": user_data.get("email"),
                        "role": user_data.get("role", "authenticated"),
                        "user_metadata": user_data.get("user_metadata", {}),
                    }
                    _token_cache[token] = payload
                    return payload
        except Exception as e:
            logger.warning(f"Supabase auth error: {e}")

    # Development fallback: accept demo tokens
    if settings.debug and token.startswith("demo_"):
        payload = {
            "sub": "demo-user-id",
            "email": "demo@homeval.app",
            "role": "authenticated",
            "user_metadata": {"plan": "pro"},
        }
        _token_cache[token] = payload
        return payload

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
    )


async def get_current_user(user: dict = Security(verify_token)) -> dict:
    return user


def clear_token_cache():
    _token_cache.clear()
